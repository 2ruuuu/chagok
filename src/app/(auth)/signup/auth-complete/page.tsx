import AuthSuccess from "../_components/AuthSuccess";

/**
 * 인증 성공 화면 미리보기용. 실제 가입 흐름에서는 인증 직후 세션이 생겨
 * proxy가 이 경로를 /signup/password로 보내므로, VerifyForm 안에서 AuthSuccess를 직접 띄움.
 */
const AuthCompletePage = () => {
  return (
    <div className="-mb-14 flex flex-1 flex-col items-center justify-center">
      <AuthSuccess />
    </div>
  );
};

export default AuthCompletePage;
