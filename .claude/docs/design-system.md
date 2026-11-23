# design-system.md

화면 · 컴포넌트 만들 때, Figma 시안 옮길 때 읽기
요약은 CLAUDE.md 스타일 참고

## 시안 위치

- Figma ChaGok 파일 (4YdbrF8MOh62HlcTE1nRQV)
- 디자인 시스템 페이지 Foundation 섹션 (node 1:3)
- 토큰은 전부 src/app/globals.css의 @theme

## Figma 변수 -> Tailwind 클래스

- 변수명의 / 를 - 로, 소문자로
- 예시: Label/Normal -> text-label-normal
- 예시: Background/Normal/Alternative -> bg-background-alternative
- 예시: Line/Normal -> border-line-normal
- Opacity/* 토큰은 투명도로 (bg-primary-40/8)

## 색

- 시맨틱 먼저: label-*, background-*, fill-*, line-*, status-*, interaction-*, material-dimmer
- 없으면 아토믹: primary-*, secondary-*, neutral-*, cool-neutral-*, common-*, status-{red|yellow|green|blue}-*
- 브랜드 색: primary-40 (#a8342a), hover 50, active 60
- 다크 모드 토큰은 시안에 아직 없음

## 글자

- text-{display1|display2|heading1~3|body1~3|label1~3|caption1|caption2}
- 클래스 하나에 크기 · 행간 · 자간(-1%) · 기본 굵기 다 들어있음
- Figma랑 굵기만 다르면 font-*로 덮기
- 예시: Heading2/Semibold -> text-heading2 font-semibold
- 예시: Label1/Medium -> text-label1 font-medium
- 폰트는 Pretendard Variable (src/assets/fonts/, layout.tsx에서 next/font/local로), 기본 font-sans

## 그림자 · 블러

- shadow-{xs|sm|md|lg|xl} = Figma Shadow/Normal/*
- shadow-spread-{sm|md} = Figma Shadow/Spread/*
- shadow-drop-100 = Figma Drop Shadow/100 (0 1 4 0, #0c0c0d 5%), 밝은 화면 흰 카드 (설정)
- 블러: backdrop-blur-chrome (64px)

## 간격 · 레이아웃

- Tailwind 기본 spacing(4px 단위) 그대로 씀
- 시안은 8px(가끔 4px) 기준, 미세 조정은 2px · 1px
- 모바일 375px 기준, 좌우 여백 20px(px-5), 4컬럼
- body에 min-w 안 둠 (375 미만 폰에서 페이지가 375로 유지돼서 가로 스크롤 생김)
- 가로 스크롤 상자(overflow-x-auto) 안에 absolute 요소(sr-only 포함)가 있으면 상자에 relative -> 없으면 화면 밖 항목의 absolute가 페이지 폭을 늘려 가로 스크롤 생김
- 폭에 맞춰 늘고 주는 카드는 간격 · 좌우 여백 고정, 남는 폭을 카드가 나눠 가짐 (카드 비율 5:7 유지)
- 브레이크포인트: 기본 375 / md 768 / xl 1440 (sm, lg, 2xl은 꺼져있음)
- 반응형 (시안 없이 만든 것): 모바일 ~767 최대 430 · 좌우 20 / 태블릿 md 화면 폭 · 좌우 32 / 데스크톱 xl 최대 1200 가운데 · 좌우 여백 없음 ((main)/layout.tsx)
- 화면 끝까지 닿게 하는 -mx-*는 위 여백에 맞춰 md · xl도 같이 (HorizontalScroll, 홈 MyCardList)
- 데스크톱 상자 기준: 히어로 · 사이드 패널(수집 현황)은 상자(bg-common-0/4 또는 배경 이미지 + 둥근 모서리), 콘텐츠 목록(인기 · 곧 개봉 등)은 상자 없이 열린 영역
- 반응형 전 화면은 components/narrow-column/NarrowColumn으로 430 유지 ((main)/(light) layout), 손보면 그 layout에서 빼기
- 컬렉션(/collection) 반응형 (시안 없이 만든 것, 2026-11-22): 카드 그리드 모바일 2열 / md 4열(간격 20 · 32) / xl 6열(간격 24 · 40), 데스크톱은 뒤로가기 숨기고 제목 왼쪽 heading1, 카드 제목 body1 · 정보 label2, 연도 탭은 넘치면 가로 스크롤(HorizontalScroll)
  - 카드 상세(/collection/[cardId], (detail) layout)는 아직 430 고정
- 티켓 인증(/verify) 반응형 (시안 없이 만든 것, 2026-11-22): 입력에 집중하는 흐름이라 가운데 한 열, 상단 헤더 없이 뒤로가기만 (verify/layout.tsx)
  - 태블릿(md): 최대 480, 높이는 화면 그대로 (BottomCta 키보드 계산이 화면 아래 기준이라 높이를 줄이지 않음)
  - 데스크톱(xl): 높이 최대 768 상자를 세로 가운데 (버튼이 화면 맨 아래로 멀어지지 않게)
  - md부터 제목 heading2 -> heading1, 예시 카드 · 읽는 중 일러스트 160×224 -> 200×280 (스캔 선 거리 --scan-distance 224px), 글 상자 높이 200 -> 240
- 데스크톱(xl)은 하단 바 대신 상단 헤더 components/top-nav/TopNav (chagok 로고 · 글자 메뉴 · 알림 · [티켓 인증]), 메뉴 목록은 constants/nav.ts (BottomNav와 같이 씀)

## cn()

- 클래스 합칠 땐 cn() (src/lib/cn.ts)
- globals.css에 텍스트 · 그림자 · 블러 토큰 추가하면 cn.ts의 extendTailwindMerge에도 추가 (안 하면 tailwind-merge가 클래스 잘못 지움)

## 카드 효과 (src/app/card-effects.css)

Tailwind로 쓰기 힘든 효과(포인터 따라 움직이는 그라디언트, mask, ::before/::after, @property, 키프레임)는 여기에 @utility로 만들고 클래스처럼 씀

- 티켓 카드: card-scene, card-tilt, card-parallax, card-face, card-holo, card-glare, card-glare-back, card-sheen, card-back-bg, card-guilloche, card-notched, foil-text, holo-text, holo-ring
- 카드 묶음: card-stack-item(왼쪽 · 아래 그림자), card-holo-static, holo-border
- 작은 카드 그림자: card-mini-shadow (아래 그림자 + 흰 10% 테두리, 관람평 · 컬렉션)
- 테마: ease-spring, animate-card-wobble, animate-card-sheen
- 홀로그램 색은 :root의 --holo-*
- card-scene 붙은 바깥 요소에 포인터 값(--px, --py, --rx, --ry, --hyp, --lift)이 들어가고 안쪽 레이어가 읽어서 움직임
- 새로 만들 땐 Tailwind 기본 클래스랑 이름 안 겹치게 (ring -> holo-ring, text-로 시작하면 tailwind-merge가 헷갈려서 foil-text)
- 움직이는 효과는 prefers-reduced-motion일 때 멈추는 것까지 같이 작성
- 계속 도는 효과는 transform · opacity로만 (background-position · 커스텀 속성(@property) 애니메이션은 매 프레임 다시 그려서 렉)
- 인증 배지 회전 테두리: holo-ring(배지) > holo-ring-frame(링 마스크) > holo-ring-gradient(+ animate-holo-ring), 무지개 정사각형을 rotate로 돌림
- TicketCard active=false(캐러셀 옆 카드)면 빛 쓸기 없음 · 배지 회전 멈춤, 가운데 카드만 움직임

## 아이콘

- 시안 아이콘은 Figma에서 svg로 받아 src/assets/icons/에 두고 next/image로
- svg import는 컴포넌트가 아니라 이미지 객체 -> <Icon /> 말고 <Image src={Icon} />
- 색이 파일에 박혀 있어서 text-*로 색 안 바뀜
- 상태따라 색이 바뀌면 색별로 svg 따로 받아서 바꿔 끼우기 (check / check-active, eye / eye-off)
- 꾸밈 아이콘은 alt="" + aria-hidden

## 공통 컴포넌트 (src/components/)

- Button: 기본 type="submit" -> 폼 안 일반 버튼은 type="button", 페이지 이동은 <Link className={buttonVariants()}>
- Button variant: primary, disable, outline, secondary(어두운 보조, 이미지로 저장), neutral(확인 창 취소), google, kakao / size: xl
- CircleButton: 동그란 소셜 로그인 버튼 (provider: google, kakao), type="button"
- BackButton: onClick 없으면 router.back()
- TextInput: labelText, error, helperText(에러 있으면 에러로 바뀜), suffix
- TextInput suffix는 기본 pointer-events-none -> 버튼 넣으면 pointer-events-auto
- TextInput 나머지 props는 input으로 넘어감 -> {...register()} 바로 사용
- TextInput tone: 기본 dark, 밝은 화면은 tone="light" (흰 바탕 · 어두운 글자)
- TextInput onClear: 넘기면 포커스 없을 때 × 지우기 버튼 (입력 중엔 숨김), 값 있을 때만 넘기기 (`onClear={email ? clearEmail : undefined}`)
- 지우기 핸들러는 setValue("") + clearErrors + setFocus
- PasswordInput: 눈 아이콘(보기/숨기기) 붙은 비밀번호 칸, TextInput props 그대로 받음 (type · suffix 빼고)
- BottomCta: 하단 버튼 영역, 키보드 올라오면 키보드 위로 같이 올라감 (화면 높이 안 넘는 페이지 전제)
- BottomSheet: open, onClose, labelledBy, dismissible(false면 배경 탭 · ESC로 안 닫힘), above(시트 위에 붙는 토스트 등)
- BottomSheet는 포커스 가두기 · 스크롤 잠금 · 닫히면 포커스 복귀까지 처리함
- Toast: message가 null이면 숨김, 위치 · 시간은 쓰는 쪽에서 정함
- TermsContent: constants/terms.ts의 약관 데이터를 그려줌
- TicketCard: flipped, onFlippedChange 넘기면 밖에서 앞뒷면 제어, 안 넘기면 알아서 관리
- TicketCarousel: 가운데 카드에 포커스, scroll-snap + 스크롤 위치로 크기 · 흐림 직접 바꿈 (리렌더 없음), 뒤집힌 카드는 하나만
- TicketCarousel 데스크톱(xl): 캐러셀 영역 양 끝(16 안쪽)에 좌우 화살표(chevron-right.svg, 왼쪽은 rotate-180), 첫 · 마지막 카드면 그쪽 화살표 숨김
- CardStack: 최신순 카드 중 앞 5장만 겹쳐서 보여줌 (13장 넘겨도 5장), 클릭 없음, 카드는 MiniCard
- CardStack은 상자 좌우 폭에 꽉 참: 묶음 <ul>은 폭 100% + 비율 296:112, 카드는 그 안에 absolute로 % 배치 (시안 카드 80, 한 장씩 54씩 오른쪽, 296 기준)
- MiniCard: 기본 80×112 작은 인증 카드 (요즘 내가 본은 100×140으로 className · sizes 덮어씀) (포스터 + 고정 홀로그램 + VERIFIED 배지), CardStack · 최근 남긴 관람평 · 컬렉션 그리드에서 씀. 크게 쓰면 sizes 넘기기
- Dialog: 화면 가운데 확인 창 (네이티브 <dialog> showModal). open, onClose, labelledBy, describedBy. 카드 삭제 확인에서 씀
- TicketInfo: 티켓 카드 아래 제목 + 개봉일 | 국가 | 장르 (홈 캐러셀 · 카드 상세)
- 어두운 화면의 바텀시트는 className="bg-neutral-80 px-5 text-static-white"로 덮어씀 (정렬 · 카드 메뉴)
- HorizontalScroll: 화면 끝까지 닿는 가로 스크롤 <ul> (레이아웃 px-5를 -mx-5로 상쇄), 각 <li>에 snap-start, 간격 · grid는 className으로
- HorizontalScroll <ul>에 relative 있음 -> 안의 sr-only가 스크롤 밖으로 안 빠짐 (빼지 않기)
- Avatar: 동그란 프로필 사진 (src 없으면 assets/imgs/profile.png), size는 sizes용 px, 크기는 className으로
- BottomNav: (main) 레이아웃 공통 하단 바 (시안 Tab Bar / Liquid Glass). 343×64 어두운 유리 알약(glass-bar), 화면 아래에서 34 띄움(시안 홈 바 영역, 안전 영역이 더 크면 그 값), 아이콘만(글자는 aria-label) → (main) 레이아웃 아래 여백은 40 + 안전 영역만 (바가 스크롤하면 숨어서 바 높이만큼 안 비움)
- BottomNav 칸: 5칸 균등(grid-cols-5), 현재 탭 뒤 밝은 알약(glass-pressed)은 칸 폭 × 52 하나만 두고 탭이 바뀌면 미끄러져 이동(누르는 순간 출발), 아래로 스크롤하면 숨김 · 위로 올리면 다시
- BottomNav 아이콘: 평소 xxx-gray.svg, 현재 탭 xxx-white.svg (home, collection, ranking, my), 인증은 48 빨간 원(bg-primary-40 + tab-primary: 흰 30% 0.5 테두리 · 안쪽 흰 12% · 바깥 0 4 14 primary-40 35%) 안의 certification.svg

## 홈 (/)

- 섹션: MyCardList(캐러셀) -> CollectedCardInMonth -> PopularMovies(요즘 인기 있는 🔥) -> UpcomingMovies(곧 개봉해요 🎬), 1 · 2번 섹션 사이 40 (캐러셀 아래 여백 30 + mt-2.5), 2번부터 섹션 사이 60 (mt-15)
- 태블릿(md): 한 줄 그대로, 가로 스크롤 유지, 이번 달 카드만 왼쪽 글자 · 버튼 / 오른쪽 카드 묶음(296)
- 데스크톱(xl): 히어로 둥근 상자 = 왼쪽 360 인사(display1) · 카드 수 · [내 컬렉션 보기] / 오른쪽 캐러셀(양 끝 흐려짐, 스크롤 영역에만 mask), 히어로 알림 아이콘은 숨김(헤더에 있음)
- 데스크톱(xl) 아래 2단 = 왼쪽 360 "내 수집 현황" 패널 · 오른쪽 인기(5줄 2열, 포스터 100×150) + 곧 개봉(5열 그리드)
- 내 수집 현황(CollectedCardInMonth의 xl): 제목 · 카드 묶음 · 올해 누적/지난 달보다 큰 숫자 · 월별 막대(MonthlyCountChart, 최근 6개월, 이번 달만 primary-40) · 많이 본 포맷(TopFormats) · 버튼. 약 730 높이, 화면 높이 848 이상일 때만 sticky
- 내 카드 · 수집 현황은 cards 실데이터 (2026-11-23): page.tsx에서 getMyCards 한 번 → (main)/_data/home-cards.ts buildHomeCards로 계산
  - 수집 현황(이번 달 · 올해 누적 · 지난 달보다 · 카드 묶음 · 월별 막대 · 많이 본 포맷)은 카드 받은 날(cards.created_at, KST) 기준 ("모은" 기록이라서, 컬렉션 연도 탭은 관람일 기준이라 다름), 이번 달 · 올해는 KST 오늘 기준
  - 캐러셀: 최근 관람순 10장, 카드 누르면 뒤집기만 (상세 이동 없음)
  - 많이 본 포맷: 올해 받은 카드의 format(2D 포함) 상위 3개, 같은 수면 이름순
  - 카드 묶음은 이번 달에 받은 카드 최근 받은순
  - 0장 (시안 없이 만든 것): 캐러셀 자리에 같은 크기 점선 빈 칸 + [티켓 인증하기](/verify), 이번 달 0장이면 카드 묶음 자리에 점선 빈 칸, 버튼 문구는 카드 0장이면 "티켓 인증하기"
  - [다른 티켓 인증하기] → /verify
- 데스크톱(xl) 글자 한 단계 크게: 섹션 제목 heading3 semibold, 영화 제목 body1 semibold, 부가 정보 caption1 -> label2
- 인사: 닉네임 없으면 "안녕하세요!", 카드 수는 cards 전체 장수
- 섹션 제목 + 화살표는 (main)/_components/SectionHeader, 전체 보기 페이지 생기면 href 넘기기
- (main)/_mocks/home.ts에는 홈에서 뺀 "요즘 내가 본" 목데이터만 남음
- 인기 영화 · 곧 개봉은 실제 데이터: src/lib/movies/home.ts (getPopularMovies, getUpcomingMovies), 타입은 lib/movies/types.ts, 기준은 product.md 영화 데이터
- 영화 포스터는 (main)/_components/MoviePosterImage (못 찾으면 회색 빈 칸)
- 불러오기 실패 · 0편이면 섹션 안에 안내 문구
- 요즘 내가 본(RecentReviews): 홈에서 뺌 (컴포넌트 · 목데이터는 남아 있음). 상자 276×132 · 안쪽 여백 16, MiniCard 100×140이 위로 24 튀어나옴, 글자는 왼쪽 140부터 (제목 label2 · 빨간 별 star-red.svg + 별점 label2 · 공유 리뷰 body2 최대 2줄), 누르는 동작 없음
- 곧 개봉 뱃지: 개봉까지 남은 날, 당일은 D-Day, D-10 미만 primary-40, 이상 neutral-70
- 아직 없는 아이콘 (자리만 비워둠): 별(관람평 별점, 컬렉션 카드 아래 별점)

## 컬렉션 (/collection)

- (main) 안이라 하단 바 있음, 헤더는 BackButton + 가운데 "컬렉션"
- 연도 탭: 관람한 해 기준, 카드 있는 해만 최신 해부터 (전체 · 2026 · 2025), 고르면 제목이 "2026 n장"
- 정렬: "최근 관람순 ∨" 누르면 바텀시트 (최근 관람순 · 오래된 관람순 · 별점 높은순), 기본은 최근 관람순, 고른 항목은 bg-neutral-75
- 별점이 같으면 최근 관람순
- 연도 · 정렬은 URL 쿼리 (?year=2026&sort=rating), 기본값은 쿼리에서 뺌 -> 상세 갔다 와도 유지
- 정렬 옵션 · URL 만드는 함수는 constants/collection.ts (SORT_OPTIONS, collectionHref)
- 그리드: 2열, 좌우 간격 15.5px · 상하 24px, 카드는 폭에 맞춰 커짐 (375에서 약 160×224, 430에서 약 187×262)
- 카드 아래: 제목 + 포맷 뱃지, 관람일 · 별점 (시안 없이 추가한 것)
- 카드 + 아래 정보 전체가 상세 링크, 0장이면 "아직 모은 카드가 없어요"
- 데이터: cards 테이블 (src/lib/cards/my-cards.ts getMyCards · getMyCard, 컬렉션 · 상세 같이 씀), 목데이터 mocks/cards.ts는 삭제 (2026-11-22)

## 카드 상세 (/collection/[cardId])

- app/(detail) 안이라 하단 바 없음 (같은 경로를 (main)에 또 만들면 충돌)
- 헤더: X(닫기) · ⋮(카드 메뉴)
- 카드 탭하면 뒤집힘, 위 안내 문구도 같이 바뀜 (탭하면 뒷면으로 / 다시 탭하면 앞면으로)
- X · [확인]: 컬렉션으로 (히스토리 있으면 router.back, 링크로 바로 들어왔으면 replace("/collection"))
- [이미지로 저장]: TODO
- ⋮ 메뉴 시트: 관람평 수정 · 이미지로 저장 · 공유하기 (TODO, 지금은 시트만 닫힘), 카드 삭제 (빨간 글자, 위와 간격 띄움)
- 카드 삭제 -> 시트 닫고 화면 가운데 Dialog "카드를 삭제할까요? / 삭제한 카드는 복구할 수 없어요." [취소] [삭제하기], 삭제는 TODO
- 없는 cardId면 notFound()

## 랭킹 (/ranking)

- (main) 안이라 하단 바 있음, 헤더는 BackButton + 가운데 "랭킹" (컬렉션과 같은 모양)
- 반응형 (시안 없이 만든 것, 2026-11-23)
  - 태블릿(md): 한 줄 그대로, 내 순위 띠는 화면 끝까지(-mx-8), 시상대는 가운데 최대 480, 목록은 폭 그대로
  - 데스크톱(xl): 컬렉션처럼 뒤로가기 숨기고 제목 왼쪽 heading1, 아래 2단 = 왼쪽 360 내 순위 패널 · 오른쪽 시상대(가운데 최대 560) + 목록 (홈 아래 2단과 같은 비율)
  - 내 순위 패널(xl): 둥근 상자, 트로피 128을 위 가운데에 선명하게, 글자 label2 -> body1 · heading2 -> display2 · caption1 -> label2, sticky top-26 (홈 수집 현황과 같은 위치)
  - 시상대(xl): 왕관 64 · 사진 80 · 이름 body1 · 장수 label2 · 받침 56 높이 heading3, 빛 360
  - 목록(xl): 줄 80 · px-6, 사진 48, 순위 · 이름 body1, 장수 label2
- 순서: "YYYY.MM.DD 00:00 기준" (caption1 neutral-50) -> 내 순위 띠 -> 1~3위 시상대 -> 4~100위 목록
- 기준: 받은 카드 전체 누적 장수, 매일 00:00(KST) 집계, 0장은 빠짐, 공동 순위(4 · 4 · 4 · 7), 같은 순위 안에서는 그 장수에 먼저 도달한 사람이 위. 월별 · 분기별은 사용자 생긴 뒤
- 데이터: src/lib/ranking/get-ranking.ts (rankings · ranking_runs, supabase.md)
- 내 순위(MyRankBox): 화면 끝까지 닿는 띠 120 높이, bg-common-0/8, 왼쪽 trophy.png 160 · 투명도 20%(시안 값, 띠 아래로 잘림) + 뒤 trophy-glow.png는 투명도 그대로 (같이 20%로 하면 안 보임), 글자 가운데
  - "{닉네임} 님 현재 랭킹" label2 / "N위" heading2 bold / "상위 N% · {위 순위}위까지 N장 남았어요" caption1 (강조는 medal-gold)
  - 시안 없이 만든 것: 1위면 상위 % 없이 "지금 1위예요!", 카드는 있는데 집계 전이면 "집계 전 / 매일 00:00 집계에 들어가요", 0장이면 "순위 없음" + /verify 링크
  - 상위 N% = 올림(내 순위 / 순위에 든 사람 수 × 100), 최소 1
- 시상대(Podium): 3칸 grid gap-4, DOM은 1 · 2 · 3위 순서 그대로 두고 칸만 2 · 1 · 3으로 (col-start). 가운데 칸만 20 위로(mb-5) + shadow-medal-gold(0 -8 32 #e3a948 22%) + 뒤에 podium-glow.png(250, opacity 40)
  - 왕관 crown-{gold|silver|bronze}.png 56 (숫자 그려져 있음), 칸 위로 32 튀어나옴
  - 위 칸: 사진 60 · 이름 label1 semibold · 장수 caption1 (1위만 금색), 배경 색 16% -> 흰 4% 세로 그라디언트 + 테두리 색 45%
  - 받침: 높이 46, neutral-85(시안 1D1C1B) 위에 색 34% -> 12% + 테두리 45%(위 없음), 숫자 body1 semibold (금 · 흰 · 동)
  - 메달 색은 순위로 정함 (공동 1위면 금 · 금 · 동)
  - 색 토큰: medal-gold #e3a948, medal-silver #c3c8d0, medal-bronze #c98b5a (globals.css, 시맨틱 없음)
- 목록(RankingList): bg-common-0/4 둥근 상자, 줄 72 · px-5, 순위(w-5 가운데) · 사진 40 · 이름 label1 semibold · 오른쪽 장수 caption1, 줄 사이 line-alternative
- 아무도 없으면(집계 전 · 0명) "아직 랭킹에 오른 사람이 없어요"
- 추가 (시안 없이 만든 것, 2026-11-23)
  - 순위 변화 RankChangeBadge: ▲N(red-40) · ▼N(blue-40) · -(neutral-50) · NEW(medal-gold), 첫 집계면 안 보임. 내 순위 숫자 옆 · 시상대 장수 옆 · 목록 순위 아래
  - 내 줄: 목록에서 bg-common-0/8 + 이름 옆 "나"(primary-40 작은 뱃지), id="my-rank" (scroll-mt 모바일 16 · xl 112)
  - [내 순위로 이동]: 내 줄이 목록(4~100위)에 있을 때만. 모바일 · 태블릿은 기준 시각 줄 오른쪽 글자 링크, 데스크톱은 내 순위 패널 안 outline 버튼. 시상대 · 100위 밖 · 집계 전이면 없음
  - 랭킹 기준 안내 RankingGuide: 모바일 · 태블릿은 목록 아래, 데스크톱은 내 순위 패널 아래 (패널과 같이 sticky)
- 시안 캡처만 보고 값을 잰 것: 간격 · 크기 · 트로피 · 빛 투명도 -> 시안과 대조 필요

## 밝은 화면 ((main)/(light) · (detail)/(light))

- 하단 바 있음 (main)/(light): 마이 /my, 프로필 편집 /my/edit, 알림 /notifications, 나의 감상 /my/comments, 관람 리뷰 /my/reviews
- 하단 바 없음 (detail)/(light): 설정 /settings와 하위 페이지
- 두 (light)/layout.tsx 모두 components/light-screen/LightScreen: data-light-screen + 글자색 text-label-normal, globals.css의 body:has([data-light-screen])가 body 배경을 background-alternative로 (fixed 배경 div로 하면 하단 바 없는 화면에서 Safari 툴바가 body의 어두운 색으로 보임)
- 헤더는 components/page-header/PageHeader: 흰 바탕 sticky, back={{ href }}(그 경로로) 또는 back={{ fallback }}(이전 화면, 없으면 fallback으로 replace), right에 아이콘 · 버튼
- 빈 화면 문구는 components/empty-state/EmptyState
- 어두운 아이콘: 뒤로가기 chevron-left-black.svg, 종 bell-dark.svg (bell.svg의 흰색을 #171719로 바꾼 것)
- 메뉴 > 화살표는 chevron-left-black.svg에 rotate-180

## 마이 (/my)

- 헤더: < (홈으로) · 마이 · 종(/notifications) · 톱니(/settings)
- 프로필: 사진 · 닉네임 · 회색 연필(/my/edit)
- 보유 카드 · 나의 감상 개수는 cards 테이블 (getMyCardCounts, 나의 감상 = 카드 메모가 있는 카드)
- 메뉴: 나의 감상(/my/comments), 관람 리뷰(/my/reviews) -> 지금은 "준비 중이에요"
- 버전: constants/app.ts APP_VERSION

## 프로필 편집 (/my/edit)

- [저장]은 헤더 버튼 (form 속성으로 폼 제출), 바뀐 게 있고 닉네임 규칙에 맞을 때만 파란색(status-info), 아니면 interaction-inactive
- 저장하면 updateProfile 액션 -> /my로 redirect(replace)
- 닉네임: 가입과 같은 규칙(nicknameField, 한글 · 영문 · 숫자 2~20자, 띄어쓰기 X), onBlur 검사 + 입력하면 에러 지움, 중복이면 "이미 사용 중인 닉네임이에요."
- 사진 연필 배지(profile-edit.svg) -> 바텀시트: 앨범에서 선택 / 기본 이미지로 변경(지금 기본 이미지면 숨김)
- 고른 사진은 미리보기만, [저장] 때 업로드 (크롭 없음, 가운데 정사각형으로 자름)
- 카카오 프로필 사진은 안 씀

## 설정 (/settings)

- (detail)/(light) 안이라 하단 바 없음, 헤더는 다른 밝은 화면처럼 흰색 (캡처는 회색이지만 통일)
- 메뉴는 settings/_constants.ts SETTINGS_SECTIONS (계정 · 알림 · 기록 관리 · 도움말)
- 프로필 편집 -> /my/edit, 나머지(연결된 계정 · 서비스 알림 · 휴지통 · 카드 내보내기 · 문의하기 · 개인정보 처리 방침)는 /settings/... "준비 중이에요"
- 개인정보 처리 방침 문서는 아직 없음 (terms.ts privacy는 가입용 수집·이용 동의라 다른 문서)
