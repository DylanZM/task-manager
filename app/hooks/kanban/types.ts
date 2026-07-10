import { TaskPriority, TaskStatus } from "@/lib/task-types";

export type AuthMode = "login" | "register";

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  avatar_url?: string | null;
}

export interface UserProfile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export interface QuickTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}
