import { NextResponse } from "next/server";
import { renderCardImage } from "@/lib/card-image/render";
import { getPopularMovies } from "@/lib/movies/home";

/**
 * 공유 이미지 디자인 확인용 (개발 모드에서만, 로그인 없이). 박스오피스 1위 영화로 그림
 * http://localhost:3000/api/cards/preview-image
 */
export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  try {
    const [movie] = await getPopularMovies();
    return await renderCardImage({
      title: movie?.title ?? "호프",
      posterUrl: typeof movie?.poster === "string" ? movie.poster : null,
      releasedAt: "2026.07.15.",
      country: "한국",
      genres: movie?.genre ? [movie.genre] : ["SF", "스릴러"],
    });
  } catch (error) {
    // 개발용이라 원인을 그대로 보여줌
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
