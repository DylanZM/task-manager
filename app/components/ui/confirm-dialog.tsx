"use client";

import { AlertTriangle } from "lucide-react";
import { AlertDialog } from "radix-ui";
import { Button } from "@/app/components/ui/button";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  isLoading,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <AlertDialog.Root open={open} onOpenChange={(value) => !value && onCancel()}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-200 dark:bg-zinc-950/70" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl shadow-zinc-950/20 animate-in fade-in zoom-in-95 duration-200 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <AlertDialog.Title className="text-base font-bold text-zinc-950 dark:text-zinc-100">
                {title}
              </AlertDialog.Title>
              {description && (
                <AlertDialog.Description className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {description}
                </AlertDialog.Description>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <Button type="button" variant="outline" onClick={onCancel}>
                {cancelLabel}
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button type="button" variant="danger" isLoading={isLoading} onClick={onConfirm}>
                {confirmLabel}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}