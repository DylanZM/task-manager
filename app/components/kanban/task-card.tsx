"use client";

import { Calendar, Clock, Edit3, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Task, TaskPriority, TaskStatus } from "@/lib/task-types";
import { Card, Badge } from "@/app/components/ui/card-badge";
import { Button } from "@/app/components/ui/button";

interface TaskCardProps {
  task: Task;
  onOpenEditor: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
}

const PRIORITY_VARIANTS: Record<TaskPriority, "zinc" | "amber" | "red" | "green" | "blue"> = {
  low: "green",
  medium: "blue",
  high: "red",
};

const STATUS_OPTIONS: { label: string; value: TaskStatus }[] = [
  { label: "Pendiente", value: "todo" },
  { label: "En curso", value: "in_progress" },
  { label: "Completado", value: "done" },
];

export function TaskCard({ task, onOpenEditor, onDeleteTask, onUpdateStatus }: TaskCardProps) {
  const isPastDue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "done";

  return (
    <Card className="group relative flex flex-col p-4 border-zinc-200/60 bg-white hover:border-zinc-300 transition-all duration-300 hover:shadow-lg hover:shadow-zinc-200/40">
      <div className="mb-3 flex items-start justify-between gap-2">
        <Badge variant={PRIORITY_VARIANTS[task.priority]} size="sm" className="opacity-90">
          {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Media" : "Baja"}
        </Badge>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenEditor(task)}
            className="h-8 w-8 text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDeleteTask(task.id)}
            className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <h4 className="text-sm font-bold text-zinc-950 leading-snug mb-1.5 group-hover:text-zinc-900 transition-colors">
        {task.title}
      </h4>

      {task.description && (
        <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed mb-4">
          {task.description}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-3">
        <div className="flex items-center gap-2">
          {task.due_date && (
            <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${isPastDue ? 'text-red-500' : 'text-zinc-400'}`}>
              <Calendar className="h-3 w-3" />
              <span>{new Date(task.due_date).toLocaleDateString("es-ES", { day: 'numeric', month: 'short' })}</span>
            </div>
          )}
        </div>

        <select
          value={task.status}
          onChange={(e) => onUpdateStatus(task.id, e.target.value as TaskStatus)}
          className="bg-transparent text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-950 transition-colors outline-none cursor-pointer"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </Card>
  );
}
