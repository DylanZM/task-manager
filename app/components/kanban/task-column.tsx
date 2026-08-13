"use client";

import { CheckCircle2, Circle, Clock, MoreVertical, Plus, Archive, X, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Task, TaskStatus } from "@/lib/task-types";
import { QuickTaskInput } from "@/app/hooks/kanban/types";
import { TaskCard } from "./task-card";
import { Card, Badge } from "@/app/components/ui/card-badge";
import { Button } from "@/app/components/ui/button";
import { Input, Textarea } from "@/app/components/ui/form";
import { useState } from "react";

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onOpenEditor: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  onToggleChecklistItem: (taskId: string, itemId: string) => void;
  onCreateTask: (event: React.FormEvent<HTMLFormElement> | TaskStatus | QuickTaskInput) => void;
  onAiGenerate: (title: string) => Promise<string | null>;
}

const COLUMN_CONFIG: Record<TaskStatus, { label: string; icon: LucideIcon; color: string }> = {
  backlog: {
    label: "Backlog",
    icon: Archive,
    color: "text-zinc-500",
  },
  todo: {
    label: "To do",
    icon: Circle,
    color: "text-blue-500",
  },
  in_progress: {
    label: "In progress",
    icon: Clock,
    color: "text-amber-500",
  },
  done: {
    label: "Done",
    icon: CheckCircle2,
    color: "text-emerald-500",
  },
};

export function TaskColumn({
  status,
  tasks,
  onOpenEditor,
  onDeleteTask,
  onUpdateStatus,
  onToggleChecklistItem,
  onCreateTask,
  onAiGenerate,
}: TaskColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const config = COLUMN_CONFIG[status];
  const Icon = config.icon;

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreateTask({
      title: newTitle,
      description: newDesc,
      status: status,
      priority: "medium"
    });
    setNewTitle("");
    setNewDesc("");
    setIsAdding(false);
  };

  const handleAiAction = async () => {
    if (!newTitle.trim()) return;
    setIsGenerating(true);
    const desc = await onAiGenerate(newTitle);
    if (desc) setNewDesc(desc);
    setIsGenerating(false);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const taskId = event.dataTransfer.getData("application/x-task-id");
    const currentStatus = event.dataTransfer.getData("application/x-task-status") as TaskStatus | "";
    if (!taskId || currentStatus === status) return;
    onUpdateStatus(taskId, status);
  };

  return (
    <div className="flex flex-col min-w-[260px] max-w-[320px] lg:max-w-none flex-1">
      <div className="mb-4 flex items-center justify-between px-2">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-6 w-6 items-center justify-center rounded-lg bg-white border border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 ${config.color}`}>
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-widest leading-none truncate dark:text-zinc-100">{config.label}</h3>
          <Badge variant="zinc" size="sm" className="ml-1 font-black bg-zinc-200/50 text-zinc-600 border-zinc-300/50">
            {tasks.length}
          </Badge>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsAdding(!isAdding)}
            className="h-8 w-8 text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
          >
            {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
          <button className="text-zinc-400 hover:text-zinc-950 transition-colors p-1 dark:text-zinc-500 dark:hover:text-zinc-100">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        className={`custom-scrollbar flex flex-col gap-4 rounded-2xl p-2 transition-colors ${
          isDragOver ? "bg-blue-50/70 ring-2 ring-blue-300/70 ring-inset dark:bg-blue-500/10 dark:ring-blue-500/40" : ""
        }`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isAdding && (
          <Card className="p-3 border-blue-200 bg-blue-50/30 shadow-md animate-in fade-in slide-in-from-top-2 duration-200 dark:border-blue-500/30 dark:bg-blue-500/10">
            <form onSubmit={handleQuickAdd} className="space-y-3">
              <Input
                autoFocus
                placeholder="Task title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="h-9 text-sm bg-white font-bold"
              />
              <div className="relative group">
                <Textarea
                  placeholder="Description (optional)..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="text-xs bg-white min-h-[80px] pr-10 resize-none"
                />
                <Button
                  type="button"
                  variant="amber"
                  size="sm"
                  onClick={handleAiAction}
                  disabled={isGenerating || !newTitle.trim()}
                  className="absolute right-2 bottom-2 h-7 px-2 text-[10px]"
                >
                  {isGenerating ? "..." : <Sparkles className="h-3 w-3" />}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button type="submit" size="sm" className="flex-1 h-8 text-[11px] font-bold">Add Task</Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsAdding(false)}
                  className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </form>
          </Card>
        )}

        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onOpenEditor={onOpenEditor}
              onDeleteTask={onDeleteTask}
              onUpdateStatus={onUpdateStatus}
              onToggleChecklistItem={onToggleChecklistItem}
            />
          ))
        ) : !isAdding && (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/30 p-12 text-center opacity-60 dark:border-zinc-800 dark:bg-zinc-900/30">
            <div className="mb-3 rounded-full bg-white p-3 shadow-sm border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
              <Icon className="h-6 w-6 text-zinc-300 dark:text-zinc-600" />
            </div>
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest dark:text-zinc-500">No tasks</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdding(true)}
              className="mt-4 border-zinc-300 text-zinc-500 hover:text-zinc-950 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-100"
              leftIcon={Plus}
            >
              Add task
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
