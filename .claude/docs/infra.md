# infra.md

환경 변수 · 배포 · cron · 폰으로 개발 서버 접속할 때 읽기

## 환경 변수

- 목록은 .env.example, 실제 값은 .env.local (git에 안 올라감)
- NEXT_PUBLIC_SUPABASE_URL: 공개 가능, Vercel Config
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 공개 가능, Vercel Config
- SUPABASE_SECRET_KEY: 비공개 (RLS 우회 키), Vercel Secret (아직 Vercel에 안 넣음)
- CRON_SECRET: 비공개, Vercel Secret
- NEXT_PUBLIC_ 붙은 건 빌드할 때 번들에 박힘 -> Vercel에서 값 바꾸면 재배포해야 적용
- 코드에서 꺼낼 땐 src/lib/env.ts의 getSupabaseEnv() / requireEnv(process.env.XXX, "XXX") 사용 (`!` 금지)
- process.env[name]처럼 동적으로 꺼내지 않기 (NEXT_PUBLIC_ 값이 번들에 안 박혀서 브라우저에서 undefined)

## 배포

- main에 push하면 Vercel Production으로 바로 배포 (chagok-eight.vercel.app)
- Vercel Hobby 플랜

## keep-alive cron

Supabase 무료 플랜은 한동안 안 쓰면 일시정지됨 -> 매일 한 번 DB 조회해서 막음

- Supabase Cron(pg_cron)이 아니라 Vercel Cron 씀 (Supabase Integrations의 Cron은 "not installed"가 정상)
- vercel.json: 매일 03:00 UTC (한국 정오쯤), Hobby라 최대 1시간 늦을 수 있음
- src/app/api/cron/keep-alive/route.ts: Authorization: Bearer $CRON_SECRET 확인 후 keep_alive 테이블 조회
- auth.getSession()은 쿠키만 읽고 Supabase에 요청 안 보냄 -> keep-alive로 못 씀, 꼭 실제 테이블 조회

잘 돌고 있는지 확인

- Vercel -> Settings -> Cron Jobs에서 Run 누르고 Logs에서 확인
- Runtime Logs는 console 출력만 보임 (성공하면 아무것도 안 찍어서 비어있음)
- Request Logs에서 requestPath:/api/cron/keep-alive 로 보면 상태 코드 나옴
- 200 정상 / 401 CRON_SECRET 문제 / 500 Supabase 조회 실패
- Hobby는 로그가 최근 1시간만 남음 -> 정오에 돈 건 오후엔 안 보임

로컬에서 확인

curl -H "Authorization: Bearer $(grep '^CRON_SECRET=' .env.local | cut -d= -f2-)" http://localhost:3000/api/cron/keep-alive

## 폰으로 개발 서버 접속

- next.config.ts의 allowedDevOrigins랑 Supabase Redirect URLs에 같은 사설 IP가 있어야 함
- 지금 값: 192.168.*.*, 172.30.*.*, 10.64.120.123 (Redirect URLs는 Supabase 대시보드에서 확인)
- 172.*.*.* 통째로 열지 않기
- iPhone Safari가 예전 CSS를 계속 쓸 때가 있음 (새로고침해도 그대로) -> 새로 만든 클래스만 안 먹어서 크기 0 · 간격 없음처럼 보임
- 폰에서만 깨지면 코드 고치기 전에 개인정보 보호 탭이나 새 탭으로 먼저 확인
- 그래도 이상하면 화면에 측정값 띄우는 임시 컴포넌트로 확인 (getComputedStyle, document.styleSheets에 새 클래스 있는지)

## Claude Code 설정

- CLAUDE.md, .claude/docs, .claude/skills, .agents/, skills-lock.json, .mcp.json은 커밋함
- 개인 설정(.claude/settings.local.json, .claude/backup/, CLAUDE.local.md)만 .gitignore
- .mcp.json: Figma MCP (https://mcp.figma.com/mcp)
- .claude/skills/agent-browser: 외부에서 설치한 브라우저 확인용 스킬 (.agents/에 실제 파일)
