import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-3 whitespace-nowrap border border-transparent transition-colors outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-40 text-common-0 hover:bg-primary-50 active:bg-primary-60",
        disable: "bg-neutral-20 text-common-0 ",
        google:
          "border-line-normal bg-common-0 text-common-100 hover:bg-neutral-5",
        kakao: "bg-kakao text-common-100 hover:bg-kakao/90",
      },
      size: {
        xl: "h-12 w-full rounded-lg px-3.75 text-body1 font-semibold [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "xl",
    },
  },
);

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants>;

function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
