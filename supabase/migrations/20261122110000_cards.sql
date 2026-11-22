-- 카드 발급 (ticket-verify.md, product.md "리뷰 두 가지")
-- 1. movies: 인식 때 찾은 영화 (KOBIS 코드 기준 1행). 누구나 조회, 쓰기는 서버만
-- 2. tickets.movie_id
-- 3. reviews: 관람평 = 별점(1~5) + 관람 리뷰(1~500자). 카드를 지워도 남고, 탈퇴하면 같이 지워짐
-- 4. cards: 티켓 1장당 1장, 카드 메모 + 인증번호(CHG-관람일YYMMDD-전체 발급 순번)
-- 5. issue_card: 티켓 확정 + 관람평 + 카드를 한 트랜잭션으로 (서버만 호출)

-- 1. movies
create table public.movies (
  id uuid primary key default gen_random_uuid(),
  kobis_code text not null unique,
  tmdb_id integer,
  title text not null,
  original_title text not null default '',
  poster_url text,                       -- TMDB 포스터 URL
  production_year text,                  -- KOBIS prdtYear
  runtime integer,                       -- 분
  director text not null default '',
  cast_members text[] not null default '{}', -- 출연 상위 3명 (cast는 SQL 예약어라 피함)
  grade text not null default '',        -- 관람등급
  released_on date,                      -- 최초 개봉일
  country text not null default '',
  genres text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.movies enable row level security;
grant select on public.movies to anon, authenticated;
grant select, insert, update on public.movies to service_role;

create policy "영화 조회" on public.movies
  for select to anon, authenticated
  using (true);

-- 2. 티켓 -> 영화 (영화를 못 찾은 티켓은 null, 검수에서 연결)
alter table public.tickets
  add column movie_id uuid references public.movies (id);

-- 3. reviews
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  ticket_id uuid not null unique references public.tickets (id),
  movie_id uuid not null references public.movies (id),
  rating smallint not null check (rating between 1 and 5),
  body text not null check (char_length(body) <= 500 and btrim(body) <> ''),
  has_spoiler boolean not null default false, -- UI는 나중 (ticket-verify.md 6번 화면)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reviews_user_id_idx on public.reviews (user_id, created_at desc);
create index reviews_movie_id_idx on public.reviews (movie_id, created_at desc);

-- 지금은 본인 것만 조회. 사이트 공개(영화 상세)는 user_id를 숨긴 뷰로 열 예정
-- 수정(별점 · 리뷰)은 수정 화면 만들 때 컬럼 단위 grant로
alter table public.reviews enable row level security;
grant select on public.reviews to authenticated;
grant select, insert, update on public.reviews to service_role;

create policy "본인 관람평 조회" on public.reviews
  for select to authenticated
  using ((select auth.uid()) = user_id);

-- 4. cards
create sequence public.card_serial_seq;

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  ticket_id uuid not null unique references public.tickets (id),
  movie_id uuid not null references public.movies (id),
  serial bigint not null unique,           -- 전체 발급 순번
  certificate_id text not null unique,     -- CHG-261024-0001
  memo text check (memo is null or char_length(memo) <= 500),
  created_at timestamptz not null default now()
);

create index cards_user_id_idx on public.cards (user_id, created_at desc);

-- 본인 것만 조회. 메모 수정 · 휴지통은 카드 상세 작업 때
alter table public.cards enable row level security;
grant select on public.cards to authenticated;
grant select, insert, update on public.cards to service_role;

create policy "본인 카드 조회" on public.cards
  for select to authenticated
  using ((select auth.uid()) = user_id);

-- 5. 발급. 앱 서버가 사용자 확인 뒤 admin-client로 호출 (user_id는 세션에서 꺼낸 값)
-- 발급 가능한 티켓
--   holding: 3사 자동 인증, 30분 안, 검수 사유 없음
--   verified인데 카드 없음: 검수 승인된 티켓 (승인 함수 만들 때 씀)
-- 에러 메시지로 사유를 알림: ticket_not_found · ticket_expired · needs_review · invalid_seat · already_issued
-- 고른 좌석을 다른 사람이 이미 잡았으면 지문 unique에서 23505
create function public.issue_card(
  p_ticket_id uuid,
  p_user_id uuid,
  p_seat text,
  p_rating smallint,
  p_review text,
  p_memo text
)
returns table (card_id uuid, certificate_id text)
language plpgsql
security definer
set search_path = ''
as $$
-- 반환 컬럼 이름(card_id · certificate_id)과 테이블 컬럼이 겹쳐도 컬럼으로 해석
#variable_conflict use_column
declare
  v_ticket public.tickets;
  v_seat text;
  v_serial bigint;
  v_certificate_id text;
  v_card_id uuid;
begin
  select * into v_ticket
  from public.tickets
  where id = p_ticket_id and user_id = p_user_id
  for update;

  if not found then
    raise exception 'ticket_not_found';
  end if;

  if v_ticket.status = 'holding' then
    if v_ticket.hold_expires_at <= now() then
      raise exception 'ticket_expired';
    end if;
    if v_ticket.review_reason is not null then
      raise exception 'needs_review';
    end if;
  elsif v_ticket.status = 'verified' then
    if exists (select 1 from public.cards c where c.ticket_id = p_ticket_id) then
      raise exception 'already_issued';
    end if;
  else
    raise exception 'ticket_expired';
  end if;

  if v_ticket.movie_id is null or v_ticket.screened_at is null then
    raise exception 'needs_review';
  end if;

  -- 좌석: 이미 정해졌으면 그대로, 여러 개라 안 정해졌으면 고른 좌석 (티켓에 적힌 것 중 하나)
  v_seat := coalesce(v_ticket.seat, p_seat);
  if v_seat is null
    or not (v_seat = any (v_ticket.seats))
    or (p_seat is not null and p_seat <> v_seat) then
    raise exception 'invalid_seat';
  end if;

  update public.tickets
  set
    status = 'verified',
    seat = v_seat,
    hold_expires_at = null,
    verified_at = coalesce(verified_at, now())
  where id = p_ticket_id;

  insert into public.reviews (user_id, ticket_id, movie_id, rating, body)
  values (p_user_id, p_ticket_id, v_ticket.movie_id, p_rating, p_review);

  v_serial := nextval('public.card_serial_seq');
  -- lpad는 넘치면 잘라 버려서 4자리 넘으면 그대로
  v_certificate_id := 'CHG-'
    || to_char(v_ticket.screened_at at time zone 'Asia/Seoul', 'YYMMDD')
    || '-'
    || case when v_serial < 10000 then lpad(v_serial::text, 4, '0') else v_serial::text end;

  insert into public.cards (user_id, ticket_id, movie_id, serial, certificate_id, memo)
  values (p_user_id, p_ticket_id, v_ticket.movie_id, v_serial, v_certificate_id, nullif(btrim(p_memo), ''))
  returning id into v_card_id;

  return query select v_card_id, v_certificate_id;
end;
$$;

revoke execute on function public.issue_card(uuid, uuid, text, smallint, text, text) from public, anon, authenticated;
grant execute on function public.issue_card(uuid, uuid, text, smallint, text, text) to service_role;
