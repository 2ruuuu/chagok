import { NextResponse } from "next/server";
import type { RecognizeResult } from "@/app/verify/_stores/useVerifyStore";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { createClient } from "@/lib/supabase/server";
import {
  type ExtractedTicket,
  extractTicket,
  type ImageMediaType,
} from "@/lib/ticket/extract";
import { buildRecognizedTicket } from "@/lib/ticket/display";
import { findMovie } from "@/lib/ticket/movie";
import {
  isAutoChain,
  normalizeBookingNumber,
  normalizeChain,
  normalizeSeat,
  normalizeTheater,
  resolveShowtime,
} from "@/lib/ticket/normalize";
import { findTheater } from "@/lib/ticket/theaters";

/**
 * 티켓 인식 (ticket-verify.md)
 * 사진 받기 -> LLM 값 추출 -> 코드로 정규화 · 대조 -> 원본 저장 -> tickets에 holding(30분)으로 기록
 * 판정은 전부 여기서 함. 클라이언트는 사진만 보내고, user_id도 세션에서 꺼냄
 */

// LLM 추출이 4초 안팎, 영화 대조까지 여유 있게
export const maxDuration = 30;

const BUCKET = "ticket-images";
// 앱에서 긴 변 1600px jpeg로 줄여 보내서 보통 1MB 안쪽. 압축이 안 된 경우 대비 (버킷 제한과 같음)
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const EXTENSIONS: Record<ImageMediaType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const HOLD_MS = 30 * 60 * 1000;
const FINGERPRINT_STATUSES = ["holding", "pending", "verified"];

const isImageType = (type: string): type is ImageMediaType =>
  type in EXTENSIONS;

const errorResponse = (status: number, error: string) =>
  NextResponse.json({ error }, { status });

