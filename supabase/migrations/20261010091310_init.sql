-- keep-alive cron 전용 (대시보드에서 먼저 만들어진 테이블을 마이그레이션으로 기록)
create table public.keep_alive (id int primary key);
insert into public.keep_alive (id) values (1);
alter table public.keep_alive enable row level security;  -- 정책 없음 → 조회 시 빈 배열
grant select on public.keep_alive to anon;
