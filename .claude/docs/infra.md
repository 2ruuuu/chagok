# infra.md

환경 변수 · 배포 · cron · 폰으로 개발 서버 접속할 때 읽기

## 환경 변수

- 목록은 .env.example, 실제 값은 .env.local (git에 안 올라감)
- NEXT_PUBLIC_SUPABASE_URL: 공개 가능, Vercel Config
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 공개 가능, Vercel Config
- SUPABASE_SECRET_KEY: 비공개 (RLS 우회 키), Vercel Secret (아직 Vercel에 안 넣음)
- CRON_SECRET: 비공개, Vercel Secret
- DISCORD_WEBHOOK_URL: 비공개, 새 검수 요청 알림용 디스코드 웹훅 (src/lib/discord.ts, 서버에서만), Vercel에도 넣어야 함
- KOBIS_API_KEY: 비공개, 영화진흥위원회 오픈API 키 (kobis.or.kr/kobisopenapi), Vercel에도 넣어야 함
- TMDB_ACCESS_TOKEN: 비공개, TMDB API Read Access Token (비상업 개인 용도로 발급), Vercel에도 넣어야 함
- NEXT_PUBLIC_ 붙은 건 빌드할 때 번들에 박힘 -> Vercel에서 값 바꾸면 재배포해야 적용
- 코드에서 꺼낼 땐 src/lib/env.ts의 getSupabaseEnv() / requireEnv(process.env.XXX, "XXX") 사용 (`!` 금지)
- process.env[name]처럼 동적으로 꺼내지 않기 (NEXT_PUBLIC_ 값이 번들에 안 박혀서 브라우저에서 undefined)

## 배포

- main에 push하면 Vercel Production으로 바로 배포 (chagok-eight.vercel.app)
- Vercel Hobby 플랜
- 함수 리전 icn1(서울): vercel.json regions. Supabase가 ap-northeast-2(서울)라 맞춤 (기본값 iad1이면 DB 조회마다 미국 왕복)

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

## 랭킹 집계 cron

- vercel.json: 매일 15:00 UTC (한국 00:00), Hobby라 최대 1시간 늦을 수 있음 -> 기준 시각은 refresh_rankings가 00:00으로 고정
- src/app/api/cron/rankings/route.ts: CRON_SECRET 확인 후 admin-client로 refresh_rankings 호출
- 확인 방법은 keep-alive와 같음 (Request Logs requestPath:/api/cron/rankings)
- 로컬: curl -H "Authorization: Bearer $(grep '^CRON_SECRET=' .env.local | cut -d= -f2-)" http://localhost:3000/api/cron/rankings

## 폰으로 개발 서버 접속

- next.config.ts의 allowedDevOrigins랑 Supabase Redirect URLs에 같은 사설 IP가 있어야 함
- 지금 값: 192.168.*.*, 172.30.*.*, 10.64.120.123 (Redirect URLs는 Supabase 대시보드에서 확인)
- 172.*.*.* 통째로 열지 않기
- iPhone Safari가 예전 CSS를 계속 쓸 때가 있음 (새로고침해도 그대로) -> 새로 만든 클래스만 안 먹어서 크기 0 · 간격 없음처럼 보임
- 폰에서만 깨지면 코드 고치기 전에 개인정보 보호 탭이나 새 탭으로 먼저 확인
- 아이폰 핫스팟(통신사 데이터)에 맥북을 붙이면 IPv6 전용이라 맥북에 IPv4 주소가 없음 (ipconfig getifaddr en0이 비어 있음)
  - next dev의 Network 주소 192.0.0.x는 맥북 안의 가상 주소라 폰에서 안 닿음
  - 이럴 땐 터널: 개발 서버 켠 채로 npx cloudflared tunnel --url http://localhost:3000 -> https://xxxx.trycloudflare.com 주소로 폰 접속 (https라 PWA 테스트에도 맞음)
  - allowedDevOrigins에 *.trycloudflare.com 있음. 터널 주소는 누구나 들어올 수 있으니 테스트 끝나면 끄기
  - 로그인 · OAuth를 터널 주소로 하려면 Supabase Redirect URLs에도 추가해야 함
- 학교 · 회사 · 카페 Wi-Fi는 기기끼리 통신을 막는 경우가 많음 (같은 Wi-Fi여도 폰에서 안 열림)
- 그래도 이상하면 화면에 측정값 띄우는 임시 컴포넌트로 확인 (getComputedStyle, document.styleSheets에 새 클래스 있는지)

## Claude Code 설정

- CLAUDE.md, .claude/docs, .claude/skills, .agents/, skills-lock.json, .mcp.json은 커밋함
- 개인 설정(.claude/settings.local.json, .claude/backup/, CLAUDE.local.md)만 .gitignore
- .mcp.json: Figma MCP (https://mcp.figma.com/mcp)
- .claude/skills/agent-browser: 외부에서 설치한 브라우저 확인용 스킬 (.agents/에 실제 파일)
