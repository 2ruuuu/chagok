-- 카드 랭킹 (전체 누적 장수, design-system.md 랭킹)
-- 1. rankings: 마지막 집계 결과. 로그인한 사람 누구나 조회 (닉네임 · 사진 · 장수 공개)
-- 2. ranking_runs: 마지막 집계 기준 시각 · 순위에 든 사람 수 (1행)
-- 3. refresh_rankings: 매일 00:00(KST) Vercel Cron이 부름 (서버만)
--    profiles는 본인 것만 조회라 집계 때 닉네임 · 사진을 같이 저장해 둠 (다음 집계 전까지 예전 값)

-- 1. rankings
create table public.rankings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  rank integer not null,          -- 공동 순위 (같은 장수면 같은 순위, 4 · 4 · 4 · 7)
  card_count integer not null check (card_count > 0),
  reached_at timestamptz not null, -- 지금 장수가 된 시각 (같은 순위 안에서 먼저 도달한 사람이 위)
  nickname text not null,
  avatar_path text
);

create index rankings_order_idx on public.rankings (rank, reached_at);

alter table public.rankings enable row level security;
grant select on public.rankings to authenticated;
grant select, insert, update, delete on public.rankings to service_role;

create policy "랭킹 조회" on public.rankings
  for select to authenticated
  using (true);

-- 2. ranking_runs
create table public.ranking_runs (
  id boolean primary key default true check (id), -- 항상 1행
  counted_until timestamptz not null, -- 이 시각 전에 받은 카드까지 셈 (화면 "YYYY.MM.DD 00:00 기준")
  ranked_count integer not null,      -- 순위에 든 사람 수 (상위 N% 계산)
  updated_at timestamptz not null default now()
);

alter table public.ranking_runs enable row level security;
grant select on public.ranking_runs to authenticated;
grant select, insert, update on public.ranking_runs to service_role;

create policy "랭킹 집계 정보 조회" on public.ranking_runs
  for select to authenticated
  using (true);

-- 3. refresh_rankings
-- 기준은 오늘 00:00(KST). Hobby cron이 최대 1시간 늦게 돌아도 기준 시각은 그대로
create function public.refresh_rankings()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_until timestamptz :=
    date_trunc('day', now() at time zone 'Asia/Seoul') at time zone 'Asia/Seoul';
begin
  delete from public.rankings where true;

  insert into public.rankings (user_id, rank, card_count, reached_at, nickname, avatar_path)
  select
    c.user_id,
    rank() over (order by count(*) desc),
    count(*),
    max(c.created_at),
    p.nickname,
    p.avatar_path
  from public.cards c
  join public.profiles p on p.id = c.user_id
  where c.created_at < v_until
    and p.nickname is not null
  group by c.user_id, p.nickname, p.avatar_path;

  insert into public.ranking_runs (id, counted_until, ranked_count)
  values (true, v_until, (select count(*) from public.rankings))
  on conflict (id) do update
    set counted_until = excluded.counted_until,
        ranked_count = excluded.ranked_count,
        updated_at = now();
end;
$$;

revoke execute on function public.refresh_rankings() from public, anon, authenticated;
grant execute on function public.refresh_rankings() to service_role;
