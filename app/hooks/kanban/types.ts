import { TaskPriority, TaskStatus } from "@/lib/task-types";

export type AuthMode = "login" | "register";

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
}

export interface QuickTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}
