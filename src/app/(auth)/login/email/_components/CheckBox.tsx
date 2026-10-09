import TextInput from "@/components/text-input/TextInput";

const CheckBox = () => {
  return (
    <div className="flex flex-col gap-4">
      <TextInput
        htmlFor="email"
        id="email"
        type="email"
        placeholder="abc@email.com"
        labelText="이메일(아이디)"
      />
      <TextInput
        id="password"
        type="password"
        placeholder="8자 이상의 비밀번호"
        labelText="비밀번호"
      />
      <label className="flex items-center gap-3">
        <span className="relative inline-flex size-5">
          <input
            type="checkbox"
            className="peer size-5 appearance-none rounded-xs border border-neutral-60 bg-transparent checked:border-primary-40 checked:bg-primary-40"
          />
          <svg
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden text-common-0 peer-checked:block"
          >
            <path
              d="M5 10l3.5 3.5L15 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="text-label3 text-neutral-40">자동 로그인 설정</span>
      </label>
    </div>
  );
};

export default CheckBox;
