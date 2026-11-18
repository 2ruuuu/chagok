-- profiles 보강
-- 1. 트리거 생성 전에 가입한 계정의 profiles 행 채우기
-- 2. 닉네임 규칙을 DB에서도 강제 (publishable key로 직접 update해도 우회 불가)
-- 3. 닉네임 중복 금지 (대소문자 무시)
-- 4. authenticated가 수정할 수 있는 컬럼을 nickname으로 제한

insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

-- 기존 데이터 정리: 앞뒤 공백 제거, 빈 문자열은 미가입 상태(null)로
update public.profiles set nickname = nullif(btrim(nickname), '')
where nickname is not null;

alter table public.profiles
  add constraint profiles_nickname_format check (
    nickname is null
    or (nickname = btrim(nickname) and char_length(nickname) between 1 and 20)
  );

create unique index profiles_nickname_unique_idx
  on public.profiles (lower(nickname));

revoke update on public.profiles from authenticated;
grant update (nickname) on public.profiles to authenticated;
