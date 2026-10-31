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
- 블러: backdrop-blur-chrome (64px)

## 간격 · 레이아웃

- Tailwind 기본 spacing(4px 단위) 그대로 씀
- 시안은 8px(가끔 4px) 기준, 미세 조정은 2px · 1px
- 모바일 375px 기준, 좌우 여백 20px(px-5), 4컬럼
- body에 min-w 안 둠 (375 미만 폰에서 페이지가 375로 유지돼서 가로 스크롤 생김)
- 가로 스크롤 상자(overflow-x-auto) 안에 absolute 요소(sr-only 포함)가 있으면 상자에 relative -> 없으면 화면 밖 항목의 absolute가 페이지 폭을 늘려 가로 스크롤 생김
- 폭에 맞춰 늘고 주는 카드는 간격 · 좌우 여백 고정, 남는 폭을 카드가 나눠 가짐 (카드 비율 5:7 유지)
- 브레이크포인트: 기본 375 / md 768 / xl 1440 (sm, lg, 2xl은 꺼져있음)

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
- CardStack: 최신순 카드 중 앞 5장만 겹쳐서 보여줌 (13장 넘겨도 5장), 클릭 없음, 카드는 MiniCard
- CardStack은 상자 좌우 폭에 꽉 참: 묶음 <ul>은 폭 100% + 비율 296:112, 카드는 그 안에 absolute로 % 배치 (시안 카드 80, 한 장씩 54씩 오른쪽, 296 기준)
- MiniCard: 80×112 작은 인증 카드 (포스터 + 고정 홀로그램 + VERIFIED 배지), CardStack · 최근 남긴 관람평 · 컬렉션 그리드에서 씀. 크게 쓰면 sizes 넘기기
- Dialog: 화면 가운데 확인 창 (네이티브 <dialog> showModal). open, onClose, labelledBy, describedBy. 카드 삭제 확인에서 씀
- TicketInfo: 티켓 카드 아래 제목 + 개봉일 | 국가 | 장르 (홈 캐러셀 · 카드 상세)
- 어두운 화면의 바텀시트는 className="bg-neutral-80 px-5 text-static-white"로 덮어씀 (정렬 · 카드 메뉴)
- HorizontalScroll: 화면 끝까지 닿는 가로 스크롤 <ul> (레이아웃 px-5를 -mx-5로 상쇄), 각 <li>에 snap-start, 간격 · grid는 className으로
- HorizontalScroll <ul>에 relative 있음 -> 안의 sr-only가 스크롤 밖으로 안 빠짐 (빼지 않기)
- BottomNav: (main) 레이아웃 공통 하단 바, 화면 아래 고정 → (main) 레이아웃이 아래 여백(바 60 + 안전 영역 + 30) 잡아둠
- BottomNav 아이콘: 평소 xxx.svg, 현재 페이지면 xxx-filled.svg (home, collection, ranking, mypage), 인증은 certification.svg 하나 (빨간 원 안 흰색)

## 홈 (/)

- 섹션: MyCardList(캐러셀) -> CollectedCardInMonth -> RecentReviews -> PopularMovies -> EndingSoonMovies, 2번부터 섹션 사이 60 (mt-15)
- 섹션 제목 + 화살표는 (main)/_components/SectionHeader, 전체 보기 페이지 생기면 href 넘기기
- 목데이터는 (main)/_mocks/home.ts (타입도 여기), 실제 데이터 생기면 여기만 교체
- 곧 상영 종료 뱃지: D-10 미만 primary-40, 이상 neutral-70
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
- 목데이터는 src/mocks/cards.ts (컬렉션 · 상세 같이 씀), 연도 탭 확인용 2025 기록도 들어 있음

## 카드 상세 (/collection/[cardId])

- app/(detail) 안이라 하단 바 없음 (같은 경로를 (main)에 또 만들면 충돌)
- 헤더: X(닫기) · ⋮(카드 메뉴)
- 카드 탭하면 뒤집힘, 위 안내 문구도 같이 바뀜 (탭하면 뒷면으로 / 다시 탭하면 앞면으로)
- X · [확인]: 컬렉션으로 (히스토리 있으면 router.back, 링크로 바로 들어왔으면 replace("/collection"))
- [이미지로 저장]: TODO
- ⋮ 메뉴 시트: 관람평 수정 · 이미지로 저장 · 공유하기 (TODO, 지금은 시트만 닫힘), 카드 삭제 (빨간 글자, 위와 간격 띄움)
- 카드 삭제 -> 시트 닫고 화면 가운데 Dialog "카드를 삭제할까요? / 삭제한 카드는 복구할 수 없어요." [취소] [삭제하기], 삭제는 TODO
- 없는 cardId면 notFound()
