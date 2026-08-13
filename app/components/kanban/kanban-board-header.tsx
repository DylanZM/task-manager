"use client";

import { Bell, Calendar, Search } from "lucide-react";
import { TaskPriority } from "@/lib/task-types";
import { Button } from "@/app/components/ui/button";
import { Input, Select } from "@/app/components/ui/form";
import { Badge, Card } from "@/app/components/ui/card-badge";
import { AppNotification, DueFilter, ViewMode } from "./kanban-board-constants";

type Props = {
  userEmail: string;
  boardName: string | null;
  viewMode: ViewMode;
  onSetViewMode: (mode: ViewMode) => void;
  showNotifications: boolean;
  onToggleNotifications: () => void;
  unreadNotifications: number;
  query: string;
  onSetQuery: (value: string) => void;
  priorityFilter: "all" | TaskPriority;
  onSetPriorityFilter: (value: "all" | TaskPriority) => void;
  dueFilter: DueFilter;
  onSetDueFilter: (value: DueFilter) => void;
  notifications: AppNotification[];
};

export function KanbanBoardHeader({
  userEmail,
  boardName,
  viewMode,
  onSetViewMode,
  showNotifications,
  onToggleNotifications,
  unreadNotifications,
  query,
  onSetQuery,
  priorityFilter,
  onSetPriorityFilter,
  dueFilter,
  onSetDueFilter,
  notifications,
}: Props) {
  return (
    <header className="relative flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-zinc-100">{boardName}</h2>
            <Badge variant="blue" size="md" className="font-black bg-blue-100/50 text-blue-700">
              Personal
            </Badge>
          </div>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">{userEmail}&apos;s workspace</p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Button
            type="button"
            variant={viewMode === "kanban" ? "primary" : "outline"}
            size="sm"
            onClick={() => onSetViewMode("kanban")}
          >
            Kanban
          </Button>
          <Button
            type="button"
            variant={viewMode === "calendar" ? "primary" : "outline"}
            size="sm"
            onClick={() => onSetViewMode("calendar")}
            leftIcon={Calendar}
          >
            Calendar
          </Button>
          <Button
            type="button"
            variant={showNotifications ? "secondary" : "outline"}
            size="icon"
            onClick={onToggleNotifications}
            className="relative"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadNotifications > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadNotifications > 9 ? "9+" : unreadNotifications}
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
          <Input
            value={query}
            onChange={(event) => onSetQuery(event.target.value)}
            placeholder="Search by title, description or subtask..."
            className="pl-9"
          />
        </div>
        <Select
          value={priorityFilter}
          onChange={(event) => onSetPriorityFilter(event.target.value as "all" | TaskPriority)}
          options={[
            { label: "Priority: All", value: "all" },
            { label: "High", value: "high" },
            { label: "Medium", value: "medium" },
            { label: "Low", value: "low" },
          ]}
        />
        <Select
          value={dueFilter}
          onChange={(event) => onSetDueFilter(event.target.value as DueFilter)}
          options={[
            { label: "Date: All", value: "all" },
            { label: "Overdue", value: "overdue" },
            { label: "Today", value: "today" },
            { label: "This week", value: "this_week" },
            { label: "No date", value: "no_due" },
          ]}
        />
      </div>

      {showNotifications && (
        <Card className="absolute right-0 top-full z-20 mt-2 w-full max-w-md p-3 shadow-2xl shadow-zinc-950/10 md:w-[430px]">
          <div className="mb-3 border-b border-zinc-100 pb-2 dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Notifications</h3>
          </div>
          <div className="max-h-[280px] space-y-2 overflow-y-auto pr-1 custom-scrollbar">
            {notifications.length === 0 ? (
              <p className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
                No active notifications.
              </p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-xl border p-2.5 text-xs ${
                    notification.kind === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : notification.kind === "warning"
                        ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400"
                        : "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400"
                  }`}
                >
                  <p className="font-medium">{notification.message}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </header>
  );
}
