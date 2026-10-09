import { cn } from "@/lib/cn";

type TextInputProps = {
  placeholder?: string;
  value?: string;
  onChange?: string;
  size?: keyof typeof sizes;
  edgeCase?: keyof typeof edgeCases;
  className?: string;
  type: string;
  id: string;
  labelText?: string;
  htmlFor?: string;
};

const sizes = {
  sm: "w-83.75 h-12",
};

const edgeCases = {
  none: "border-line-alternative",
  focus: "border-neutral-5",
  error: "border-status-danger",
};

const TextInput = ({
  placeholder,
  value,
  onChange,
  size = "sm",
  className,
  edgeCase = "none",
  type,
  id,
  labelText,
  htmlFor,
}: TextInputProps) => {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-body3 text-neutral-5">
        {labelText}
      </label>
      <input
        className={cn(
          "text-label2 text-common-0 placeholder:text-neutral-50 px-4 py-1 overflow-hidden rounded-lg border bg-[#ffffff]/10 ",
          sizes[size],
          edgeCases[edgeCase],
          className,
        )}
        placeholder={placeholder}
        type={type}
        id={id}
      />
    </div>
  );
};

export default TextInput;
