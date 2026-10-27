# supabase.md

테이블 · 정책 · RPC 추가할 때, DB 조회 코드 짤 때 읽기
요약은 CLAUDE.md Supabase 참고

## 클라이언트 (src/lib/supabase/)

- client.ts: Client Component(브라우저), publishable key, RLS 적용
- server.ts: Server Component · Route Handler · Server Action, publishable key + 쿠키 세션, RLS 적용
- admin-client.ts: 관리자 기능만 (서버에서만), SUPABASE_SECRET_KEY, RLS 우회

- server.ts는 안에서 cookies() 써서 async -> await createClient()
- admin-client.ts는 @supabase/supabase-js로 쿠키 없이 만듦, 동기 함수라 createAdminClient()
- admin-client.ts를 @supabase/ssr로 바꾸면 로그인 사용자 JWT로 요청이 나가서 RLS 우회 안 됨 -> 바꾸지 않기
- 보안은 키 숨기기가 아니라 RLS로 지킴

## DB 바꾸는 방법

Supabase CLI(devDependency) + supabase/migrations/로 관리, 원격 프로젝트에 link 되어있음

npx supabase migration new <이름>   # supabase/migrations/<타임스탬프>_<이름>.sql 생성
npx supabase db push --dry-run      # 뭐가 반영될지 미리 보기
npx supabase db push                # 원격 DB에 반영 (먼저 물어보기)
npx supabase migration list         # 로컬 · 원격 이력 비교

- Docker 없어서 db pull, supabase start(로컬 DB)는 못 씀
- 테이블 · 제약 · 함수 · 정책은 꼭 마이그레이션으로 (SQL Editor에서 바꾸면 기록이랑 안 맞음)
- 데이터만 고치는 일회성 SQL은 SQL Editor에서 해도 됨
- SQL로 만든 테이블에 anon, authenticated 권한이 자동으로 안 붙음 -> grant 같이 쓰기 (안 하면 42501 permission denied)

## 새 테이블 만들 때 순서

1. create table + 제약 조건
2. alter table ... enable row level security
3. 정책 (조회 · 작성 · 수정 · 삭제 중 필요한 것만)
4. grant (필요한 권한만, 컬럼 단위로 줄 수 있으면 컬럼만)
5. --dry-run으로 확인 -> 물어보고 db push
6. 아래 "지금 있는 테이블"에 추가

## SQL 작성 규칙 (기존 마이그레이션 기준)

- 정책에서 auth.uid()는 (select auth.uid())로 감싸기 (행마다 다시 계산 안 하게)
- security definer 함수는 set search_path = '' 붙이고 테이블은 public.xxx처럼 스키마까지 쓰기
- 함수는 revoke execute ... from public 하고 필요한 역할에만 grant execute
- 사용자가 조작하면 안 되는 값(시각 등)은 컬럼 update 권한 주지 말고 RPC로만 기록
- 마이그레이션 맨 위에 무엇을 왜 하는지 주석 달기

## 지금 있는 테이블

정확한 스키마는 마이그레이션 파일 보기

keep_alive

- keep-alive cron 전용, id 1개만 있음
- RLS 켜져 있고 정책 없음 -> 조회하면 빈 배열 (DB까지 요청만 가면 되니까 괜찮음)
- anon에 select만 grant

profiles

- auth.users랑 1:1 (on delete cascade)
- 컬럼: id, nickname, created_at, terms_agreed_at, marketing_agreed, marketing_agreed_updated_at
- 가입하면 on_auth_user_created 트리거가 행 만들어줌 (handle_new_user)
- 본인 것만 조회 · 수정 가능, 직접 수정은 nickname 컬럼만
- nickname: null(가입 덜 끝남) 또는 한글 · 영문 · 숫자 1~20자 (profiles_nickname_format), 앱은 2자 이상
- nickname은 대소문자 무시하고 unique -> 겹치면 23505
- 약관 컬럼은 record_signup_agreements RPC로만 기록

## RPC

- is_email_registered(p_email): 가입 완료된 이메일인지 (닉네임까지 있어야 완료), anon · authenticated 호출 가능
- record_signup_agreements(p_marketing): 약관 동의 기록, authenticated만
  - 필수 약관 시각은 처음 한 번만, 마케팅은 바뀔 때마다 시각 갱신
  - 나중에 마케팅 수신 설정 화면에서도 재사용 가능

## 할 일

- profiles_nickname_format을 2자 이상으로 맞추기 (앱 스키마는 2자, DB는 아직 1자)
