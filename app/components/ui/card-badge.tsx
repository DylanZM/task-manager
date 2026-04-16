import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export function Card({ children, glass = false, className = "", ...props }: CardProps) {
  const baseStyles = "rounded-2xl border border-zinc-200 transition-all duration-300 shadow-sm";
  const variants = glass 
    ? "bg-white/60 backdrop-blur-xl border-white/40 shadow-xl shadow-zinc-200/50" 
    : "bg-white hover:border-zinc-300 hover:shadow-md";

  return (
    <div className={`${baseStyles} ${variants} ${className}`} {...props}>
      {children}
    </div>
  );
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "zinc" | "amber" | "red" | "green" | "blue";
  size?: "sm" | "md";
}

export function Badge({ 
  children, 
  variant = "zinc", 
  size = "sm",
  className = "", 
  ...props 
}: BadgeProps) {
  const baseStyles = "inline-flex items-center rounded-lg font-bold uppercase tracking-wider transition-colors";
  
  const variants = {
    zinc: "bg-zinc-100 text-zinc-600 border border-zinc-200",
    amber: "bg-amber-50 text-amber-700 border border-amber-200",
    red: "bg-red-50 text-red-700 border border-red-200",
    green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    blue: "bg-blue-50 text-blue-700 border border-blue-200",
  };

  const sizes = {
    sm: "px-1.5 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-[11px]",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </span>
  );
}
