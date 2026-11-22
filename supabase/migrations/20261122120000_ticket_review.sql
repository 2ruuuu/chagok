-- 검수 승인 · 반려 + 앱 안 알림 (ticket-verify.md "검수 운영", product.md "알림")
-- 1. notifications: 확인 완료 · 확인 실패 · 공지. 본인 것만 조회, 읽음 표시만 직접 수정
-- 2. approve_ticket / reject_ticket: 상태 변경 + 알림 생성을 한 번에 (status 컬럼만 바꾸면 알림이 안 생김)
--    지금은 관리자 페이지 없이 Supabase SQL Editor에서 호출: select public.approve_ticket('<id>');

-- 1. notifications
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('ticket_approved', 'ticket_rejected', 'notice')),
  ticket_id uuid references public.tickets (id),
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_id_idx on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;
grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;
grant select, insert, update on public.notifications to service_role;

create policy "본인 알림 조회" on public.notifications
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "본인 알림 읽음 표시" on public.notifications
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- 2-1. 승인. 원본 사진을 보고 틀린 값만 넘김 (null이면 인식한 값 그대로)
-- 영화를 못 찾은 티켓은 movies 행의 id를 넘김 (movies에 없으면 먼저 넣기)
-- 폐관 · 표기가 다른 지점이면 src/constants/theaters.ts에 추가한 표준 이름으로 theater를 넘김
-- 지문이 다른 티켓과 겹치면 23505 -> reject_ticket(id, 'duplicate')
create function public.approve_ticket(
  p_ticket_id uuid,
  p_movie_id uuid default null,
  p_chain text default null,
  p_theater text default null,
  p_screened_at timestamptz default null,
  p_seat text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ticket public.tickets;
  v_movie_id uuid;
  v_seat text;
  v_title text;
begin
  select * into v_ticket from public.tickets where id = p_ticket_id for update;
  if not found then
    raise exception 'ticket_not_found';
  end if;
  if v_ticket.status <> 'pending' then
    raise exception 'not_pending (지금 상태: %)', v_ticket.status;
  end if;

  v_movie_id := coalesce(p_movie_id, v_ticket.movie_id);
  if v_movie_id is null then
    raise exception 'movie_required: p_movie_id로 movies 행의 id를 넘겨 주세요';
  end if;

  v_seat := coalesce(p_seat, v_ticket.seat);
  if v_seat is null and coalesce(array_length(v_ticket.seats, 1), 0) = 1 then
    v_seat := v_ticket.seats[1];
  end if;
  if coalesce(p_chain, v_ticket.chain) is null
    or coalesce(p_theater, v_ticket.theater) is null
    or coalesce(p_screened_at, v_ticket.screened_at) is null
    or v_seat is null then
    raise exception 'fingerprint_required: 체인 · 극장 · 상영일시 · 좌석을 모두 정해 주세요';
  end if;

  update public.tickets
  set
    status = 'verified',
    movie_id = v_movie_id,
    chain = coalesce(p_chain, chain),
    theater = coalesce(p_theater, theater),
    screened_at = coalesce(p_screened_at, screened_at),
    seat = v_seat,
    -- 고친 좌석이 인식한 목록에 없으면 추가 (seat는 seats 안에 있어야 함)
    seats = case when v_seat = any (seats) then seats else array_append(seats, v_seat) end,
    reviewed_at = now(),
    verified_at = now()
  where id = p_ticket_id;

  if v_ticket.user_id is not null then
    select title into v_title from public.movies where id = v_movie_id;
    insert into public.notifications (user_id, type, ticket_id, body)
    values (
      v_ticket.user_id,
      'ticket_approved',
      p_ticket_id,
      v_title || ' 티켓 확인이 끝났어요. 별점과 리뷰를 남기고 카드를 받아보세요.'
    );
  end if;
end;
$$;

-- 2-2. 반려. 지문은 status가 rejected가 되면서 풀림 (unique 인덱스 조건 밖) -> 같은 티켓으로 다시 시도 가능
-- p_reason: blurry(사진이 흐려요) · not_ticket(티켓이 아니에요) · duplicate(이미 인증된 티켓이에요)
create function public.reject_ticket(p_ticket_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ticket public.tickets;
  v_title text;
begin
  if p_reason not in ('blurry', 'not_ticket', 'duplicate') then
    raise exception 'invalid_reason: blurry · not_ticket · duplicate 중 하나';
  end if;

  select * into v_ticket from public.tickets where id = p_ticket_id for update;
  if not found then
    raise exception 'ticket_not_found';
  end if;
  if v_ticket.status <> 'pending' then
    raise exception 'not_pending (지금 상태: %)', v_ticket.status;
  end if;

  update public.tickets
  set status = 'rejected', reject_reason = p_reason, reviewed_at = now()
  where id = p_ticket_id;

  if v_ticket.user_id is not null then
    select coalesce(m.title, v_ticket.movie_title) into v_title
    from (select 1) as one
    left join public.movies m on m.id = v_ticket.movie_id;

    insert into public.notifications (user_id, type, ticket_id, body)
    values (
      v_ticket.user_id,
      'ticket_rejected',
      p_ticket_id,
      coalesce(v_title || ' 티켓', '티켓') || '을 확인하지 못했어요. '
        || case p_reason
          when 'blurry' then '사진이 흐려요.'
          when 'not_ticket' then '티켓이 아니에요.'
          else '이미 인증된 티켓이에요.'
        end
    );
  end if;
end;
$$;

revoke execute on function public.approve_ticket(uuid, uuid, text, text, timestamptz, text) from public, anon, authenticated;
revoke execute on function public.reject_ticket(uuid, text) from public, anon, authenticated;
grant execute on function public.approve_ticket(uuid, uuid, text, text, timestamptz, text) to service_role;
grant execute on function public.reject_ticket(uuid, text) to service_role;