const result = (body: RecognizeResult) => NextResponse.json(body);

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return errorResponse(401, "로그인이 필요해요.");

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("image");
  if (
    !(file instanceof File) ||
    !isImageType(file.type) ||
    file.size === 0 ||
    file.size > MAX_IMAGE_BYTES
  ) {
    return errorResponse(400, "이미지를 확인해 주세요.");
  }
  const mediaType = file.type;
  const image = Buffer.from(await file.arrayBuffer());

  let extracted: ExtractedTicket;
  try {
    extracted = await extractTicket(image, mediaType, request.signal);
  } catch (error) {
    console.error("[verify/recognize] 추출 실패", error);
    return errorResponse(502, "티켓을 읽지 못했어요.");
  }

  // 티켓이 아님 · 여러 장 (예약 · 결제 내역 화면도 여기)
  if (!extracted.is_ticket || extracted.ticket_count !== 1) {
    return result({ status: "unreadable" });
  }

  const showtimeResult = resolveShowtime({
    year: extracted.show_year,
    monthDay: extracted.show_month_day,
    weekday: extracted.show_weekday,
    time: extracted.show_time,
  });
  // TODO: 아직 상영 전인 티켓 전용 안내가 없어서 일단 "알아보지 못했어요"로
  if (!showtimeResult.ok && showtimeResult.reason === "future") {
    return result({ status: "unreadable" });
  }
  const showtime = showtimeResult.ok ? showtimeResult.showtime : null;

  const chain = normalizeChain(extracted.chain);
  // 자동 인증 대상 체인 (3사)만, 아니면 null
  const autoChain = isAutoChain(chain) ? chain : null;
  const theaterName = normalizeTheater(extracted.theater);
  const standardTheater =
    autoChain && theaterName ? findTheater(autoChain, theaterName) : null;
  const theater = standardTheater ?? theaterName;
  const normalizedSeats = extracted.seats.map(normalizeSeat);
  const seats = [...new Set(normalizedSeats.filter((seat) => seat !== null))];
  const seat = seats.length === 1 ? seats[0] : null;
  const bookingNumber = normalizeBookingNumber(extracted.reservation_number);

  let movie =
    showtime && extracted.movie_title
      ? await findMovie(extracted.movie_title, showtime.date)
      : null;
  // TODO: 포스터 없는 영화를 4번 화면에 그릴 빈 포스터가 없어서 일단 검수로
  if (movie && !movie.poster) movie = null;

  // 하나라도 있으면 자동 인증하지 않고 검수 (pending 사유는 검수할 때 보려고 저장)
  const reviewReasons = [
    !autoChain && (chain === null ? "chain_unknown" : "other_chain"),
    autoChain && !standardTheater && "theater_not_found",
    !showtimeResult.ok && `showtime_${showtimeResult.reason}`,
    showtime?.yearGuessed && "year_guessed",
    !movie && "movie_not_found",
    seats.length === 0 && "seat_missing",
    normalizedSeats.includes(null) && "seat_unparsed",
    extracted.confidence === "low" && "low_confidence",
  ].filter((reason): reason is string => typeof reason === "string");

  const admin = createAdminClient();
  const now = new Date();

  // 영화는 movies에 1행씩 (카드 · 관람평이 참조). 이미 있으면 최신 정보로 덮어씀
  let movieId: string | null = null;
  if (movie) {
    const { data, error } = await admin
      .from("movies")
      .upsert(
        {
          kobis_code: movie.kobisCode,
          tmdb_id: movie.tmdbId,
          title: movie.title,
          original_title: movie.originalTitle,
          poster_url: movie.poster,
          production_year: movie.productionYear,
          runtime: movie.runtime,
          director: movie.director,
          cast_members: movie.cast,
          grade: movie.grade,
          released_on: movie.releasedAt,
          country: movie.country,
          genres: movie.genres,
          updated_at: now.toISOString(),
        },
        { onConflict: "kobis_code" },
      )
      .select("id")
      .single();
    if (error) {
      console.error("[verify/recognize] 영화 저장 실패", error);
      return errorResponse(500, "잠시 후 다시 시도해 주세요.");
    }
    movieId = data.id;
  }

  // 지문 정리: 내 임시 상태(다시 올렸을 때 자기 자신 때문에 막히지 않게) + 만료된 임시 상태
  const releaseMine = await admin
    .from("tickets")
    .update({ status: "released" })
    .eq("status", "holding")
    .eq("user_id", user.id);
  const releaseExpired = await admin
    .from("tickets")
    .update({ status: "released" })
    .eq("status", "holding")
    .lt("hold_expires_at", now.toISOString());
  if (releaseMine.error || releaseExpired.error) {
    console.error(
      "[verify/recognize] 임시 상태 정리 실패",
      releaseMine.error ?? releaseExpired.error,
    );
    return errorResponse(500, "잠시 후 다시 시도해 주세요.");
  }

  // 좌석이 여러 개면 좌석을 고를 때 지문을 잡음. 남은 좌석이 하나도 없으면 지금 막음
  if (seats.length > 1 && chain && theater && showtime) {
    const { count, error } = await admin
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .eq("chain", chain)
      .eq("theater", theater)
      .eq("screened_at", showtime.screenedAt.toISOString())
      .in("seat", seats)
      .in("status", FINGERPRINT_STATUSES);
    if (error) {
      console.error("[verify/recognize] 좌석 중복 확인 실패", error);
      return errorResponse(500, "잠시 후 다시 시도해 주세요.");
    }
    if ((count ?? 0) >= seats.length) return result({ status: "duplicate" });
  }

  // 원본은 검수 · 이의 제기 근거로 보관 (보관 기한은 ticket-verify.md "업로드")
  const ticketId = crypto.randomUUID();
  const imagePath = `${user.id}/${ticketId}.${EXTENSIONS[mediaType]}`;
  const upload = await admin.storage
    .from(BUCKET)
    .upload(imagePath, image, { contentType: mediaType });
  if (upload.error) {
    console.error("[verify/recognize] 이미지 저장 실패", upload.error);
    return errorResponse(500, "잠시 후 다시 시도해 주세요.");
  }

  const insert = await admin.from("tickets").insert({
    id: ticketId,
    user_id: user.id,
    status: "holding",
    chain,
    theater,
    screen: extracted.screen,
    screened_at: showtime?.screenedAt.toISOString() ?? null,
    seats,
    seat,
    booking_number: bookingNumber,
    movie_title: extracted.movie_title,
    movie_id: movieId,
    image_path: imagePath,
    extracted,
    review_reason: reviewReasons.join(",") || null,
    hold_expires_at: new Date(now.getTime() + HOLD_MS).toISOString(),
  });
  if (insert.error) {
    await admin.storage.from(BUCKET).remove([imagePath]);
    // 지문 unique에 걸림 = 누가 이미 인증했거나 인증 중인 티켓 (동시 요청 포함)
    if (insert.error.code === "23505") return result({ status: "duplicate" });
    console.error("[verify/recognize] tickets 기록 실패", insert.error);
    return errorResponse(500, "잠시 후 다시 시도해 주세요.");
  }

  // 영화 정보를 보여줄 수 없으면 사진만 접수 (자동 인증이 어려운 티켓 화면)
  if (!movie || !showtime) return result({ status: "unsupported", ticketId });

  const ticket = buildRecognizedTicket({
    ticketId,
    // 포스터 없는 영화는 위에서 걸러서 여기선 항상 있음
    movie: { ...movie, poster: movie.poster ?? "" },
    chain,
    theater,
    rawTheater: extracted.theater,
    screen: extracted.screen,
    screenedAt: showtime.screenedAt,
    seats,
    seat,
    needsReview: reviewReasons.length > 0,
  });
  return result({ status: "recognized", ticket });
}
