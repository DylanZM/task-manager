"use client";

import { Folder, LayoutDashboard, LogOut, Moon, Plus, Sun, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PullCord } from "pullcord";
import "pullcord/pullcord.css";
import { Board } from "@/lib/task-types";
import { AuthUser } from "@/app/hooks/kanban/types";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/form";
import { Card, Badge } from "@/app/components/ui/card-badge";
import { ConfirmDialog } from "@/app/components/ui/confirm-dialog";
import { useTheme } from "@/app/hooks/use-theme";
import { LIMITS } from "@/lib/validation";

type Props = {
  boards: Board[];
  selectedBoardId: string | null;
  newBoardName: string;
  setNewBoardName: (value: string) => void;
  isCreatingBoard: boolean;
  taskError: string;
  user: AuthUser | null;
  profileAvatarUrl: string | null;
  onCreateBoard: (event: React.FormEvent<HTMLFormElement>) => void;
  onSwitchBoard: (boardId: string) => void;
  onDeleteBoard: (boardId: string) => void;
  onSignOut: () => void;
};

export function BoardSidebar({
  boards,
  selectedBoardId,
  newBoardName,
  setNewBoardName,
  isCreatingBoard,
  taskError,
  user,
  profileAvatarUrl,
  onCreateBoard,
  onSwitchBoard,
  onDeleteBoard,
  onSignOut,
}: Props) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [pendingDeleteBoard, setPendingDeleteBoard] = useState<Board | null>(null);
  const avatarUrl = profileAvatarUrl || user?.avatar_url || null;
  const initials = (user?.name || user?.email || "")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const confirmDeleteBoard = () => {
    if (!pendingDeleteBoard) return;
    onDeleteBoard(pendingDeleteBoard.id);
    setPendingDeleteBoard(null);
  };

  return (
    <Card className="flex flex-col h-fit border-zinc-200/60 shadow-lg shadow-zinc-200/40 p-5 overflow-hidden dark:border-zinc-800 dark:shadow-none">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-lg shadow-zinc-200 dark:bg-white dark:text-zinc-950 dark:shadow-none">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Workspace</p>
            <h1 className="text-sm font-bold text-zinc-950 dark:text-zinc-100">My Projects</h1>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 xl:hidden items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-400 hover:border-zinc-300 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-500 dark:hover:text-zinc-100"
            title={theme === "dark" ? "Light mode" : "Dark mode"}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="h-9 w-9 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-400 hover:border-zinc-300 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-500"
            title="Profile"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-[10px] font-bold">
                {initials}
              </span>
            )}
          </button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSignOut}
            className="h-9 w-9 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-500/10"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <form className="flex flex-col gap-2" onSubmit={onCreateBoard}>
          <div className="relative group">
            <Input
              value={newBoardName}
              onChange={(event) => setNewBoardName(event.target.value)}
              placeholder="Project name..."
              maxLength={LIMITS.boardNameMaxLength}
              className="pr-12 h-10 bg-zinc-50/50 border-zinc-200/50 focus:bg-white dark:bg-zinc-950/60 dark:border-zinc-800 dark:focus:bg-zinc-950"
            />
            <Button
              type="submit"
              variant="primary"
              size="icon"
              className={`absolute right-1 top-1 h-8 w-8 transition-all ${newBoardName.trim() ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
              disabled={isCreatingBoard || !newBoardName.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>

      <nav className="space-y-1">
        <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Active Boards</p>
        <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
          {boards.length > 0 ? (
            boards.map((board) => {
              const selected = board.id === selectedBoardId;
              return (
                <div key={board.id} className="group relative flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onSwitchBoard(board.id)}
                    className={`flex flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
                      selected
                        ? "bg-zinc-950 text-white shadow-md shadow-zinc-200 translate-x-1 dark:bg-white dark:text-zinc-950 dark:shadow-none"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                    }`}
                  >
                    <Folder className={`h-4 w-4 transition-colors ${selected ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300'}`} />
                    <span className="truncate">{board.name}</span>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setPendingDeleteBoard(board)}
                    className={`h-9 w-9 flex-shrink-0 transition-all duration-200 ${
                      selected
                        ? "text-zinc-400 hover:text-white hover:bg-white/10 dark:text-zinc-500 dark:hover:text-zinc-950 dark:hover:bg-white/20"
                        : "opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-600 hover:bg-red-50 dark:text-zinc-600 dark:hover:text-red-400 dark:hover:bg-red-500/10"
                    }`}
                    title={`Delete ${board.name}`}
                    aria-label={`Delete board ${board.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 p-6 text-center dark:border-zinc-800 dark:bg-zinc-950/40">
              <Folder className="mb-2 h-6 w-6 text-zinc-300 dark:text-zinc-600" />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">No boards yet.</p>
            </div>
          )}
        </div>
      </nav>

      {taskError && (
        <div className="mt-6">
          <Badge variant="red" className="w-full justify-center py-2 text-center text-[10px] normal-case">
            {taskError}
          </Badge>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDeleteBoard)}
        title="Delete board"
        description={`This will permanently delete "${pendingDeleteBoard?.name}" and all its tasks.`}
        confirmLabel="Delete"
        onConfirm={confirmDeleteBoard}
        onCancel={() => setPendingDeleteBoard(null)}
      />

      <PullCord
        onPull={toggleTheme}
        pulled={theme === "dark"}
        ariaLabel="Toggle light and dark theme"
        className="hidden xl:block"
      />
    </Card>
  );
}