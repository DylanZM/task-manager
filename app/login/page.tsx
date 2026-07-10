"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthScreen } from "@/app/components/kanban/auth-screen";
import { useKanbanLogic } from "@/app/hooks/use-kanban-logic";

export default function LoginPage() {
  const router = useRouter();
  const {
    authConfig,
    isLoadingAuth,
    authMessage,
    authError,
    isSubmittingAuth,
    oauthLoadingProvider,
    email,
    setEmail,
    password,
    setPassword,
    displayName,
    setDisplayName,
    verificationCode,
    setVerificationCode,
    pendingVerificationEmail,
    verificationMethod,
    user,
    handleRegister,
    handleVerifyCode,
    handleLogin,
    handleOAuthSignIn,
  } = useKanbanLogic();

  useEffect(() => {
    if (!isLoadingAuth && user) {
      router.replace("/");
    }
  }, [isLoadingAuth, router, user]);

  if (isLoadingAuth || user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-zinc-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-950" />
          <p className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium shadow-sm">
            Loading login...
          </p>
        </div>
      </main>
    );
  }

  return (
    <AuthScreen
      authMode="login"
      needsVerificationCode={Boolean(pendingVerificationEmail && verificationMethod === "code")}
      verificationCode={verificationCode}
      setVerificationCode={setVerificationCode}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      displayName={displayName}
      setDisplayName={setDisplayName}
      minPasswordLength={authConfig.passwordMinLength}
      authMessage={authMessage}
      authError={authError}
      isSubmittingAuth={isSubmittingAuth}
      oauthLoadingProvider={oauthLoadingProvider}
      oauthProviders={authConfig.oAuthProviders.filter(
        (provider): provider is "github" | "google" =>
          provider === "github" || provider === "google",
      )}
      onRegister={handleRegister}
      onLogin={handleLogin}
      onVerifyCode={handleVerifyCode}
      onOAuth={(provider) => void handleOAuthSignIn(provider)}
    />
  );
}
