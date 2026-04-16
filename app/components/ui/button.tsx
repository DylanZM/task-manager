import React from "react";
import { LucideIcon } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "amber";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95";
  
  const variants = {
    primary: "bg-zinc-950 text-zinc-50 hover:bg-zinc-800 shadow-sm",
    secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200",
    outline: "border border-zinc-200 bg-transparent hover:bg-zinc-50 text-zinc-900",
    ghost: "bg-transparent hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
    amber: "bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-200",
  };

  const sizes = {
    sm: "h-9 px-3 text-xs gap-1.5",
    md: "h-11 px-5 text-sm gap-2",
    lg: "h-12 px-6 text-base gap-2.5",
    icon: "h-10 w-10 text-zinc-600 hover:text-zinc-900",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {!isLoading && LeftIcon && (
        <LeftIcon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      )}
      {children && <span>{children}</span>}
      {!isLoading && RightIcon && (
        <RightIcon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      )}
    </button>
  );
}
