-- 회원가입 약관 동의 기록 + 닉네임 문자 제한

-- 1. 약관 동의 컬럼
alter table public.profiles
  add column terms_agreed_at timestamptz,                    -- 필수 약관(이용약관·개인정보) 동의 시각
  add column marketing_agreed boolean not null default false, -- 마케팅 정보 수신 동의 여부
  add column marketing_agreed_updated_at timestamptz;         -- 마케팅 동의 여부를 마지막으로 정한 시각

-- 2. 동의 내역은 이 함수로만 기록 (authenticated에게 컬럼 update 권한을 주지 않음 → 시각 조작 불가)
--    필수 약관 시각은 처음 한 번만 기록, 마케팅 동의는 바뀔 때마다 시각 갱신.
--    나중에 마케팅 수신 설정 화면에서도 그대로 재사용 가능.
create function public.record_signup_agreements(p_marketing boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set
    terms_agreed_at = coalesce(terms_agreed_at, now()),
    marketing_agreed_updated_at = case
      when marketing_agreed_updated_at is null
        or marketing_agreed is distinct from p_marketing then now()
      else marketing_agreed_updated_at
    end,
    marketing_agreed = p_marketing
  where id = (select auth.uid());

  if not found then
    raise exception 'profile not found';
  end if;
end;
$$;

revoke execute on function public.record_signup_agreements(boolean) from public, anon;
grant execute on function public.record_signup_agreements(boolean) to authenticated;

-- 3. 닉네임: 한글(완성형)·영문·숫자 1~20자 (schemas.ts의 NICKNAME_PATTERN과 동일)
alter table public.profiles drop constraint profiles_nickname_format;
alter table public.profiles
  add constraint profiles_nickname_format check (
    nickname is null or nickname ~ '^[가-힣A-Za-z0-9]{1,20}$'
  );
