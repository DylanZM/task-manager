export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  user_id: string;
  board_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Board {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface AuthConfig {
  requireEmailVerification: boolean;
  passwordMinLength: number;
  verifyEmailMethod: "code" | "link";
  resetPasswordMethod: "code" | "link";
  oAuthProviders: string[];
}
