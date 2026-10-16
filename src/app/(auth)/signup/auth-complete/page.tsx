const AuthCompletePage = () => {
  return (
    <div className="-mb-14 flex flex-1 flex-col items-center justify-center gap-6.75">
      <svg
        width="66"
        height="66"
        viewBox="0 0 66 66"
        aria-hidden="true"
        className="motion-safe:animate-pop-in"
      >
        <circle cx="33" cy="33" r="33" className="fill-primary-50" />
        <path
          d="M19.7 32.9 L28.6 42.2 L46.3 23.8"
          pathLength={1}
          strokeDasharray={1}
          fill="none"
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-secondary-100 motion-safe:animate-draw-check"
        />
      </svg>
      <h1 className="text-heading2 motion-safe:animate-fade-up">인증 성공</h1>
    </div>
  );
};

export default AuthCompletePage;
