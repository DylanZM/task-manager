import { AuthConfig, Board, Task, TaskChecklistItem } from "@/lib/task-types";
import { AuthUser } from "@/app/hooks/kanban/types";

export const DEFAULT_AUTH_CONFIG: AuthConfig = {
  requireEmailVerification: false,
  passwordMinLength: 8,
  verifyEmailMethod: "code",
  resetPasswordMethod: "link",
  oAuthProviders: ["github", "google"],
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
  return value.reduce<Task[]>((acc, item) => {
    if (!item || typeof item !== "object") return acc;
    const task = item as Partial<Task> & { checklist?: unknown };
    const isShapeValid =
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
      typeof task.updated_at === "string";

    if (!isShapeValid) return acc;
    const safeTask = task as Omit<Task, "checklist"> & { checklist?: unknown };

    const checklist = Array.isArray(safeTask.checklist)
      ? safeTask.checklist.reduce<TaskChecklistItem[]>((items, checklistItem) => {
          if (!checklistItem || typeof checklistItem !== "object") return items;
          const candidate = checklistItem as Partial<TaskChecklistItem>;
          if (
            typeof candidate.id !== "string" ||
            typeof candidate.text !== "string" ||
            typeof candidate.done !== "boolean"
          ) {
            return items;
          }
          items.push(candidate as TaskChecklistItem);
          return items;
        }, [])
      : [];

    acc.push({
      id: safeTask.id,
      user_id: safeTask.user_id,
      board_id: safeTask.board_id,
      title: safeTask.title,
      description: safeTask.description ?? null,
      status: safeTask.status,
      priority: safeTask.priority,
      due_date: safeTask.due_date ?? null,
      checklist,
      position: safeTask.position,
      created_at: safeTask.created_at,
      updated_at: safeTask.updated_at,
    });
    return acc;
  }, []);
};

export const toDateInputValue = (isoDate: string | null) => (isoDate ? isoDate.slice(0, 10) : "");
