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
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const STATUS_OPTIONS: TaskStatus[] = ["backlog", "todo", "in_progress", "done"];
