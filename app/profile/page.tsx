"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Save, User } from "lucide-react";
import { useKanbanLogic } from "@/app/hooks/use-kanban-logic";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/form";
import { Card } from "@/app/components/ui/card-badge";
import { LIMITS, validateAvatarFile } from "@/lib/validation";

export default function ProfilePage() {
  const router = useRouter();
  const {
    isLoadingAuth,
    user,
    profile,
    isUpdatingProfile,
    taskError,
    handleUpdateProfile,
  } = useKanbanLogic();

  const [displayName, setDisplayName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState("");

  const avatarUrl = avatarPreview || profile?.avatar_url || user?.avatar_url || null;
  const nameValue = displayName || profile?.display_name || user?.name || "";

  const initials = useMemo(() => {
    const name = profile?.display_name || user?.name || user?.email || "";
    return name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [profile, user]);

  useEffect(() => {
    if (!isLoadingAuth && !user) {
      router.replace("/login");
    }
  }, [isLoadingAuth, router, user]);

  const handleSave = async () => {
    await handleUpdateProfile({ display_name: nameValue || null }, avatarFile);
    setDisplayName(nameValue);
    setAvatarFile(null);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const error = await validateAvatarFile(file);
    if (error) {
      setAvatarError(error);
      setAvatarFile(null);
      setAvatarPreview(null);
      e.target.value = "";
      return;
    }
    setAvatarError("");
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (isLoadingAuth || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-950 dark:border-zinc-700 dark:border-t-zinc-100" />
          <p className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            Loading...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-zinc-950 selection:bg-zinc-950 selection:text-white dark:bg-zinc-950 dark:text-zinc-100 dark:selection:bg-white dark:selection:text-zinc-950">
      <div className="mx-auto w-full max-w-lg p-6 lg:p-10">
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Settings
            </p>
            <h1 className="text-xl font-black tracking-tight text-zinc-950 dark:text-zinc-100">
              Profile
            </h1>
          </div>
        </div>

        <Card className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-16 w-16 rounded-2xl border-2 border-zinc-200 object-cover dark:border-zinc-700"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-950 text-lg font-bold text-white dark:bg-white dark:text-zinc-950">
                  {initials || <User className="h-8 w-8" />}
                </div>
              )}
              <label className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-zinc-200 text-zinc-600 shadow-sm hover:bg-zinc-300 dark:border-zinc-900 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600">
                <Camera className="h-3.5 w-3.5" />
                <input type="file" accept=".png,.jpg,.jpeg,image/png,image/jpeg" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-950 dark:text-zinc-100">
                {profile?.display_name || user.email}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{user.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Display Name"
              value={nameValue}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              maxLength={LIMITS.displayNameMaxLength}
            />

            <Input
              label="Email"
              value={user.email}
              disabled
            />

            {avatarError && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                {avatarError}
              </p>
            )}

            {taskError && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                {taskError}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => router.push("/")}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                isLoading={isUpdatingProfile}
                leftIcon={Save}
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
