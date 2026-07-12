import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-clay-500 text-white shadow-sm shadow-clay-900/10 hover:bg-clay-600 active:bg-clay-700 disabled:bg-clay-300",
  secondary:
    "bg-white text-stone-800 border border-stone-300 hover:border-stone-400 hover:bg-stone-50 disabled:text-stone-400",
  ghost:
    "bg-transparent text-stone-700 hover:bg-stone-900/5 disabled:text-stone-400",
  danger: "bg-red-600 text-white hover:bg-red-500 disabled:bg-red-300",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:shadow-none ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
