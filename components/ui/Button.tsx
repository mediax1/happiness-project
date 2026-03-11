import { ReactNode } from "react";

interface ButtonProps {
  onClick?: () => void;
  children: ReactNode;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

export default function Button({
  onClick,
  children,
  variant = "primary",
  disabled = false,
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl font-bold text-base px-8 py-3.5 transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-900/30 focus:ring-amber-500",
    secondary:
      "bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-200 focus:ring-zinc-600",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]}`}
    >
      {children}
    </button>
  );
}