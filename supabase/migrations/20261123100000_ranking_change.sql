-- 랭킹 순위 변화 (▲3 · ▼1 · NEW, design-system.md 랭킹)
-- rankings.prev_rank: 지난 집계 순위 (지난 집계에 없었으면 null = NEW)
-- ranking_runs.prev_counted_until: 지난 집계 기준 시각 (null이면 첫 집계라 변화 표시 안 함)
-- 같은 날 다시 돌리면(수동 실행) 지난 순위를 덮지 않음 -> 변화가 0으로 바뀌지 않게

alter table public.rankings add column prev_rank integer;
alter table public.ranking_runs add column prev_counted_until timestamptz;

create or replace function public.refresh_rankings()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_until timestamptz :=
    date_trunc('day', now() at time zone 'Asia/Seoul') at time zone 'Asia/Seoul';
  v_last timestamptz;
  v_prev_until timestamptz;
  v_prev jsonb; -- { user_id: 지난 순위 }
begin
  select counted_until, prev_counted_until into v_last, v_prev_until
  from public.ranking_runs;

  if v_last is not null and v_last = v_until then
    -- 같은 기준으로 다시 집계: 지난 순위 · 지난 기준 그대로
    select coalesce(jsonb_object_agg(user_id, prev_rank), '{}') into v_prev
    from public.rankings;
  else
    -- 새 날: 지금 순위가 지난 순위가 됨
    select coalesce(jsonb_object_agg(user_id, rank), '{}') into v_prev
    from public.rankings;
    v_prev_until := v_last;
  end if;

  delete from public.rankings where true;

  insert into public.rankings (user_id, rank, card_count, reached_at, nickname, avatar_path, prev_rank)
  select
    c.user_id,
    rank() over (order by count(*) desc),
    count(*),
    max(c.created_at),
    p.nickname,
    p.avatar_path,
    (v_prev ->> c.user_id::text)::integer
  from public.cards c
  join public.profiles p on p.id = c.user_id
  where c.created_at < v_until
    and p.nickname is not null
  group by c.user_id, p.nickname, p.avatar_path;

  insert into public.ranking_runs (id, counted_until, ranked_count, prev_counted_until)
  values (true, v_until, (select count(*) from public.rankings), v_prev_until)
  on conflict (id) do update
    set counted_until = excluded.counted_until,
        ranked_count = excluded.ranked_count,
        prev_counted_until = excluded.prev_counted_until,
        updated_at = now();
end;
$$;

revoke execute on function public.refresh_rankings() from public, anon, authenticated;
grant execute on function public.refresh_rankings() to service_role;
