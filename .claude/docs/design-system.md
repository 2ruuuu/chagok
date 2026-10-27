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
- 브레이크포인트: 기본 375 / md 768 / xl 1440 (sm, lg, 2xl은 꺼져있음)

## cn()

- 클래스 합칠 땐 cn() (src/lib/cn.ts)
- globals.css에 텍스트 · 그림자 · 블러 토큰 추가하면 cn.ts의 extendTailwindMerge에도 추가 (안 하면 tailwind-merge가 클래스 잘못 지움)

## 카드 효과 (src/app/card-effects.css)

Tailwind로 쓰기 힘든 효과(포인터 따라 움직이는 그라디언트, mask, ::before/::after, @property, 키프레임)는 여기에 @utility로 만들고 클래스처럼 씀

- 티켓 카드: card-scene, card-tilt, card-parallax, card-face, card-holo, card-glare, card-glare-back, card-sheen, card-back-bg, card-guilloche, card-notched, foil-text, holo-text, holo-ring
- 카드 묶음: card-stack-item, card-holo-static, holo-border
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
- Button variant: primary, disable, outline, google, kakao / size: xl
- CircleButton: 동그란 소셜 로그인 버튼 (provider: google, kakao), type="button"
- BackButton: onClick 없으면 router.back()
- TextInput: labelText, error, helperText(에러 있으면 에러로 바뀜), suffix
- TextInput suffix는 기본 pointer-events-none -> 버튼 넣으면 pointer-events-auto
- TextInput 나머지 props는 input으로 넘어감 -> {...register()} 바로 사용
- BottomCta: 하단 버튼 영역, 키보드 올라오면 키보드 위로 같이 올라감 (화면 높이 안 넘는 페이지 전제)
- BottomSheet: open, onClose, labelledBy, dismissible(false면 배경 탭 · ESC로 안 닫힘), above(시트 위에 붙는 토스트 등)
- BottomSheet는 포커스 가두기 · 스크롤 잠금 · 닫히면 포커스 복귀까지 처리함
- Toast: message가 null이면 숨김, 위치 · 시간은 쓰는 쪽에서 정함
- TermsContent: constants/terms.ts의 약관 데이터를 그려줌
- TicketCard: flipped, onFlippedChange 넘기면 밖에서 앞뒷면 제어, 안 넘기면 알아서 관리
- TicketCarousel: 가운데 카드에 포커스, scroll-snap + 스크롤 위치로 크기 · 흐림 직접 바꿈 (리렌더 없음), 뒤집힌 카드는 하나만
- CardStack: 최신순 카드 중 앞 5장만 겹쳐서 보여줌, 클릭 없음
