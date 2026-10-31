# auth.md

로그인 · 회원가입 · proxy · 소셜 로그인 작업 전에 읽기
서버 액션 · 폼 규칙은 CLAUDE.md 코드 규칙 참고

## 세션

- 쿠키에 저장 (sb-<project-ref>-auth-token), 로컬 스토리지 안 씀
- 쿠키 안에 access token(JWT, 1시간) + refresh token
- proxy가 매 요청 getClaims()로 확인하고 만료 전에 갱신 -> 로그아웃 전까지 항상 로그인 유지 (자동 로그인 체크박스 없음)
- getClaims()는 서명만 확인 (계정 삭제돼도 통과), 실제 계정 확인은 getUser()
- RLS의 auth.uid() = JWT의 sub

## proxy

- src/proxy.ts -> src/lib/supabase/proxy.ts의 updateSession
- /auth, /api는 가입 단계 검사 안 함
- profiles 조회가 실패하면 그냥 통과

상태별 접근

- 비로그인: PUBLIC_PATHS(prefix), PUBLIC_EXACT_PATHS(/signup, /signup/verify)만 -> 나머지는 /login
- 로그인 + 가입 미완료(닉네임 또는 terms_agreed_at 없음): /signup/password, /signup/nickname만
  - 이메일 가입자 + 닉네임 없음 -> /signup/password
  - 그 외(OAuth, 닉네임은 있는데 약관 기록만 없음) -> /signup/nickname
- 로그인 + 가입 완료(닉네임 && terms_agreed_at): /login*, 가입 단계 빼고 전부 -> 가입 단계 오면 /

- 세션 생긴 뒤 /signup, /signup/verify 막는 이유: 다른 이메일로 다시 인증하면 계정이 하나 더 생김
- 새 공개 페이지는 PUBLIC_PATHS나 PUBLIC_EXACT_PATHS에 추가
- 지금 /card-demo는 임시로 공개 (나중에 빼기)
- proxy만 믿지 말고 서버 액션 안에서도 권한 체크 (예: setPassword는 가입 미완료 사용자만)

## 회원가입 (이메일)

1. /signup SignupForm -> checkSignupEmail: 형식 · 중복 확인만 (메일 안 보냄)
2. 약관 시트 AgreementSheet -> sendSignupCode: 필수 약관 아니면 서버에서 거부, 성공하면 토스트 + /signup/verify?email=...&marketing=1
3. /signup/verify VerifyForm -> verifySignupCode: verifyOtp로 로그인 + record_signup_agreements. redirect 안 하고 AuthSuccess 애니메이션 1.5초 뒤 router.replace("/signup/password")
4. /signup/password PasswordForm -> setPassword: 8~20자, 숫자 · 특수문자 (passwordRules로 체크 표시)
5. /signup/nickname NicknameForm -> updateNickname: 한글 · 영문 · 숫자 2~20자, 중복이면 23505 -> /signup/complete
6. /signup/complete: [시작하기] = <Link href="/" replace>

- 인증 화면: email 쿼리 없으면 /signup으로, 5분 타이머(useCountdown), 재전송은 60초 쿨다운 후 sendSignupCode 다시 호출
- setPassword: 뒤로 와서 같은 비밀번호 입력하면 same_password 에러 -> 성공으로 처리
- 가입 완료 = 닉네임 && terms_agreed_at (proxy 기준). is_email_registered는 아직 닉네임만 봄 (닉네임 있고 약관 없는 계정은 재가입 대신 로그인하면 proxy가 약관으로 보냄)
- 중간에 나간 계정은 같은 이메일로 다시 가입하면 그 계정 이어서 씀
- Supabase Email OTP 설정(300초, 6자리)이 타이머 · 스키마랑 맞아야 함
- /signup/auth-complete는 AuthSuccess 미리보기용 (실제 흐름에선 안 씀, 삭제 가능)

뒤로가기 (SignupHeader)

- 이메일, 인증번호: router.back()
- 비밀번호: 가입 중단 시트(QuitSignupSheet) -> [그만두기] = signOut -> /login
- 닉네임: 이메일 가입자는 router.back(), OAuth 가입자는 가입 중단 시트 (닉네임이 첫 단계라서)
- 완료: router.back() -> proxy가 /로 보냄
- 브라우저 뒤로가기 · 스와이프는 버튼이랑 상관없으니까 proxy가 막음

