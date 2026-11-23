import { ImageResponse } from "next/og";
import { loadCardImageFonts } from "./fonts";

/**
 * 카드 공유 · 저장 이미지 (ticket-verify.md 8번 화면, 카드 상세 화면 구성).
 * 흐린 포스터 배경 + 카드 앞면(포스터 + VERIFIED 배지) + 제목 + 개봉일 | 국가 | 장르
 * 1080×1920 (인스타 스토리 비율). next/og(Satori)라 블러 · 3D · 홀로그램 같은 CSS 효과는 못 씀
 * -> 배경 블러는 작은 포스터(w92)를 크게 늘려서 흐리게 보이게 함
 */

export const CARD_IMAGE_WIDTH = 1080;
export const CARD_IMAGE_HEIGHT = 1920;

// 배경 포스터: 작은 포스터(w92)를 화면보다 1.6배 크게 늘려 글자 · 얼굴이 안 읽히게 흐리게
const BACKGROUND_SCALE = 1.6;
const BACKGROUND_WIDTH = CARD_IMAGE_WIDTH * BACKGROUND_SCALE;
const BACKGROUND_HEIGHT = CARD_IMAGE_HEIGHT * BACKGROUND_SCALE;

const CARD_WIDTH = 600;
const CARD_HEIGHT = 840; // 5:7

// TicketCard 앞면 배지 아이콘 (assets/icons/badge-check.svg 그대로, 크기만 28로)
const BADGE_ICON = `data:image/svg+xml;base64,${Buffer.from(
  `<svg width="28" height="28" viewBox="0 0 4 4" fill="none" xmlns="http://www.w3.org/2000/svg"> <g clip-path="url(#clip0_846_213)"> <path d="M0.570311 1.27691C0.548687 1.1795 0.552008 1.07822 0.579964 0.982439C0.60792 0.88666 0.659607 0.799491 0.730232 0.729014C0.800857 0.658536 0.888134 0.607032 0.983971 0.579276C1.07981 0.551521 1.1811 0.548413 1.27846 0.57024C1.33205 0.486433 1.40587 0.417464 1.49312 0.36969C1.58037 0.321916 1.67824 0.296875 1.77772 0.296875C1.87719 0.296875 1.97507 0.321916 2.06232 0.36969C2.14957 0.417464 2.22339 0.486433 2.27698 0.57024C2.37448 0.548318 2.47595 0.551412 2.57194 0.579235C2.66793 0.607058 2.75532 0.658705 2.82599 0.729374C2.89666 0.800043 2.94831 0.887436 2.97613 0.983426C3.00395 1.07942 3.00705 1.18088 2.98513 1.27839C3.06893 1.33197 3.1379 1.4058 3.18568 1.49305C3.23345 1.5803 3.25849 1.67817 3.25849 1.77765C3.25849 1.87712 3.23345 1.975 3.18568 2.06225C3.1379 2.1495 3.06893 2.22332 2.98513 2.27691C3.00695 2.37427 3.00385 2.47556 2.97609 2.57139C2.94833 2.66723 2.89683 2.75451 2.82635 2.82513C2.75587 2.89576 2.66871 2.94745 2.57293 2.9754C2.47715 3.00336 2.37586 3.00668 2.27846 2.98506C2.22494 3.06918 2.15106 3.13845 2.06366 3.18644C1.97626 3.23442 1.87817 3.25958 1.77846 3.25958C1.67875 3.25958 1.58066 3.23442 1.49326 3.18644C1.40585 3.13845 1.33198 3.06918 1.27846 2.98506C1.1811 3.00688 1.07981 3.00377 0.983971 2.97602C0.888134 2.94826 0.800857 2.89676 0.730232 2.82628C0.659607 2.7558 0.60792 2.66863 0.579964 2.57286C0.552008 2.47708 0.548687 2.37579 0.570311 2.27839C0.48586 2.22494 0.416298 2.15101 0.368096 2.06346C0.319893 1.97591 0.294617 1.87759 0.294617 1.77765C0.294617 1.67771 0.319893 1.57939 0.368096 1.49184C0.416298 1.40429 0.48586 1.33035 0.570311 1.27691Z" stroke="white" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M1.33331 1.77738L1.62961 2.07367L2.2222 1.48108" stroke="white" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"/> </g> <defs> <clipPath id="clip0_846_213"> <rect width="3.55556" height="3.55556" fill="white"/> </clipPath> </defs> </svg>`,
).toString("base64")}`;

