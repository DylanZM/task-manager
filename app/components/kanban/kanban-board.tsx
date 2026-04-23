"use client";

import { useMemo, useState } from "react";
import { Columns3 } from "lucide-react";
import { Board, Task, TaskChecklistItem, TaskPriority, TaskStatus } from "@/lib/task-types";
import { QuickTaskInput } from "@/app/hooks/kanban/types";
import { Card, Badge } from "@/app/components/ui/card-badge";
import { TaskColumn } from "./task-column";
import { KanbanBoardHeader } from "./kanban-board-header";
import { KanbanCalendarView } from "./kanban-calendar-view";
import { TaskEditorModal } from "./task-editor-modal";
import { AppNotification, DueFilter, ViewMode, STATUS_OPTIONS } from "./kanban-board-constants";

type Props = {
  userEmail: string;
  selectedBoard: Board | null;
  selectedBoardId: string | null;
  editingTaskId: string | null;
  editingTitle: string;
  setEditingTitle: (value: string) => void;
  editingDescription: string;
  setEditingDescription: (value: string) => void;
  editingStatus: TaskStatus;
  setEditingStatus: (value: TaskStatus) => void;
  editingPriority: TaskPriority;
  setEditingPriority: (value: TaskPriority) => void;
  editingDueDate: string;
  setEditingDueDate: (value: string) => void;
  editingChecklist: TaskChecklistItem[];
  tasks: Task[];
  groupedTasks: Record<TaskStatus, Task[]>;
  isLoadingTasks: boolean;
  isGeneratingEditingDescription: boolean;
  onCreateTask: (event: React.FormEvent<HTMLFormElement> | TaskStatus | QuickTaskInput) => void;
  onSaveEditor: (event: React.FormEvent<HTMLFormElement>) => void;
  onCloseEditor: () => void;
  onGenerateEditingDescription: () => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onOpenEditor: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAiGenerate: (title: string) => Promise<string | null>;
  onAddEditingChecklistItem: (text: string) => void;
  onToggleEditingChecklistItem: (itemId: string) => void;
  onRemoveEditingChecklistItem: (itemId: string) => void;
  onToggleChecklistItem: (taskId: string, itemId: string) => void;
};

function isToday(value: Date) {
  const now = new Date();
  return (
    value.getFullYear() === now.getFullYear() &&
    value.getMonth() === now.getMonth() &&
    value.getDate() === now.getDate()
  );
}

