import { NextResponse } from "next/server";
import { z } from "zod";
import { renderCardImage } from "@/lib/card-image/render";
import { createClient } from "@/lib/supabase/server";

/**
 * 카드 공유 · 저장 이미지 (PNG 1080×1920). 본인 카드만 (cards RLS)
 * 발급 완료 화면의 [이미지로 저장] · [공유하기]에서 씀, 카드 상세도 cards로 바뀌면 같이 씀
 */
export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/cards/[cardId]/image">,
) {
  const { cardId } = await params;
  if (!z.uuid().safeParse(cardId).success) {
    return NextResponse.json(
      { error: "카드를 찾을 수 없어요." },
      { status: 404 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const { data: card, error } = await supabase
    .from("cards")
    .select("id, movies(title, poster_url, released_on, country, genres)")
    .eq("id", cardId)
    .maybeSingle()
    .overrideTypes<
      {
        id: string;
        movies: {
          title: string;
          poster_url: string | null;
          released_on: string | null;
          country: string;
          genres: string[];
        } | null;
      },
      { merge: false }
    >();

  if (error) {
    console.error("[cards/image] 카드 조회 실패", error);
    return NextResponse.json(
      { error: "잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
  if (!card?.movies) {
    return NextResponse.json(
      { error: "카드를 찾을 수 없어요." },
      { status: 404 },
    );
  }

  try {
    return await renderCardImage({
      title: card.movies.title,
      posterUrl: card.movies.poster_url,
      releasedAt: card.movies.released_on
        ? `${card.movies.released_on.replaceAll("-", ".")}.`
        : "",
      country: card.movies.country,
      genres: card.movies.genres,
    });
  } catch (renderError) {
    console.error("[cards/image] 이미지 생성 실패", renderError);
    return NextResponse.json(
      { error: "이미지를 만들지 못했어요." },
      { status: 500 },
    );
  }
}
