"use client";

import { CheckCircle2, Circle, Clock, MoreVertical } from "lucide-react";
import { Task, TaskStatus } from "@/lib/task-types";
import { TaskCard } from "./task-card";
import { Badge } from "@/app/components/ui/card-badge";

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onOpenEditor: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
}

const COLUMN_CONFIG: Record<TaskStatus, { label: string; icon: any; color: string }> = {
  todo: {
    label: "Por hacer",
    icon: Circle,
    color: "text-zinc-400",
  },
  in_progress: {
    label: "En progreso",
    icon: Clock,
    color: "text-amber-500",
  },
  done: {
    label: "Completado",
    icon: CheckCircle2,
    color: "text-emerald-500",
  },
};

export function TaskColumn({ status, tasks, onOpenEditor, onDeleteTask, onUpdateStatus }: TaskColumnProps) {
  const config = COLUMN_CONFIG[status];
  const Icon = config.icon;

  return (
    <div className="flex flex-col min-w-[320px] max-w-[400px] flex-1">
      <div className="mb-4 flex items-center justify-between px-2">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-6 w-6 items-center justify-center rounded-lg bg-white border border-zinc-200 shadow-sm ${config.color}`}>
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-widest">{config.label}</h3>
          <Badge variant="zinc" size="sm" className="ml-1 font-black bg-zinc-200/50 text-zinc-600 border-zinc-300/50">
            {tasks.length}
          </Badge>
        </div>
        
        <button className="text-zinc-400 hover:text-zinc-950 transition-colors">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-4 p-2 custom-scrollbar">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onOpenEditor={onOpenEditor}
              onDeleteTask={onDeleteTask}
              onUpdateStatus={onUpdateStatus}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/30 p-12 text-center opacity-60">
            <div className="mb-3 rounded-full bg-white p-3 shadow-sm border border-zinc-100">
              <Icon className="h-6 w-6 text-zinc-300" />
            </div>
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Sin tareas</p>
          </div>
        )}
      </div>
    </div>
  );
}
