"use client";

import { FormEvent, useState } from "react";
import { Pencil, Plus, Sparkles, X } from "lucide-react";
import { TaskChecklistItem, TaskPriority, TaskStatus } from "@/lib/task-types";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card-badge";
import { Input, Select, Textarea } from "@/app/components/ui/form";

type Props = {
  isOpen: boolean;
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
  isGeneratingEditingDescription: boolean;
  onClose: () => void;
  onSaveEditor: (event: FormEvent<HTMLFormElement>) => void;
  onGenerateEditingDescription: () => void;
  onAddEditingChecklistItem: (text: string) => void;
  onToggleEditingChecklistItem: (itemId: string) => void;
  onRemoveEditingChecklistItem: (itemId: string) => void;
};

export function TaskEditorModal({
  isOpen,
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
  isGeneratingEditingDescription,
  onClose,
  onSaveEditor,
  onGenerateEditingDescription,
  onAddEditingChecklistItem,
  onToggleEditingChecklistItem,
  onRemoveEditingChecklistItem,
}: Props) {
  const [newChecklistText, setNewChecklistText] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/20 p-6 backdrop-blur-sm">
      <Card className="w-full max-w-lg overflow-hidden border-white/40 p-0 shadow-2xl shadow-zinc-950/20">
        <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 p-4 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 text-white">
              <Pencil className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-950">Editar Tarea</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-zinc-400 hover:text-zinc-950">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={onSaveEditor} className="space-y-6 p-6">
          <Input
            label="Título"
            required
            value={editingTitle}
            onChange={(event) => setEditingTitle(event.target.value)}
            className="border-zinc-200 font-bold"
          />

          <div className="group relative">
            <Textarea
              label="Descripción"
              value={editingDescription}
              onChange={(event) => setEditingDescription(event.target.value)}
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

          <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-3">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500">Checklist / Subtareas</p>
            <div className="space-y-2">
              {editingChecklist.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleEditingChecklistItem(item.id)}
                    className={`flex h-5 w-5 items-center justify-center rounded border text-[10px] ${
                      item.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-zinc-300 bg-white text-zinc-500"
                    }`}
                  >
                    {item.done ? "✓" : ""}
                  </button>
                  <span className={`flex-1 text-sm ${item.done ? "text-zinc-400 line-through" : "text-zinc-700"}`}>
                    {item.text}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveEditingChecklistItem(item.id)}
                    className="h-7 w-7 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Input
                placeholder="Nueva subtarea..."
                value={newChecklistText}
                onChange={(event) => setNewChecklistText(event.target.value)}
                className="h-9 text-sm"
              />
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onAddEditingChecklistItem(newChecklistText);
                  setNewChecklistText("");
                }}
                leftIcon={Plus}
              >
                Añadir
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Estado"
              value={editingStatus}
              onChange={(event) => setEditingStatus(event.target.value as TaskStatus)}
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
              onChange={(event) => setEditingPriority(event.target.value as TaskPriority)}
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
            onChange={(event) => setEditingDueDate(event.target.value)}
          />

          <div className="flex gap-3 border-t border-zinc-100 pt-4">
            <Button type="submit" className="flex-1 shadow-lg shadow-zinc-200/50">
              Guardar Cambios
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
