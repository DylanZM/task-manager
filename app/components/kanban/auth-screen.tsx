"use client";

import { Layout } from "lucide-react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/form";
import { Card, Badge } from "@/app/components/ui/card-badge";

type AuthMode = "login" | "register";

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.44a5.5 5.5 0 0 1-2.39 3.61v3h3.87c2.26-2.08 3.57-5.15 3.57-8.85z"
      fill="#4285F4"
    />
    <path
      d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.87-3c-1.07.72-2.44 1.16-4.06 1.16-3.12 0-5.76-2.1-6.7-4.92H1.3v3.09A11.99 11.99 0 0 0 12 24z"
      fill="#34A853"
    />
    <path
      d="M5.3 14.33a7.2 7.2 0 0 1 0-4.66V6.58H1.3a12 12 0 0 0 0 10.84l4-3.09z"
      fill="#FBBC05"
    />
    <path
      d="M12 4.75c1.76 0 3.34.61 4.58 1.8l3.43-3.43C17.94 1.19 15.24 0 12 0A11.99 11.99 0 0 0 1.3 6.58l4 3.09c.94-2.82 3.58-4.92 6.7-4.92z"
      fill="#EA4335"
    />
  </svg>
);

type Props = {
  authMode: AuthMode;
  needsVerificationCode: boolean;
  verificationCode: string;
  setVerificationCode: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  displayName: string;
  setDisplayName: (value: string) => void;
  minPasswordLength: number;
  authMessage: string;
  authError: string;
  isSubmittingAuth: boolean;
  oauthLoadingProvider: "google" | null;
  oauthProviders: Array<"google">;
  onRegister: (event: React.FormEvent<HTMLFormElement>) => void;
  onLogin: (event: React.FormEvent<HTMLFormElement>) => void;
  onVerifyCode: (event: React.FormEvent<HTMLFormElement>) => void;
  onOAuth: (provider: "google") => void;
};

export function AuthScreen({
  authMode,
  needsVerificationCode,
  verificationCode,
  setVerificationCode,
  email,
  setEmail,
  password,
  setPassword,
  displayName,
  setDisplayName,
  minPasswordLength,
  authMessage,
  authError,
  isSubmittingAuth,
  oauthLoadingProvider,
  oauthProviders,
  onRegister,
  onLogin,
  onVerifyCode,
  onOAuth,
}: Props) {
  const isGoogleLoading = oauthLoadingProvider === "google";
  const isAnyOAuthLoading = Boolean(oauthLoadingProvider);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white p-6 selection:bg-zinc-950 selection:text-white">
      <div className="w-full max-w-105">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-xl shadow-zinc-200">
            <Layout className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">
            Kanban Flow
          </h1>
            <p className="mt-2 text-sm text-zinc-600">
              Simplify your workflow with Artificial Intelligence.
            </p>
        </div>

        <Card
          glass
          className="overflow-hidden border-zinc-200/60 bg-white p-8 shadow-xl shadow-zinc-200/50"
        >
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-black text-zinc-950">
              {needsVerificationCode
                ? "Verify your email"
                : authMode === "login"
                  ? "Welcome back"
                  : "Create your account"}
            </h2>
            <p className="mt-2 text-sm font-medium text-zinc-500">
              {needsVerificationCode
                ? "We've sent a code to your email"
                : authMode === "login"
                  ? "Enter your credentials to continue"
                  : "Join the most advanced management platform"}
            </p>
          </div>

          {authMessage && (
            <div className="mb-4">
              <Badge
                variant="amber"
                className="w-full justify-center py-2 text-center text-xs normal-case"
              >
                {authMessage}
              </Badge>
            </div>
          )}

          {authError && (
            <div className="mb-4">
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
                {authError}
              </div>
            </div>
          )}

          {needsVerificationCode ? (
            <form className="space-y-4" onSubmit={onVerifyCode}>
              <Input
                label="Verification code"
                required
                value={verificationCode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setVerificationCode(e.target.value)
                }
                placeholder="123456"
                type="text"
                className="text-center text-lg tracking-[0.5em] font-mono shadow-none focus:ring-0"
              />
              <Button
                type="submit"
                isLoading={isSubmittingAuth}
                className="w-full"
              >
                Verify account
              </Button>
            </form>
          ) : (
            <>
              <form
                className="space-y-4"
                onSubmit={authMode === "login" ? onLogin : onRegister}
              >
                {authMode === "register" && (
                  <Input
                    label="Full name"
                    value={displayName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setDisplayName(e.target.value)
                    }
                    placeholder="John Doe"
                    type="text"
                    className="shadow-none focus:ring-0"
                  />
                )}
                <Input
                  label="Email"
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                  placeholder="name@example.com"
                  className="shadow-none focus:ring-0"
                />
                <Input
                  label="Password"
                  required
                  type="password"
                  minLength={minPasswordLength}
                  autoComplete={
                    authMode === "login" ? "current-password" : "new-password"
                  }
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                  }
                  placeholder="••••••••"
                  className="shadow-none focus:ring-0"
                />

                <Button
                  type="submit"
                  isLoading={isSubmittingAuth}
                  className="w-full"
                >
                  {authMode === "login" ? "Sign in" : "Create account"}
                </Button>
              </form>

              {!needsVerificationCode && oauthProviders.length > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-zinc-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-zinc-500 font-medium">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {oauthProviders.includes("google") && (
                      <Button
                        variant="outline"
                        type="button"
                        isLoading={isGoogleLoading}
                        onClick={() => onOAuth("google")}
                        disabled={isAnyOAuthLoading || isSubmittingAuth}
                        className="h-12 [&>span]:inline-flex [&>span]:items-center [&>span]:gap-2 [&>span]:whitespace-nowrap [&>span]:leading-none"
                      >
                        <GoogleIcon className="h-5 w-5 shrink-0" />
                        Google
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="mt-8 text-center text-sm font-medium text-zinc-600">
            {authMode === "login" ? (
              <>Don&apos;t have an account?{" "}
                <Link href="/register" className="transition-colors hover:text-zinc-950">
                  Register
                </Link>
              </>
            ) : (
              <>Already have an account?{" "}
                <Link href="/login" className="transition-colors hover:text-zinc-950">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </Card>

        <footer className="mt-8 flex items-center justify-center gap-4 text-zinc-400">
          <div className="h-1 w-1 rounded-full bg-zinc-300" />
        </footer>
      </div>
    </main>
  );
}
