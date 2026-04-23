"use client";

import { Calendar, Search } from "lucide-react";
import { TaskPriority } from "@/lib/task-types";
import { Button } from "@/app/components/ui/button";
import { Input, Select } from "@/app/components/ui/form";
import { Badge } from "@/app/components/ui/card-badge";
import { DueFilter, ViewMode } from "./kanban-board-constants";

type Props = {
  userEmail: string;
  boardName: string | null;
  viewMode: ViewMode;
  onSetViewMode: (mode: ViewMode) => void;
  query: string;
  onSetQuery: (value: string) => void;
  priorityFilter: "all" | TaskPriority;
  onSetPriorityFilter: (value: "all" | TaskPriority) => void;
  dueFilter: DueFilter;
  onSetDueFilter: (value: DueFilter) => void;
};

export function KanbanBoardHeader({
  userEmail,
  boardName,
  viewMode,
  onSetViewMode,
  query,
  onSetQuery,
  priorityFilter,
  onSetPriorityFilter,
  dueFilter,
  onSetDueFilter,
}: Props) {
  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-black tracking-tight text-zinc-950">{boardName}</h2>
            <Badge variant="blue" size="md" className="font-black bg-blue-100/50 text-blue-700">
              Propio
            </Badge>
          </div>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-zinc-400">Escritorio de {userEmail}</p>
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
            Calendario
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
          <Input
            value={query}
            onChange={(event) => onSetQuery(event.target.value)}
            placeholder="Buscar por título, descripción o subtarea..."
            className="pl-9"
          />
        </div>
        <Select
          value={priorityFilter}
          onChange={(event) => onSetPriorityFilter(event.target.value as "all" | TaskPriority)}
          options={[
            { label: "Prioridad: Todas", value: "all" },
            { label: "Alta", value: "high" },
            { label: "Media", value: "medium" },
            { label: "Baja", value: "low" },
          ]}
        />
        <Select
          value={dueFilter}
          onChange={(event) => onSetDueFilter(event.target.value as DueFilter)}
          options={[
            { label: "Fecha: Todas", value: "all" },
            { label: "Vencidas", value: "overdue" },
            { label: "Hoy", value: "today" },
            { label: "Esta semana", value: "this_week" },
            { label: "Sin fecha", value: "no_due" },
          ]}
        />
      </div>
    </header>
  );
}
