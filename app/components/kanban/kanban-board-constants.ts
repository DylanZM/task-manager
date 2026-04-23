import { TaskPriority, TaskStatus } from "@/lib/task-types";

export type DueFilter = "all" | "overdue" | "today" | "this_week" | "no_due";
export type ViewMode = "kanban" | "calendar";

export type AppNotification = {
  id: string;
  message: string;
  kind: "info" | "success" | "warning";
  taskId?: string;
  dueDate?: string | null;
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: "Backlog",
  todo: "Por hacer",
  in_progress: "En progreso",
  done: "Completado",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

export const STATUS_OPTIONS: TaskStatus[] = ["backlog", "todo", "in_progress", "done"];
