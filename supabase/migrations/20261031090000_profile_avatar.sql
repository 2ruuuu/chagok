-- 마이페이지 프로필 편집
-- 1. 닉네임 2~20자로 맞추기 (앱 스키마 MIN_NICKNAME_LENGTH = 2, 지금까지 DB는 1자부터 허용)
-- 2. 프로필 사진 경로 컬럼 (avatars 버킷 안의 경로, 없으면 기본 이미지)
-- 3. avatars 버킷 + 본인 폴더(<user id>/...)에만 올리고 지울 수 있는 정책

-- 1. 닉네임 (1자 닉네임이 이미 있으면 이 단계에서 실패함 → 먼저 SQL Editor로 데이터 정리)
alter table public.profiles drop constraint profiles_nickname_format;
alter table public.profiles
  add constraint profiles_nickname_format check (
    nickname is null or nickname ~ '^[가-힣A-Za-z0-9]{2,20}$'
  );

-- 2. 프로필 사진 경로. 남의 폴더 경로를 넣지 못하게 본인 id 폴더로 시작해야 함
alter table public.profiles
  add column avatar_path text,
  add constraint profiles_avatar_path_own_folder check (
    avatar_path is null or avatar_path like id::text || '/%'
  );

-- 직접 수정 가능한 컬럼에 avatar_path 추가 (nickname은 기존 grant 유지)
grant update (avatar_path) on public.profiles to authenticated;

-- 3. 버킷: 공개 읽기(이미지 URL로 바로 보여줌), 1MB · jpeg/png/webp만
--    앱에서 512px jpeg로 줄여서 올리므로 보통 100KB 안쪽
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 1048576, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- 공개 버킷이라 URL 읽기는 정책 없이 됨. select 정책은 지우기(remove)에 필요해서 본인 폴더만
create policy "본인 프로필 사진 조회" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "본인 프로필 사진 업로드" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "본인 프로필 사진 삭제" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
