# CLAUDE.md

차곡 작업할 때 매번 지킬 것만 적어둠
자세한 건 .claude/docs/ 에 있음

## 프로젝트

차곡: 영화 티켓으로 관람 인증하고, 본 영화를 카드로 모으는 아카이브
인증이 번거로운 건 일부러 그런 것
쉽게 얻으면 모을 이유가 없음
"더 편하게" 바꾸자는 제안은 이 방향이랑 안 부딪히는지 먼저 생각하기

## 명령어

npm run dev
npm run build
npm run lint(biome check)
npm run format
npx tsc --noEmit

- Biome만 씀 (ESLint, Prettier 없음). 테스트 아직 없음
- 코드 고치면 tsc, lint 둘 다 통과 시키고 끝내기

## 기술 스택

- Next.js 16 App Router(src/)
- React 19 + React Compiler
- TS strict
- Tailwind v4
- Supabase
- Vercel
- TanStack Query (아직 사용 안함)
- Zustand (아직 사용 안함)
- 별칭 @/* = src/*

## 폴더 구조

- app/(auth): 로그인 · 회원가입
- app/(main): 로그인 이후 메인 화면
- components/: 공통 컴포넌트
- lib/supabase/: 클라이언트 3개 + proxy
- hooks: 훅들
- constants: 상수들
- 한 라우트에서만 사용하면 _components/
- 여러 곳에서 사용하면 components/

## 코드 규칙

- 폴더: kebab-case, 예시(ticket-card)
- 컴포넌트: PascalCase, 예시(TicketCard.tsx)
- 대소문자만 바꿀 땐 git mv (안 할 시 Vercel 빌드 깨짐)
- UI 라이브러리 안씀, variant는 cva + cn()
- 서버 액션: Promise<{ error }> 반환, 성공 시 redirect. 액션 안에서도 권한 체크
- 폼: react-hook-form + zod, 스키마는 클라이언트 · 서버 공유. watch 대신 useWatch
- 한글 입력: mode "onBlur" + 입력 시 clearErrors
- props 타입은 컴포넌트 바로 위에 interface XxxProps {} 로 작성, (props가 유니온이어야 하는 경우만 type)
- 그 외 타입(데이터 모델, 유니온, z.infer 등)은 type
- 컴포넌트는 화살표 함수로 만들고 파일 맨 아래에서 export default
- 사용자에게 보이는 문구는 해요체
- 뒤로가기로 돌아오면 안 되는 이동은 router.replace
- useMemo, useCallback은 안 씀 (React Compiler가 해줌)
- 꾸밈 이미지는 alt="" + aria-hidden, 아이콘만 있는 버튼은 aria-label

## 스타일

- Tailwind 클래스만
- CSS 모듈, 인라인 style 안 씀 (JS로 계산하는 동적 값만 예외)
- 복잡한 효과는 @utility로 (src/app/card-effects.css), 토큰은 src/app/globals.css
- 기본 색 · 글자 크기 · 그림자 · 브레이크포인트가 꺼져있음
- text-sm, bg-[#...] 금지 -> 토큰 사용
- 색은 시맨틱 토큰 먼저, 없으면 아토믹
- 글자는 text-heading2 같은 클래스 하나로, 굵기만 font-*로 덮기
- 모바일 퍼스트 (기본 375 / md 768 / xl 1440), 좌우 여백 px-5
- 토큰 추가하면 cn.ts의 extendTailwindMerge에도 추가

## 아이콘 규칙

- 시안에 있는 아이콘은 Figma에서 svg로 받아 assets/icons/에 두고 next/image로
- 시안에 없는 아이콘이 나오면 물어보기

## Supabase

- 브라우저 client.ts / 서버 server.ts(await) / RLS 우회 admin-client.ts (서버만)
- 새 테이블은 RLS + 정책 + grant 같이 (grant 없으면 42501)
- 스키마는 마이그레이션으로만
- SQL Editor에서 테이블 건드리지 않기

## 문서

- 기획 판단 필요할 때: .claude/docs/product.md
- 화면 · 컴포넌트 · Figma: .claude/docs/design-system.md
- DB: .claude/docs/supabase.md
- 로그인 · 회원가입: .claude/docs/auth.md
- 환경 변수 · 배포 · cron: .claude/docs/infra.md

## 물어보고 할 것 / 하지 말 것

- db push, git push는 먼저 물어보기 (main push = 바로 배포)
- .env.local 건드리지 않기, 시크릿 키 코드에 넣지 않기
- admin-client.ts를 @supabase/ssr로 바꾸지 않기

## 버전 주의

- Next 16: middleware.ts 대신 src/proxy.ts
- Next 16: Image의 priority 대신 preload
- Next 16: params, searchParams는 await 해서 씀. 타입은 PageProps<"/경로">, LayoutProps<"/경로">
- Zod 4: z.string().email() 대신 z.email(), 에러 문구는 message 대신 error

## 지금 상태

- 끝: 이메일 가입/로그인, 티켓 카드 · 캐러셀 · 카드 묶음, 홈 레이아웃(목데이터)
- 남음: 소셜 로그인 연결
- 다음: 티켓 인증 -> 카드 아카이브 (인증 방식 미정)