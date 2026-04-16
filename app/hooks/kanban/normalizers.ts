import { AuthConfig, Board, Task } from "@/lib/task-types";
import { AuthUser } from "@/app/hooks/kanban/types";

export const DEFAULT_AUTH_CONFIG: AuthConfig = {
  requireEmailVerification: false,
  passwordMinLength: 8,
  verifyEmailMethod: "code",
  resetPasswordMethod: "link",
  oAuthProviders: [],
};

export const toSafeUser = (value: unknown): AuthUser | null => {
  if (!value || typeof value !== "object") return null;
  const candidate = value as { id?: unknown; email?: unknown; name?: unknown };
  if (typeof candidate.id !== "string" || typeof candidate.email !== "string") return null;
  return {
    id: candidate.id,
    email: candidate.email,
    name: typeof candidate.name === "string" ? candidate.name : null,
  };
};

export const toSafeBoards = (value: unknown): Board[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Board => {
    if (!item || typeof item !== "object") return false;
    const board = item as Partial<Board>;
    return (
      typeof board.id === "string" &&
      typeof board.user_id === "string" &&
      typeof board.name === "string" &&
      typeof board.created_at === "string" &&
      typeof board.updated_at === "string"
    );
  });
};

export const toSafeTasks = (value: unknown): Task[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Task => {
    if (!item || typeof item !== "object") return false;
    const task = item as Partial<Task>;
    return (
      typeof task.id === "string" &&
      typeof task.user_id === "string" &&
      typeof task.board_id === "string" &&
      typeof task.title === "string" &&
      (task.description === null || typeof task.description === "string") &&
      (task.status === "backlog" || task.status === "todo" || task.status === "in_progress" || task.status === "done") &&
      (task.priority === "low" || task.priority === "medium" || task.priority === "high") &&
      (task.due_date === null || typeof task.due_date === "string") &&
      typeof task.position === "number" &&
      typeof task.created_at === "string" &&
      typeof task.updated_at === "string"
    );
  });
};

export const toDateInputValue = (isoDate: string | null) => (isoDate ? isoDate.slice(0, 10) : "");
