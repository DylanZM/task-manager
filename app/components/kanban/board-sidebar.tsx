"use client";

import { Folder, LayoutDashboard, LogOut, Plus, Trash2 } from "lucide-react";
import { Board } from "@/lib/task-types";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/form";
import { Card, Badge } from "@/app/components/ui/card-badge";

type Props = {
  boards: Board[];
  selectedBoardId: string | null;
  newBoardName: string;
  setNewBoardName: (value: string) => void;
  isCreatingBoard: boolean;
  taskError: string;
  onCreateBoard: (event: React.FormEvent<HTMLFormElement>) => void;
  onSwitchBoard: (boardId: string) => void;
  onDeleteBoard: (boardId: string) => void;
  onSignOut: () => void;
};

export function BoardSidebar({
  boards,
  selectedBoardId,
  newBoardName,
  setNewBoardName,
  isCreatingBoard,
  taskError,
  onCreateBoard,
  onSwitchBoard,
  onDeleteBoard,
  onSignOut,
}: Props) {
  return (
    <Card className="flex flex-col h-fit border-zinc-200/60 shadow-lg shadow-zinc-200/40 p-5 overflow-hidden">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-lg shadow-zinc-200">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Workspace</p>
            <h1 className="text-sm font-bold text-zinc-950">Mis Proyectos</h1>
          </div>
        </div>
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={onSignOut} 
          className="h-9 w-9 bg-zinc-50 border border-zinc-100 text-zinc-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100"
          title="Cerrar sesión"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      <div className="mb-6">
        <form className="flex flex-col gap-2" onSubmit={onCreateBoard}>
          <div className="relative group">
            <Input
              value={newBoardName}
              onChange={(event) => setNewBoardName(event.target.value)}
              placeholder="Nombre del proyecto..."
              className="pr-12 h-10 bg-zinc-50/50 border-zinc-200/50 focus:bg-white"
            />
            <Button
              type="submit"
              variant="primary"
              size="icon"
              className={`absolute right-1 top-1 h-8 w-8 transition-all ${newBoardName.trim() ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
              disabled={isCreatingBoard || !newBoardName.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>

      <nav className="space-y-1">
        <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Tableros Activos</p>
        <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
          {boards.length > 0 ? (
            boards.map((board) => {
              const selected = board.id === selectedBoardId;
              return (
                <div key={board.id} className="group relative flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onSwitchBoard(board.id)}
                    className={`flex flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
                      selected
                        ? "bg-zinc-950 text-white shadow-md shadow-zinc-200 translate-x-1"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                    }`}
                  >
                    <Folder className={`h-4 w-4 transition-colors ${selected ? 'text-zinc-400' : 'text-zinc-400 group-hover:text-zinc-600'}`} />
                    <span className="truncate">{board.name}</span>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteBoard(board.id)}
                    className={`h-9 w-9 flex-shrink-0 transition-all duration-200 ${
                      selected 
                        ? "text-zinc-400 hover:text-white hover:bg-white/10" 
                        : "opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-600 hover:bg-red-50"
                    }`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 p-6 text-center">
              <Folder className="mb-2 h-6 w-6 text-zinc-300" />
              <p className="text-xs text-zinc-500">No hay tableros aún.</p>
            </div>
          )}
        </div>
      </nav>

      {taskError && (
        <div className="mt-6">
          <Badge variant="red" className="w-full justify-center py-2 text-center text-[10px] normal-case">
            {taskError}
          </Badge>
        </div>
      )}
    </Card>
  );
}
