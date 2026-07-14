import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "icon" | "danger";
const base =
  "btn inline-flex items-center justify-center gap-2 font-extrabold transition disabled:cursor-wait disabled:opacity-70";
const variants: Record<Variant, string> = {
  primary: "btn-primary px-6 h-12",
  secondary: "btn-secondary px-5 h-12",
  icon: "btn-icon size-11",
  danger: "btn-danger px-6 h-12",
};
const sizes = { sm: "h-9 px-4 text-sm", md: "h-12 px-6", lg: "h-12 px-7 text-base" };

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: keyof typeof sizes }) {
  return (
    <button className={`${base} ${variants[variant]} ${size !== "sm" && variant !== "icon" ? sizes[size] : ""} ${className}`} {...props}>
      {children}
    </button>
  );
}
