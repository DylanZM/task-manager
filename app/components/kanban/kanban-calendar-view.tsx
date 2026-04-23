"use client";

import { Calendar, Pencil, Trash2 } from "lucide-react";
import { Task, TaskStatus } from "@/lib/task-types";
import { Button } from "@/app/components/ui/button";
import { Card, Badge } from "@/app/components/ui/card-badge";
import { PRIORITY_LABELS, STATUS_LABELS, STATUS_OPTIONS } from "./kanban-board-constants";

type CalendarGroup = {
  key: string;
  label: string;
  tasks: Task[];
};

type Props = {
  calendarGroups: CalendarGroup[];
  noDueTasks: Task[];
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onOpenEditor: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
};

export function KanbanCalendarView({
  calendarGroups,
  noDueTasks,
  onUpdateTaskStatus,
  onOpenEditor,
  onDeleteTask,
}: Props) {
  return (
    <div className="space-y-4 pb-6">
      {calendarGroups.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-sm text-zinc-500">No hay tareas con fecha para mostrar en calendario.</p>
        </Card>
      ) : (
        calendarGroups.map((group) => (
          <Card key={group.key} className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-zinc-500" />
              <h3 className="text-sm font-bold capitalize text-zinc-950">{group.label}</h3>
              <Badge variant="zinc">{group.tasks.length}</Badge>
            </div>
            <div className="space-y-2">
              {group.tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col gap-3 rounded-xl border border-zinc-100 bg-zinc-50/60 p-3 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-zinc-950">{task.title}</p>
                    <p className="text-xs text-zinc-500">
                      {STATUS_LABELS[task.status]} · Prioridad {PRIORITY_LABELS[task.priority]}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={task.status}
                      onChange={(event) => onUpdateTaskStatus(task.id, event.target.value as TaskStatus)}
                      className="h-8 rounded-lg border border-zinc-200 bg-white px-2 text-xs font-semibold text-zinc-700 outline-none"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                    <Button type="button" variant="ghost" size="icon" onClick={() => onOpenEditor(task)} className="h-8 w-8">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteTask(task.id)}
                      className="h-8 w-8 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))
      )}

      {noDueTasks.length > 0 && (
        <Card className="p-4">
          <h3 className="mb-3 text-sm font-bold text-zinc-900">Sin fecha asignada</h3>
          <div className="space-y-2">
            {noDueTasks.map((task) => (
              <div key={task.id} className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
                {task.title}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
