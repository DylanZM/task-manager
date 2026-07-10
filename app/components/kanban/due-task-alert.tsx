"use client";

import { AlertTriangle, Mail, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Props = {
  message: string;
  onDismiss: () => void;
};

export function DueTaskAlert({ message, onDismiss }: Props) {
  return (
    <Alert className="border-amber-200 bg-amber-50/70 text-amber-900">
      <AlertTriangle className="h-4 w-4 text-amber-700" />
      <AlertTitle className="text-xs font-bold uppercase tracking-widest text-amber-700">Due Date Alert</AlertTitle>
      <AlertDescription className="mt-1 text-sm text-amber-900">
        <p>{message}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-amber-700">
          <Mail className="h-3 w-3" />
          A reminder email will be sent.
        </p>
      </AlertDescription>
      <AlertAction>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onDismiss}
          className="h-7 w-7 text-amber-700 hover:bg-amber-100 hover:text-amber-900"
          title="Close alert"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </AlertAction>
    </Alert>
  );
}