## 로그인

- /login: 소셜 로그인 버튼(OauthLogin) + 이메일 로그인 · 회원가입 링크
- /login/email EmailLoginForm: 본문 전체가 form 하나 (중간 SNS 버튼 CircleButton은 type="button")
- 로그인 실패하면 어느 칸이 틀렸는지 안 알려줌, 에러는 비밀번호 아래에
- 성공하면 / (가입 미완료면 proxy가 남은 단계로)
- 홈 로그아웃 버튼은 테스트용 임시

## 소셜 로그인 (Google · Kakao)

코드 연결 끝 (실제 로그인 테스트는 아직)

- 버튼: hooks/useOauthLogin.ts 하나를 /login OauthLogin, /login/email CircleButton이 같이 씀
- redirectTo = window.location.origin + /auth/callback -> Supabase Redirect URLs에 없는 주소(Vercel Preview 등)면 Site URL로 감
- 실패 · 취소: /login?error=auth -> 로그인 화면에 안내 문구
- 약관: /signup/nickname 들어오면 terms_agreed_at 없을 때 AgreementSheet("동의하고 계속하기") 자동으로 띄움 -> agreeToTerms 액션 -> record_signup_agreements
- 시트 닫고 [시작하기] 누르면 시트 다시 띄움, updateNickname 액션도 약관 기록 없으면 거부
- 흐름: 버튼 -> signInWithOAuth(redirectTo: /auth/callback) -> 구글/카카오 -> Supabase callback -> src/app/auth/callback/route.ts(exchangeCodeForSession) -> ?next(기본 /) -> 신규면 proxy가 /signup/nickname으로
- Client ID / Secret은 Supabase 대시보드에만, 코드 · .env에 넣지 않기

외부 설정

- Google Cloud(프로젝트 chagok): Testing 상태라 Test users만 로그인 가능 (실사용자 받기 전에 Publish)
- Google JS origins: localhost:3000, chagok-eight.vercel.app / redirect URI는 Supabase callback
- Kakao(앱 차곡): Redirect URI는 Supabase callback, Client Secret 켬, 개인 개발자 비즈 앱 (앱 아이콘 등록 후 전환)
- Kakao 동의항목: 닉네임 · 프로필 사진 · 카카오계정(이메일) 전부 선택 동의
- 이메일 동의항목이 꼭 있어야 함: Supabase가 scope에 account_email을 항상 넣어서 없으면 KOE205
- 선택 동의라 이메일 안 줄 수 있음 -> Supabase Kakao provider의 Allow users without an email 켜 둔 채로 유지
- Supabase Site URL: chagok-eight.vercel.app
- Supabase Redirect URLs: localhost:3000/auth/callback, chagok-eight.vercel.app/auth/callback, 폰 테스트용 사설 IP 대역

## 테스트 계정

- 지울 땐 Authentication -> Users에서 삭제 (profiles는 cascade로 같이 지워짐)
- profiles만 지우면 auth.users가 남아서 재가입해도 프로필 없는 계정이 됨 -> 닉네임 저장 · 약관 기록 실패
- 이렇게 됐으면 Authentication에서 계정 지우거나 SQL Editor에서
  insert into public.profiles (id) select id from auth.users on conflict (id) do nothing;

## 할 일

- 소셜 로그인 실제 테스트: Kakao 로그인 확인됨, Google(Test users 계정) · 가입 끝까지(약관 → 닉네임 → 홈) 확인 남음
- 아이디 · 비밀번호 찾기 (/find-id, /find-password 빈 페이지, 비번 찾기는 가입 OTP 흐름 재사용 가능)
- DB 닉네임 제약 2자: 마이그레이션 20261031090000_profile_avatar 작성
- /signup/auth-complete 삭제할지 정하기
- 홈 임시 로그아웃 버튼, /card-demo 임시 공개 정리 (홈 MyCardList가 CardDemoPage를 import 중이라 같이 정리)
