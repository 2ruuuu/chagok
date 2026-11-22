-- 티켓 인증 기록 (ticket-verify.md)
-- 1. tickets 테이블: 인증 시도 1건 = 1행 (영화 · 카드 연결은 movies · cards 테이블 만들 때 추가)
-- 2. 지문 unique: 같은 티켓 · 같은 좌석을 두 번 인증하지 못하게 (동시 요청도 DB가 막음 → 23505)
-- 3. 사용자는 본인 것 select만. insert · update는 서버(admin-client, RLS 우회)만
--    → 사용자가 publishable key로 status = 'verified'를 직접 넣는 걸 막음

-- 1. 테이블
create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  -- 탈퇴해도 지문은 남겨야 해서 cascade 대신 set null (탈퇴 → 재가입 → 같은 티켓 재인증 방지)
  user_id uuid references auth.users (id) on delete set null,

  -- holding: 3사 인식 직후 임시 상태 (30분, 카드 발급 때 verified로 확정)
  -- pending: 검수 대기 ([확인 요청하기])
  -- verified: 인증 확정 (3사 카드 발급 / 검수 승인)
  -- rejected: 검수 반려 (지문 풀림)
  -- released: 임시 상태 해제 (뒤로가기 · 새로 하기 · 30분 만료, 지문 풀림)
  status text not null check (status in ('holding', 'pending', 'verified', 'rejected', 'released')),

  -- 아래 값은 전부 서버가 LLM 추출값을 코드로 정규화해서 넣음 (클라이언트 값 안 받음)
  chain text check (chain in ('cgv', 'lotte', 'megabox', 'etc')), -- etc: 3사 외 (검수 대상)
  theater text,             -- 지점 표준 이름, 체인 이름 · 공백 뺌 (예: 코엑스)
  screen text,              -- 상영관 (특별관 이름 포함), 지문에는 안 씀
  screened_at timestamptz,  -- 상영 시작 일시 (KST 분 단위로 정규화한 값)
  seats text[] not null default '{}', -- 티켓에 적힌 좌석 전부 (E10 형식)
  seat text,                -- 내가 고른 좌석. 좌석이 하나면 인식 때, 여러 개면 4번 화면에서 정함
  booking_number text,      -- 숫자 · 영문만 (없는 티켓 있음: 롯데 종이)
  movie_title text,         -- 티켓에 적힌 제목 (movies 테이블 생기면 movie_id 추가)

  image_path text,          -- private 버킷 안 원본 경로 (<user id>/...), 보관 기한 지나면 null
  extracted jsonb,          -- LLM 원본 응답 (검수 · 오인식 분석용, 확신도 · ticket_count 포함)
  review_reason text,       -- pending이 된 이유 (low_confidence, theater_not_found 등, 검수용)
  reject_reason text check (reject_reason in ('blurry', 'not_ticket', 'duplicate')),

  hold_expires_at timestamptz, -- holding일 때만, 지나면 서버가 released로 바꾼 뒤 중복 검사
  created_at timestamptz not null default now(),
  requested_at timestamptz,    -- 검수 요청 시각 (24시간 처리 기준)
  reviewed_at timestamptz,     -- 승인 · 반려 시각
  verified_at timestamptz,

  constraint tickets_seat_in_seats check (seat is null or seat = any (seats)),
  constraint tickets_holding_expires check (status <> 'holding' or hold_expires_at is not null),
  constraint tickets_rejected_reason check (status <> 'rejected' or reject_reason is not null),
  -- 기본 지문을 못 만들면 verified가 될 수 없음 (→ pending으로 남아 검수에서 값 고친 뒤 승인)
  constraint tickets_verified_fingerprint check (
    status <> 'verified'
    or (chain is not null and theater is not null and screened_at is not null and seat is not null)
  ),
  constraint tickets_image_path_own_folder check (
    image_path is null or image_path like user_id::text || '/%'
  )
);

-- 2. 지문. 지문을 잡고 있는 상태(holding · pending · verified)끼리만 겹치면 안 됨
--    rejected · released는 빠짐 → 반려 · 임시 해제되면 같은 티켓으로 다시 시도 가능
--    카드 삭제는 tickets 행을 지우지 않으므로 지문 유지
--    값 중 하나라도 null이면 unique 검사 대상이 아님 (지문 없는 pending)

-- 기본 지문: 체인 + 극장 + 상영일시 + 좌석
create unique index tickets_fingerprint_idx
  on public.tickets (chain, theater, screened_at, seat)
  where status in ('holding', 'pending', 'verified');

-- 보조 지문: 체인 + 예매번호 + 좌석
-- 문서는 "체인 + 예매번호"지만 좌석을 빼면 같이 예매한 친구가 같은 캡처로 나머지 좌석을 인증할 수 없음
create unique index tickets_booking_fingerprint_idx
  on public.tickets (chain, booking_number, seat)
  where status in ('holding', 'pending', 'verified');

-- 조회용: 내 티켓 목록(홈 "확인 중인 티켓"), 검수 대기 목록
create index tickets_user_id_idx on public.tickets (user_id, created_at desc);
create index tickets_pending_idx on public.tickets (requested_at) where status = 'pending';

-- 3. RLS: 본인 것 조회만. insert · update · delete 정책 없음 (admin-client만 씀)
alter table public.tickets enable row level security;
grant select on public.tickets to authenticated;
-- 서버(admin-client)용. 행 삭제는 안 씀 (지문 유지), 이미지 정리는 image_path만 null로
grant select, insert, update on public.tickets to service_role;

create policy "본인 티켓 조회" on public.tickets
  for select to authenticated
  using ((select auth.uid()) = user_id);
