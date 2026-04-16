"use client";

import { Calendar, CheckCircle2, Columns3, Pencil, Plus, Sparkles, Trash2, X } from "lucide-react";
import { Board, Task, TaskPriority, TaskStatus } from "@/lib/task-types";
import { QuickTaskInput } from "@/app/hooks/kanban/types";
import { Button } from "@/app/components/ui/button";
import { Input, Textarea, Select } from "@/app/components/ui/form";
import { Card, Badge } from "@/app/components/ui/card-badge";
import { TaskColumn } from "./task-column";

const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: "Backlog",
  todo: "Por hacer",
  in_progress: "En progreso",
  done: "Completado",
};

type Props = {
  userEmail: string;
  selectedBoard: Board | null;
  selectedBoardId: string | null;
  newTaskTitle: string;
  setNewTaskTitle: (value: string) => void;
  newTaskDescription: string;
  setNewTaskDescription: (value: string) => void;
  newTaskStatus: TaskStatus;
  setNewTaskStatus: (value: TaskStatus) => void;
  newTaskPriority: TaskPriority;
  setNewTaskPriority: (value: TaskPriority) => void;
  newTaskDueDate: string;
  setNewTaskDueDate: (value: string) => void;
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
  groupedTasks: Record<TaskStatus, Task[]>;
  isLoadingTasks: boolean;
  isGeneratingNewDescription: boolean;
  isGeneratingEditingDescription: boolean;
  onCreateTask: (event: React.FormEvent<HTMLFormElement> | TaskStatus | QuickTaskInput) => void;
  onSaveEditor: (event: React.FormEvent<HTMLFormElement>) => void;
  onCloseEditor: () => void;
  onGenerateNewDescription: () => void;
  onGenerateEditingDescription: () => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onOpenEditor: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAiGenerate: (title: string) => Promise<string | null>;
};

export function KanbanBoard({
  userEmail,
  selectedBoard,
  selectedBoardId,
  newTaskTitle,
  setNewTaskTitle,
  newTaskDescription,
  setNewTaskDescription,
  newTaskStatus,
  setNewTaskStatus,
  newTaskPriority,
  setNewTaskPriority,
  newTaskDueDate,
  setNewTaskDueDate,
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
  groupedTasks,
  isLoadingTasks,
  isGeneratingNewDescription,
  isGeneratingEditingDescription,
  onCreateTask,
  onSaveEditor,
  onCloseEditor,
  onGenerateNewDescription,
  onGenerateEditingDescription,
  onUpdateTaskStatus,
  onOpenEditor,
  onDeleteTask,
  onAiGenerate,
}: Props) {
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
    <div className="flex flex-col gap-6 min-w-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-black text-zinc-950 tracking-tight">
              {selectedBoard?.name}
            </h2>
            <Badge variant="blue" size="md" className="font-black bg-blue-100/50 text-blue-700">Propio</Badge>
          </div>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-zinc-400">
            Escritorio de {userEmail}
          </p>
        </div>

      
      </header>


      {/* Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 pb-6">
        {(["backlog", "todo", "in_progress", "done"] as TaskStatus[]).map((status) => (
          <TaskColumn
            key={status}
            status={status}
            tasks={groupedTasks[status]}
            onOpenEditor={onOpenEditor}
            onDeleteTask={onDeleteTask}
            onUpdateStatus={onUpdateTaskStatus}
            onCreateTask={onCreateTask}
            onAiGenerate={onAiGenerate}
          />
        ))}
      </div>

      {isLoadingTasks && (
        <div className="fixed bottom-6 right-6 z-50">
          <Badge variant="zinc" className="flex items-center gap-2 py-2 px-4 shadow-xl shadow-zinc-200/50 bg-white/80 backdrop-blur-md">
            <div className="h-2 w-2 animate-pulse rounded-full bg-zinc-950" />
            Cargando cambios...
          </Badge>
        </div>
      )}

      {/* Editor Modal Overlay */}
      {editingTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/20 backdrop-blur-sm">
          <Card className="w-full max-w-lg p-0 overflow-hidden shadow-2xl shadow-zinc-950/20 border-white/40">
            <div className="flex items-center justify-between border-b border-zinc-100 p-4 px-6 bg-zinc-50/50">
               <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 text-white">
                    <Pencil className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-widest">Editar Tarea</h3>
               </div>
               <Button variant="ghost" size="icon" onClick={onCloseEditor} className="h-8 w-8 text-zinc-400 hover:text-zinc-950">
                  <X className="h-4 w-4" />
               </Button>
            </div>
            
            <form onSubmit={onSaveEditor} className="p-6 space-y-6">
              <Input
                label="Título"
                required
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                className="font-bold border-zinc-200"
              />
              
              <div className="relative group">
                <Textarea
                  label="Descripción"
                  value={editingDescription}
                  onChange={(e) => setEditingDescription(e.target.value)}
                  className="min-h-[140px] pb-12"
                />
                <Button
                  type="button"
                  variant="amber"
                  size="sm"
                  onClick={onGenerateEditingDescription}
                  disabled={isGeneratingEditingDescription || !editingTitle.trim()}
                  className="absolute right-2 bottom-2 h-9 px-3"
                  leftIcon={Sparkles}
                >
                  {isGeneratingEditingDescription ? "Actualizando..." : "Mejorar con IA"}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Estado"
                  value={editingStatus}
                  onChange={(e) => setEditingStatus(e.target.value as TaskStatus)}
                  options={[
                    { label: "Backlog", value: "backlog" },
                    { label: "Por hacer", value: "todo" },
                    { label: "En progreso", value: "in_progress" },
                    { label: "Completado", value: "done" },
                  ]}
                />
                <Select
                  label="Prioridad"
                  value={editingPriority}
                  onChange={(e) => setEditingPriority(e.target.value as TaskPriority)}
                  options={[
                    { label: "Baja", value: "low" },
                    { label: "Media", value: "medium" },
                    { label: "Alta", value: "high" },
                  ]}
                />
              </div>

              <Input
                label="Fecha de vencimiento"
                type="date"
                value={editingDueDate}
                onChange={(e) => setEditingDueDate(e.target.value)}
              />

              <div className="flex gap-3 pt-4 border-t border-zinc-100">
                <Button type="submit" className="flex-1 shadow-lg shadow-zinc-200/50">Guardar Cambios</Button>
                <Button type="button" variant="outline" onClick={onCloseEditor} className="flex-1">Cancelar</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
