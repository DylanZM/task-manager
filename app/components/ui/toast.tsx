"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Info, Undo2, X, XCircle } from "lucide-react";

type ToastVariant = "default" | "success" | "error";

type ToastAction = {
  label: string;
  onClick: () => void;
};

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
  action?: ToastAction;
};

type CreateToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: ToastAction;
};

let listeners: Array<(toasts: ToastItem[]) => void> = [];
let toasts: ToastItem[] = [];
let counter = 0;

function emit() {
  for (const listener of listeners) listener([...toasts]);
}

export function toast(input: CreateToastInput) {
  const id = `toast-${++counter}`;
  const item: ToastItem = {
    id,
    title: input.title,
    description: input.description,
    variant: input.variant ?? "default",
    duration: input.duration ?? 4000,
    action: input.action,
  };
  toasts = [...toasts, item];
  emit();
  if (item.duration > 0) {
    setTimeout(() => dismissToast(id), item.duration);
  }
  return id;
}

export function dismissToast(id: string) {
  toasts = toasts.filter((item) => item.id !== id);
  emit();
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener = (next: ToastItem[]) => setItems(next);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    dismissToast(id);
  }, []);

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2.5 p-2"
    >
      {items.map((item) => {
        const icon =
          item.variant === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
          ) : item.variant === "error" ? (
            <XCircle className="h-4 w-4 shrink-0 text-red-500" />
          ) : (
            <Info className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
          );

        return (
          <div
            key={item.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xl shadow-zinc-950/10 animate-in fade-in slide-in-from-bottom-2 duration-200 dark:border-zinc-800 dark:bg-zinc-900"
          >
            {icon}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">{item.title}</p>
              {item.description && (
                <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">{item.description}</p>
              )}
            </div>
            {item.action && (
              <button
                type="button"
                onClick={() => {
                  item.action?.onClick();
                  dismiss(item.id);
                }}
                className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-zinc-950 transition-colors hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                <Undo2 className="h-3.5 w-3.5" />
                {item.action.label}
              </button>
            )}
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              className="shrink-0 rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
