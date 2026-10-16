import VerifyForm from "./_components/VerifyForm";

const Verify = async ({ searchParams }: PageProps<"/signup/verify">) => {
  const { email } = await searchParams;
  return <VerifyForm email={typeof email === "string" ? email : null} />;
};

export default Verify;