export type CardImageData = {
  title: string;
  /** TMDB 포스터 URL (w342 등). 없으면 회색 카드 */
  posterUrl: string | null;
  /** 2026.07.15. */
  releasedAt: string;
  country: string;
  genres: string[];
};

/** TMDB 이미지 크기만 바꿈 (/w342/ -> /w500/) */
const tmdbSize = (url: string, size: string) =>
  url.replace(/\/(w\d+|original)\//, `/${size}/`);

export const renderCardImage = async (data: CardImageData) => {
  const fonts = await loadCardImageFonts();
  const meta = [data.releasedAt, data.country, data.genres.join(", ")].filter(
    Boolean,
  );

  return new ImageResponse(
    <div
      style={{
        width: CARD_IMAGE_WIDTH,
        height: CARD_IMAGE_HEIGHT,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        backgroundColor: "#111111",
        fontFamily: "Pretendard",
      }}
    >
      {data.posterUrl && (
        // biome-ignore lint/performance/noImgElement: next/og는 img만 씀
        <img
          src={tmdbSize(data.posterUrl, "w92")}
          alt=""
          width={BACKGROUND_WIDTH}
          height={BACKGROUND_HEIGHT}
          style={{
            position: "absolute",
            top: (CARD_IMAGE_HEIGHT - BACKGROUND_HEIGHT) / 2,
            left: (CARD_IMAGE_WIDTH - BACKGROUND_WIDTH) / 2,
            width: BACKGROUND_WIDTH,
            height: BACKGROUND_HEIGHT,
            objectFit: "cover",
            opacity: 0.35,
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: CARD_IMAGE_WIDTH,
          height: CARD_IMAGE_HEIGHT,
          backgroundImage:
            "linear-gradient(180deg, rgba(10,10,12,0.6) 0%, rgba(10,10,12,0.45) 45%, rgba(10,10,12,0.9) 100%)",
        }}
      />

      <div
        style={{
          display: "flex",
          position: "relative",
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          borderRadius: 40,
          overflow: "hidden",
          backgroundColor: "#2a2a2e",
          border: "2px solid rgba(255,255,255,0.12)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.55)",
        }}
      >
        {data.posterUrl && (
          // biome-ignore lint/performance/noImgElement: next/og는 img만 씀
          <img
            src={tmdbSize(data.posterUrl, "w780")}
            alt=""
            width={CARD_WIDTH}
            height={CARD_HEIGHT}
            style={{
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
              objectFit: "cover",
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            top: 28,
            right: 28,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px 10px 14px",
            borderRadius: 999,
            backgroundColor: "rgba(0,0,0,0.5)",
            border: "1.5px solid rgba(255,255,255,0.35)",
          }}
        >
          {/* biome-ignore lint/performance/noImgElement: next/og는 img만 씀 */}
          <img src={BADGE_ICON} alt="" width={28} height={28} />
          <span
            style={{
              color: "#ffffff",
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: 2,
            }}
          >
            VERIFIED
          </span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          marginTop: 64,
          maxWidth: 920,
          color: "#ffffff",
          fontSize: 60,
          fontWeight: 600,
          lineHeight: 1.3,
          textAlign: "center",
          justifyContent: "center",
        }}
      >
        {data.title}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginTop: 20,
          maxWidth: 920,
          color: "rgba(255,255,255,0.72)",
          fontSize: 32,
          fontWeight: 400,
        }}
      >
        {meta.map((item, index) => (
          <div
            key={item}
            style={{ display: "flex", alignItems: "center", gap: 20 }}
          >
            {index > 0 && (
              <div
                style={{
                  width: 2,
                  height: 26,
                  backgroundColor: "rgba(255,255,255,0.35)",
                }}
              />
            )}
            <span>{item}</span>
          </div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 96,
          display: "flex",
          color: "rgba(255,255,255,0.55)",
          fontSize: 30,
          fontWeight: 600,
          letterSpacing: 4,
        }}
      >
        차곡
      </div>
    </div>,
    {
      width: CARD_IMAGE_WIDTH,
      height: CARD_IMAGE_HEIGHT,
      fonts,
      headers: {
        // 본인 카드만 받는 주소라 공유 캐시 금지. 내용(영화 정보)은 잘 안 바뀌어서 브라우저에서만 1시간
        "Cache-Control": "private, max-age=3600",
      },
    },
  );
};
