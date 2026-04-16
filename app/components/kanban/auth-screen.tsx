"use client";

import { Code2, Globe, Layout, Lock, Mail, User } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/form";
import { Card, Badge } from "@/app/components/ui/card-badge";

type AuthMode = "login" | "register";

type Props = {
  authMode: AuthMode;
  setAuthMode: (mode: AuthMode) => void;
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
  isOAuthLoading: boolean;
  oauthProviders: Array<"github" | "google">;
  onRegister: (event: React.FormEvent<HTMLFormElement>) => void;
  onLogin: (event: React.FormEvent<HTMLFormElement>) => void;
  onVerifyCode: (event: React.FormEvent<HTMLFormElement>) => void;
  onOAuth: (provider: "github" | "google") => void;
};

export function AuthScreen({
  authMode,
  setAuthMode,
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
  isOAuthLoading,
  oauthProviders,
  onRegister,
  onLogin,
  onVerifyCode,
  onOAuth,
}: Props) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-50 p-6 selection:bg-zinc-950 selection:text-white">
      {/* Background Decoration */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-zinc-200/50 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-zinc-200/50 blur-3xl" />
      
      <div className="relative z-10 w-full max-w-[420px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-xl shadow-zinc-200">
            <Layout className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Kanban Flow</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Simplifica tu flujo de trabajo con Inteligencia Artificial.
          </p>
        </div>

        <Card className="overflow-hidden border-zinc-200/60 p-8 shadow-xl shadow-zinc-200/50">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-zinc-950">
              {needsVerificationCode
                ? "Verifica tu correo"
                : authMode === "login"
                ? "Bienvenido de nuevo"
                : "Crea tu cuenta"}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {needsVerificationCode
                ? "Hemos enviado un código a tu email"
                : authMode === "login"
                ? "Ingresa tus credenciales para continuar"
                : "Únete a la plataforma de gestión más avanzada"}
            </p>
          </div>

          {authMessage && (
            <div className="mb-4">
              <Badge variant="amber" className="w-full justify-center py-2 text-center text-xs normal-case">
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
                label="Código de verificación"
                required
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="123456"
                type="text"
                className="text-center text-lg tracking-[0.5em] font-mono"
              />
              <Button type="submit" isLoading={isSubmittingAuth} className="w-full">
                Verificar cuenta
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
                    label="Nombre completo"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="John Doe"
                    type="text"
                  />
                )}
                <Input
                  label="Correo electrónico"
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@ejemplo.com"
                />
                <Input
                  label="Contraseña"
                  required
                  type="password"
                  minLength={minPasswordLength}
                  autoComplete={authMode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                
                <Button type="submit" isLoading={isSubmittingAuth} className="w-full">
                  {authMode === "login" ? "Iniciar sesión" : "Crear cuenta"}
                </Button>
              </form>

              {!needsVerificationCode && oauthProviders.length > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-zinc-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-zinc-500 font-medium">O continúa con</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {oauthProviders.includes("github") && (
                      <Button
                        variant="outline"
                        onClick={() => onOAuth("github")}
                        disabled={isOAuthLoading || isSubmittingAuth}
                        leftIcon={Code2}
                        className="py-6"
                      >
                        GitHub
                      </Button>
                    )}
                    {oauthProviders.includes("google") && (
                      <Button
                        variant="outline"
                        onClick={() => onOAuth("google")}
                        disabled={isOAuthLoading || isSubmittingAuth}
                        leftIcon={Globe}
                        className="py-6"
                      >
                        Google
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
              className="text-sm font-medium text-zinc-600 hover:text-zinc-950 transition-colors"
            >
              {authMode === "login" 
                ? "¿No tienes una cuenta? Regístrate" 
                : "¿Ya tienes cuenta? Inicia sesión"}
            </button>
          </div>
        </Card>

        <footer className="mt-8 flex items-center justify-center gap-4 text-zinc-400">
          <div className="flex items-center gap-1.5 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
            <Lock className="h-3 w-3" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Seguro</span>
          </div>
          <div className="h-1 w-1 rounded-full bg-zinc-300" />
          <div className="flex items-center gap-1.5 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
            <Mail className="h-3 w-3" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Verificado</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
