import { SelectHTMLAttributes } from "react";

export function Select({
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 transition-colors focus:border-clay-400 focus:outline-none focus:ring-2 focus:ring-clay-500/30 ${className}`}
      {...props}
    />
  );
}
