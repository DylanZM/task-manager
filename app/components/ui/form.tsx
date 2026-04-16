import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          {label}
        </label>
      ) }
      <input
        className={`h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-950 transition-all duration-200 placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-4 focus:ring-zinc-100 outline-none disabled:bg-zinc-50 disabled:text-zinc-500 ${
          error ? "border-red-500 ring-red-50" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = "", ...props }: TextareaProps) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          {label}
        </label>
      )}
      <textarea
        className={`w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-950 transition-all duration-200 placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-4 focus:ring-zinc-100 outline-none min-h-[100px] resize-none disabled:bg-zinc-50 disabled:text-zinc-500 ${
          error ? "border-red-500 ring-red-50" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
}

export function Select({ label, error, options, className = "", ...props }: SelectProps) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`h-11 w-full appearance-none rounded-xl border border-zinc-200 bg-white px-3 pr-10 text-sm text-zinc-950 transition-all duration-200 focus:border-zinc-950 focus:ring-4 focus:ring-zinc-100 outline-none disabled:bg-zinc-50 disabled:text-zinc-500 ${
            error ? "border-red-500 ring-red-50" : ""
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500">
          <svg className="h-4 w-4 fill-none stroke-current" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}