function isThisWeek(value: Date) {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const start = new Date(now);
  start.setDate(now.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return value >= start && value < end;
}

export function KanbanBoard({
  userEmail,
  selectedBoard,
  selectedBoardId,
  editingTaskId,
  editingTitle,
  setEditingTitle,
  editingDescription,
  setEditingDescription,
  editingStatus,
  setEditingStatus,
  editingPriority,
  setEditingPriority,
  editingDueDate,
  setEditingDueDate,
  editingChecklist,
  tasks,
  groupedTasks,
  isLoadingTasks,
  isGeneratingEditingDescription,
  onCreateTask,
  onSaveEditor,
  onCloseEditor,
  onGenerateEditingDescription,
  onUpdateTaskStatus,
  onOpenEditor,
  onDeleteTask,
  onAiGenerate,
  onAddEditingChecklistItem,
  onToggleEditingChecklistItem,
  onRemoveEditingChecklistItem,
  onToggleChecklistItem,
}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"all" | TaskPriority>("all");
  const [dueFilter, setDueFilter] = useState<DueFilter>("all");
  const [showNotifications, setShowNotifications] = useState(false);

  const filteredTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const now = new Date();

    return tasks.filter((task) => {
      const queryMatches =
        !normalizedQuery ||
        task.title.toLowerCase().includes(normalizedQuery) ||
        (task.description ?? "").toLowerCase().includes(normalizedQuery) ||
        task.checklist.some((item) => item.text.toLowerCase().includes(normalizedQuery));
      if (!queryMatches) return false;

      if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;

      if (dueFilter === "all") return true;
      if (dueFilter === "no_due") return !task.due_date;
      if (!task.due_date) return false;

      const dueDate = new Date(task.due_date);
      if (dueFilter === "overdue") return dueDate < now && task.status !== "done";
      if (dueFilter === "today") return isToday(dueDate);
      if (dueFilter === "this_week") return isThisWeek(dueDate);
      return true;
    });
  }, [dueFilter, priorityFilter, query, tasks]);

  const filteredGroupedTasks = useMemo(
    () => ({
      backlog: filteredTasks.filter((task) => task.status === "backlog"),
      todo: filteredTasks.filter((task) => task.status === "todo"),
      in_progress: filteredTasks.filter((task) => task.status === "in_progress"),
      done: filteredTasks.filter((task) => task.status === "done"),
    }),
    [filteredTasks],
  );

  const calendarGroups = useMemo(() => {
    const grouped = new Map<string, Task[]>();
    for (const task of filteredTasks) {
      if (!task.due_date) continue;
      const key = task.due_date.slice(0, 10);
      const bucket = grouped.get(key) ?? [];
      bucket.push(task);
      grouped.set(key, bucket);
    }
    return Array.from(grouped.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => ({
        key,
        label: new Date(key).toLocaleDateString("es-ES", {
          weekday: "short",
          day: "numeric",
          month: "long",
        }),
        tasks: value.sort((left, right) => {
          const leftPriority = left.priority === "high" ? 3 : left.priority === "medium" ? 2 : 1;
          const rightPriority = right.priority === "high" ? 3 : right.priority === "medium" ? 2 : 1;
          return rightPriority - leftPriority;
        }),
      }));
  }, [filteredTasks]);

  const noDueTasks = useMemo(() => filteredTasks.filter((task) => !task.due_date), [filteredTasks]);

  const notifications = useMemo(() => {
    const now = new Date();
    const alerts: AppNotification[] = [];
    const overdueTasks = tasks.filter((task) => {
      if (!task.due_date || task.status === "done") return false;
      return new Date(task.due_date) < now;
    });
    const soonTasks = tasks.filter((task) => {
      if (!task.due_date || task.status === "done") return false;
      const due = new Date(task.due_date);
      return due >= now && due.getTime() - now.getTime() <= 24 * 60 * 60 * 1000;
    });
    const doneTasks = tasks.filter((task) => task.status === "done");

    overdueTasks.slice(0, 6).forEach((task) => {
      alerts.push({ id: `overdue-${task.id}`, kind: "warning", message: `Tarea vencida: ${task.title}` });
    });
    soonTasks.slice(0, 6).forEach((task) => {
      alerts.push({ id: `soon-${task.id}`, kind: "warning", message: `Vence pronto: ${task.title}` });
    });
    doneTasks.slice(0, 4).forEach((task) => {
      alerts.push({ id: `done-${task.id}`, kind: "success", message: `Completada: ${task.title}` });
    });
    if (alerts.length === 0) {
      alerts.push({ id: "sync-info", kind: "info", message: "Todo en orden. No hay alertas pendientes." });
    }
    return alerts;
  }, [tasks]);

  const unreadNotifications = showNotifications ? 0 : notifications.length;
  const activeGroupedTasks = query || priorityFilter !== "all" || dueFilter !== "all" ? filteredGroupedTasks : groupedTasks;

  if (!selectedBoardId) {
    return (
      <Card className="flex h-[600px] flex-col items-center justify-center border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white border border-zinc-200 shadow-xl shadow-zinc-200/50 text-zinc-300">
          <Columns3 className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold text-zinc-950">No hay tableros seleccionados</h2>
        <p className="mt-2 max-w-xs text-sm text-zinc-500">
          Crea un nuevo tablero en la barra lateral o selecciona uno existente para empezar a organizar tus tareas.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <KanbanBoardHeader
        userEmail={userEmail}
        boardName={selectedBoard?.name ?? null}
        viewMode={viewMode}
        onSetViewMode={setViewMode}
        showNotifications={showNotifications}
        onToggleNotifications={() => setShowNotifications((prev) => !prev)}
        unreadNotifications={unreadNotifications}
        query={query}
        onSetQuery={setQuery}
        priorityFilter={priorityFilter}
        onSetPriorityFilter={setPriorityFilter}
        dueFilter={dueFilter}
        onSetDueFilter={setDueFilter}
        notifications={notifications}
      />

      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 gap-6 pb-6 md:grid-cols-2 xl:grid-cols-4">
          {STATUS_OPTIONS.map((status) => (
            <TaskColumn
              key={status}
              status={status}
              tasks={activeGroupedTasks[status]}
              onOpenEditor={onOpenEditor}
              onDeleteTask={onDeleteTask}
              onUpdateStatus={onUpdateTaskStatus}
              onToggleChecklistItem={onToggleChecklistItem}
              onCreateTask={onCreateTask}
              onAiGenerate={onAiGenerate}
            />
          ))}
        </div>
      ) : (
        <KanbanCalendarView
          calendarGroups={calendarGroups}
          noDueTasks={noDueTasks}
          onUpdateTaskStatus={onUpdateTaskStatus}
          onOpenEditor={onOpenEditor}
          onDeleteTask={onDeleteTask}
        />
      )}

      {isLoadingTasks && (
        <div className="fixed bottom-6 right-6 z-50">
          <Badge variant="zinc" className="flex items-center gap-2 bg-white/80 py-2 px-4 shadow-xl shadow-zinc-200/50 backdrop-blur-md">
            <div className="h-2 w-2 animate-pulse rounded-full bg-zinc-950" />
            Cargando cambios...
          </Badge>
        </div>
      )}

      <TaskEditorModal
        isOpen={Boolean(editingTaskId)}
        editingTitle={editingTitle}
        setEditingTitle={setEditingTitle}
        editingDescription={editingDescription}
        setEditingDescription={setEditingDescription}
        editingStatus={editingStatus}
        setEditingStatus={setEditingStatus}
        editingPriority={editingPriority}
        setEditingPriority={setEditingPriority}
        editingDueDate={editingDueDate}
        setEditingDueDate={setEditingDueDate}
        editingChecklist={editingChecklist}
        isGeneratingEditingDescription={isGeneratingEditingDescription}
        onClose={onCloseEditor}
        onSaveEditor={onSaveEditor}
        onGenerateEditingDescription={onGenerateEditingDescription}
        onAddEditingChecklistItem={onAddEditingChecklistItem}
        onToggleEditingChecklistItem={onToggleEditingChecklistItem}
        onRemoveEditingChecklistItem={onRemoveEditingChecklistItem}
      />
    </div>
  );
}
