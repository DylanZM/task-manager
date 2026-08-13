"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const [seenNotificationIds, setSeenNotificationIds] = useState<string[]>([]);
  const [emailErrorNotifications, setEmailErrorNotifications] = useState<AppNotification[]>([]);
  const sendingEmailKeysRef = useRef<Set<string>>(new Set());

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

  const dueSoonNotifications = useMemo(() => {
    const now = new Date();
    return tasks
      .filter((task) => {
        if (!task.due_date || task.status === "done") return false;
        const due = new Date(task.due_date);
        return due >= now && due.getTime() - now.getTime() <= 24 * 60 * 60 * 1000;
      })
      .slice(0, 6)
      .map<AppNotification>((task) => ({
        id: `soon-${task.id}-${task.due_date ?? "none"}`,
        kind: "warning",
        message: `Se vence pronto: ${task.title}`,
        taskId: task.id,
        dueDate: task.due_date,
      }));
  }, [tasks]);

  const overdueNotifications = useMemo(() => {
    const now = new Date();
    return tasks
      .filter((task) => {
        if (!task.due_date || task.status === "done") return false;
        return new Date(task.due_date) < now;
      })
      .slice(0, 6)
      .map<AppNotification>((task) => ({
        id: `overdue-${task.id}-${task.due_date ?? "none"}`,
        kind: "warning",
        message: `Tarea vencida: ${task.title}`,
        taskId: task.id,
        dueDate: task.due_date,
      }));
  }, [tasks]);

  const notifications = useMemo(
    () => [...overdueNotifications, ...dueSoonNotifications, ...emailErrorNotifications],
    [dueSoonNotifications, emailErrorNotifications, overdueNotifications],
  );

  const unreadNotifications = useMemo(() => {
    if (showNotifications) return 0;
    const seenSet = new Set(seenNotificationIds);
    return notifications.filter((notification) => !seenSet.has(notification.id)).length;
  }, [notifications, seenNotificationIds, showNotifications]);

  const toggleNotifications = () => {
    setShowNotifications((current) => {
      const next = !current;
      if (next) {
        setSeenNotificationIds((previous) =>
          Array.from(new Set([...previous, ...notifications.map((notification) => notification.id)])),
        );
      }
      return next;
    });
  };

  useEffect(() => {
    if (typeof window === "undefined" || dueSoonNotifications.length === 0) return;

    const storageKey = "due-email-notifications-sent";
    const parsedStoredKeys = (() => {
      try {
        const raw = window.localStorage.getItem(storageKey);
        const parsed = raw ? JSON.parse(raw) : [];
        return new Set(Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : []);
      } catch {
        return new Set<string>();
      }
    })();

    const sendEmailForDueTask = async (notification: AppNotification) => {
      if (!notification.taskId || !notification.dueDate) return;
      const emailKey = `${notification.taskId}:${notification.dueDate}`;
      if (parsedStoredKeys.has(emailKey) || sendingEmailKeysRef.current.has(emailKey)) return;

      sendingEmailKeysRef.current.add(emailKey);
      try {
        const response = await fetch("/api/notifications/due-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: userEmail,
            boardName: selectedBoard?.name ?? "Kanban Board",
            taskId: notification.taskId,
            taskTitle: notification.message.replace("Se vence pronto: ", ""),
            dueDate: notification.dueDate,
          }),
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => ({}))) as { error?: string };
          const errorMessage = data.error ?? "No se pudo enviar el correo de recordatorio.";
          setEmailErrorNotifications((previous) => {
            const id = `email-error-${emailKey}`;
            if (previous.some((notificationItem) => notificationItem.id === id)) return previous;
            return [
              ...previous,
              {
                id,
                kind: "warning",
                message: `${errorMessage} (${notification.message})`,
              },
            ];
          });
          return;
        }

        parsedStoredKeys.add(emailKey);
        window.localStorage.setItem(storageKey, JSON.stringify(Array.from(parsedStoredKeys)));
      } catch {
        setEmailErrorNotifications((previous) => {
          const id = `email-error-${emailKey}`;
          if (previous.some((notificationItem) => notificationItem.id === id)) return previous;
          return [
            ...previous,
            {
              id,
              kind: "warning",
              message: `Error de red al enviar recordatorio por email (${notification.message}).`,
            },
          ];
        });
      } finally {
        sendingEmailKeysRef.current.delete(emailKey);
      }
    };

    dueSoonNotifications.forEach((notification) => {
      void sendEmailForDueTask(notification);
    });
  }, [dueSoonNotifications, selectedBoard?.name, userEmail]);

  const activeGroupedTasks = query || priorityFilter !== "all" || dueFilter !== "all" ? filteredGroupedTasks : groupedTasks;

  if (!selectedBoardId) {
    return (
      <Card className="flex h-[600px] flex-col items-center justify-center border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white border border-zinc-200 shadow-xl shadow-zinc-200/50 text-zinc-300 dark:bg-zinc-900 dark:border-zinc-700 dark:shadow-none dark:text-zinc-600">
          <Columns3 className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold text-zinc-950 dark:text-zinc-100">No hay tableros seleccionados</h2>
        <p className="mt-2 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
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
        onToggleNotifications={toggleNotifications}
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
          <Badge variant="zinc" className="flex items-center gap-2 bg-white/80 py-2 px-4 shadow-xl shadow-zinc-200/50 backdrop-blur-md dark:bg-zinc-900/80 dark:shadow-none">
            <div className="h-2 w-2 animate-pulse rounded-full bg-zinc-950 dark:bg-zinc-100" />
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
