import sample1 from "@/assets/imgs/verify-sample-1.webp";
import sample2 from "@/assets/imgs/verify-sample-2.webp";
import sample3 from "@/assets/imgs/verify-sample-3.webp";
import { getPopularMovies } from "@/lib/movies/home";
import VerifyStart from "./_components/VerifyStart";

const SAMPLE_COUNT = 3;

/** 박스오피스를 못 불러오거나 포스터가 3장 안 될 때 쓰는 가상 포스터 */
const FALLBACK_POSTERS = [sample1, sample2, sample3];

/**
 * 시작 화면 예시 카드: 어제 박스오피스 상위 영화 포스터 3장 (홈 "요즘 인기 있는"과 같은 데이터, 캐시돼 있음).
 * 포스터 저작권은 배급사에 있음 -> 정보 목적 사용, TMDB 출처 표시는 설정 화면 (product.md 영화 데이터)
 */
const VerifyPage = async () => {
  const movies = await getPopularMovies();
  const posters = movies
    .map((movie) => movie.poster)
    .filter((poster) => typeof poster === "string")
    // 카드가 160px이라 3배 화면에서 흐려 보이지 않게 홈(w342)보다 큰 w500으로
    .map((poster) => poster.replace("/w342/", "/w500/"))
    .slice(0, SAMPLE_COUNT);

  const samplePosters =
    posters.length === SAMPLE_COUNT ? posters : FALLBACK_POSTERS;

  return <VerifyStart samplePosters={samplePosters} />;
};

export default VerifyPage;
