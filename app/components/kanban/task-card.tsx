"use client";

import { Calendar, Check, Pencil, Trash2 } from "lucide-react";
import { Task, TaskPriority, TaskStatus } from "@/lib/task-types";
import { Card, Badge } from "@/app/components/ui/card-badge";
import { Button } from "@/app/components/ui/button";

interface TaskCardProps {
  task: Task;
  onOpenEditor: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  onToggleChecklistItem: (taskId: string, itemId: string) => void;
}

const PRIORITY_VARIANTS: Record<TaskPriority, "zinc" | "amber" | "red" | "green" | "blue"> = {
  low: "green",
  medium: "blue",
  high: "red",
};

const STATUS_OPTIONS: { label: string; value: TaskStatus }[] = [
  { label: "Backlog", value: "backlog" },
  { label: "To do", value: "todo" },
  { label: "In progress", value: "in_progress" },
  { label: "Done", value: "done" },
];

export function TaskCard({ task, onOpenEditor, onDeleteTask, onUpdateStatus, onToggleChecklistItem }: TaskCardProps) {
  const isPastDue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "done";
  const checklistDone = task.checklist.filter((item) => item.done).length;

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData("application/x-task-id", task.id);
    event.dataTransfer.setData("application/x-task-status", task.status);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      className="group relative flex cursor-grab flex-col border-zinc-200/60 bg-white p-4 transition-all duration-300 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/40 active:cursor-grabbing dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:shadow-none"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <Badge variant={PRIORITY_VARIANTS[task.priority]} size="sm" className="opacity-90">
          {task.priority === "high" ? "High" : task.priority === "medium" ? "Medium" : "Low"}
        </Badge>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenEditor(task)}
            className="h-8 w-8 text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDeleteTask(task.id)}
            className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:text-zinc-500 dark:hover:text-red-400 dark:hover:bg-red-500/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <h4 className="text-sm font-bold text-zinc-950 leading-snug mb-1.5 group-hover:text-zinc-900 transition-colors dark:text-zinc-100 dark:group-hover:text-zinc-50">
        {task.title}
      </h4>

      {task.description && (
        <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed mb-4 dark:text-zinc-400">
          {task.description}
        </p>
      )}

      {task.checklist.length > 0 && (
        <div className="mb-4 rounded-xl border border-zinc-100 bg-zinc-50/60 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/50">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Checklist {checklistDone}/{task.checklist.length}
          </p>
          <div className="space-y-1.5">
            {task.checklist.slice(0, 3).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onToggleChecklistItem(task.id, item.id)}
                className="flex w-full items-center gap-2 rounded-lg px-1 py-1 text-left text-xs hover:bg-white dark:hover:bg-zinc-900"
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded border ${
                    item.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-950"
                  }`}
                >
                  {item.done ? <Check className="h-3 w-3" /> : null}
                </span>
                <span className={item.done ? "line-through text-zinc-400 dark:text-zinc-500" : "text-zinc-600 dark:text-zinc-300"}>{item.text}</span>
              </button>
            ))}
            {task.checklist.length > 3 && (
              <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">+{task.checklist.length - 3} more subtasks</p>
            )}
          </div>
        </div>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          {task.due_date && (
            <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${isPastDue ? 'text-red-500' : 'text-zinc-400 dark:text-zinc-500'}`}>
              <Calendar className="h-3 w-3" />
              <span>{new Date(task.due_date).toLocaleDateString("en-US", { day: 'numeric', month: 'short' })}</span>
            </div>
          )}
        </div>

        <select
          value={task.status}
          onChange={(e) => onUpdateStatus(task.id, e.target.value as TaskStatus)}
          className="bg-transparent text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-950 transition-colors outline-none cursor-pointer dark:text-zinc-500 dark:hover:text-zinc-100"
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
