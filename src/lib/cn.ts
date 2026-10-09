import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "display1",
        "display2",
        "heading1",
        "heading2",
        "heading3",
        "body1",
        "body2",
        "body3",
        "label1",
        "label2",
        "label3",
        "caption1",
        "caption2",
      ],
      shadow: ["spread-sm", "spread-md"],
      blur: ["chrome"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
