-- 티켓 원본 이미지 버킷 (ticket-verify.md 업로드)
-- 이미지는 클라이언트 → 인식 Route Handler로 바로 보내고, 서버(admin-client)가 이 버킷에 저장함
-- 예매자 이름 · 전화번호 일부가 찍혀 있을 수 있어 private, 사용자용 storage 정책은 일부러 만들지 않음
-- (authenticated는 조회 · 업로드 · 삭제 전부 불가, service_role만 접근)
-- 경로: <user id>/<ticket id>.jpg (tickets.image_path)
-- 보관: 카드 발급 후 90일, 반려 30일 뒤 삭제 (삭제 작업은 cron 만들 때)

-- 4MB · jpeg/png/webp만. 앱에서 긴 변 1600px jpeg로 줄여 보내서 보통 1MB 안쪽 (Vercel 요청 본문 4.5MB 제한보다 작게)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ticket-images', 'ticket-images', false, 4194304, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
