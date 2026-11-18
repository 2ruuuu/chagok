import type { Ticket } from "@/components/ticket-card/TicketCard";
import TicketCarousel from "@/components/ticket-carousel/TicketCarousel";

/** TMDB 포스터 (홈 인기 영화에서 실제로 쓰는 이미지). 카드가 360(2배 720)이라 w780 */
const tmdbPoster = (path: string) => `https://image.tmdb.org/t/p/w780${path}`;

// 예시 데이터 (홈 "요즘 인기 있는" 영화로 만든 가짜 관람 기록, 최신 관람순)
// 개봉일 · 국가 · 원제 · 극장 · 좌석 · 소감은 지어낸 값
const tickets: Ticket[] = [
  {
    title: "오디세이",
    originalTitle: "THE ODYSSEY",
    poster: tmdbPoster("/8ze9OcVuFiy94s6FFPvsn4oC2e1.jpg"),
    format: "IMAX",
    theater: "CGV 용산아이파크몰",
    screen: "IMAX관",
    watchedAt: "2026.10.29",
    showtime: "19:30",
    seat: "H열 14번",
    review: "172분이 짧게 느껴지는 바다",
    releasedAt: "2026.07.17.",
    country: "미국",
    genres: ["액션", "모험"],
    certificateId: "CHG-261029-0013",
    comment: "아이맥스로 본 게 신의 한 수. 파도 장면에서 숨 참고 봄",
  },
  {
    title: "타짜: 벨제붑의 노래",
    originalTitle: "TAZZA",
    poster: tmdbPoster("/ueigb5zra1tj6FTK9yhh2P33P9B.jpg"),
    format: "DOLBY",
    theater: "메가박스 코엑스",
    screen: "돌비시네마",
    watchedAt: "2026.10.25",
    showtime: "21:10",
    seat: "F열 9번",
    review: "판이 커졌는데 긴장감은 그대로",
    releasedAt: "2026.10.01.",
    country: "한국",
    genres: ["범죄", "드라마"],
    certificateId: "CHG-261025-0012",
    comment: "마지막 판에서 소름. 전편 다시 보고 싶어짐",
  },
  {
    title: "룩백",
    originalTitle: "LOOK BACK",
    poster: tmdbPoster("/ehl2Du38qbg9M2cqfoVPUKgVDTy.jpg"),
    format: "2D",
    theater: "CGV 연남",
    screen: "3관",
    watchedAt: "2026.10.19",
    showtime: "14:20",
    seat: "E열 7번",
    review: "짧은데 오래 남는 영화",
    releasedAt: "2026.10.08.",
    country: "일본",
    genres: ["애니메이션", "드라마"],
    certificateId: "CHG-261019-0011",
  },
  {
    title: "암살자(들)",
    originalTitle: "ASSASSINS",
    poster: tmdbPoster("/c55ijsOdntj6P25vDwHLdgsBpmV.jpg"),
    format: "SCREENX",
    theater: "CGV 여의도",
    screen: "SCREENX관",
    watchedAt: "2026.10.12",
    showtime: "18:40",
    seat: "J열 12번",
    review: "양옆 화면까지 쓰는 액션이 시원함",
    releasedAt: "2026.10.08.",
    country: "한국",
    genres: ["범죄", "액션"],
    certificateId: "CHG-261012-0010",
    comment: "스크린X로 볼 만했음",
  },
  {
    title: "클레이페이스",
    originalTitle: "CLAYFACE",
    poster: tmdbPoster("/LSGpoSAlitss0KOvVakkeUToZo.jpg"),
    format: "4DX",
    theater: "CGV 왕십리",
    screen: "4DX관",
    watchedAt: "2026.10.05",
    showtime: "22:00",
    seat: "D열 5번",
    review: "무서운데 4DX라 웃겼음",
    releasedAt: "2026.09.11.",
    country: "미국",
    genres: ["공포(호러)"],
    certificateId: "CHG-261005-0009",
  },
  {
    title: "극장판 치이카와: 인어 섬의 비밀",
    originalTitle: "CHIIKAWA",
    poster: tmdbPoster("/5TMyytCI5Pfc9c1eNsljiCdiB05.jpg"),
    format: "2D",
    theater: "롯데시네마 월드타워",
    screen: "7관",
    watchedAt: "2026.10.02",
    showtime: "11:00",
    seat: "G열 10번",
    review: "귀여움으로 98분 버팀",
    releasedAt: "2026.09.24.",
    country: "일본",
    genres: ["애니메이션"],
    certificateId: "CHG-261002-0008",
    comment: "하치와레 나올 때마다 옆자리랑 같이 웃음",
  },
];

const CardDemoPage = () => {
  return (
    <main className="flex flex-1 flex-col justify-center gap-4 overflow-hidden">
      <TicketCarousel tickets={tickets} />
    </main>
  );
};

export default CardDemoPage;
