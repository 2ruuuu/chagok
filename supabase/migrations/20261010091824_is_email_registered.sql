-- 회원가입 첫 단계에서 이미 가입된 이메일인지 확인.
-- 닉네임까지 입력해야 가입 완료로 보며, 중간에 이탈한 계정은 다시 가입 절차를 밟을 수 있음.
create function public.is_email_registered(p_email text)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from auth.users u
    join public.profiles p on p.id = u.id
    where lower(u.email) = lower(p_email)
      and p.nickname is not null
  );
$$;

revoke execute on function public.is_email_registered(text) from public;
grant execute on function public.is_email_registered(text) to anon, authenticated;
