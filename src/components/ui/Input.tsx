import { InputHTMLAttributes } from "react";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 transition-colors focus:border-clay-400 focus:outline-none focus:ring-2 focus:ring-clay-500/30 ${className}`}
      {...props}
    />
  );
}
