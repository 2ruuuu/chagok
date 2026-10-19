import BackButton from "@/components/back-button/BackButton";
import EmailLoginForm from "./_components/EmailLoginForm";

const EmailLoginPage = () => {
  return (
    <div>
      <div className="flex w-full justify-start py-2">
        <BackButton />
      </div>
      <EmailLoginForm />
    </div>
  );
};

export default EmailLoginPage;
