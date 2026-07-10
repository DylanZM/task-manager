"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BoardSidebar } from "@/app/components/kanban/board-sidebar";
import { KanbanBoard } from "@/app/components/kanban/kanban-board";
import { useKanbanLogic } from "@/app/hooks/use-kanban-logic";

export default function Home() {
  const router = useRouter();
  const {
    isLoadingAuth,
    user,

    // Board State
    boards,
    selectedBoard,
    selectedBoardId,
    newBoardName,
    setNewBoardName,
    isCreatingBoard,

    // Task State
    tasks,
    groupedTasks,
    isLoadingTasks,
    taskError,
    isGeneratingEditingDescription,

    // Editing State
    editingTaskId,
    setEditingTaskId,
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

    handleSignOut,
    handleCreateBoard,
    switchBoard,
    handleDeleteBoard,
    handleCreateTask,
    generateTaskDescription,
    updateTask,
    handleDeleteTask,
    openEditor,
    saveEditor,
    handleAiGenerate,
    addEditingChecklistItem,
    toggleEditingChecklistItem,
    removeEditingChecklistItem,
    toggleChecklistItem,
  } = useKanbanLogic();

  useEffect(() => {
    if (!isLoadingAuth && !user) {
      router.replace("/login");
    }
  }, [isLoadingAuth, router, user]);

  if (isLoadingAuth || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-zinc-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-950" />
          <p className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium shadow-sm">
            Loading board...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-zinc-950 selection:bg-zinc-950 selection:text-white">
      <div className="mx-auto w-full max-w-[1440px] grid grid-cols-1 gap-8 p-6 lg:grid-cols-[280px_1fr] lg:p-10 lg:gap-12">
        <div className="min-w-0">
          <BoardSidebar
            boards={boards}
            selectedBoardId={selectedBoardId}
            newBoardName={newBoardName}
            setNewBoardName={setNewBoardName}
            isCreatingBoard={isCreatingBoard}
            taskError={taskError}
            onCreateBoard={handleCreateBoard}
            onSwitchBoard={(boardId) => void switchBoard(boardId)}
            onDeleteBoard={(boardId) => void handleDeleteBoard(boardId)}
            onSignOut={() => void handleSignOut()}
          />
        </div>

        <div className="min-w-0">
          <KanbanBoard
            userEmail={user.email}
            selectedBoard={selectedBoard}
            selectedBoardId={selectedBoardId}
            editingTaskId={editingTaskId}
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
            tasks={tasks}
            groupedTasks={groupedTasks}
            isLoadingTasks={isLoadingTasks}
            isGeneratingEditingDescription={isGeneratingEditingDescription}
            onCreateTask={handleCreateTask}
            onSaveEditor={saveEditor}
            onCloseEditor={() => setEditingTaskId(null)}
            onGenerateEditingDescription={() => void generateTaskDescription("edit")}
            onUpdateTaskStatus={(taskId, status) => void updateTask(taskId, { status })}
            onOpenEditor={openEditor}
            onDeleteTask={(taskId) => void handleDeleteTask(taskId)}
            onAiGenerate={handleAiGenerate}
            onAddEditingChecklistItem={addEditingChecklistItem}
            onToggleEditingChecklistItem={toggleEditingChecklistItem}
            onRemoveEditingChecklistItem={removeEditingChecklistItem}
            onToggleChecklistItem={(taskId, itemId) => void toggleChecklistItem(taskId, itemId)}
          />
        </div>
      </div>
    </main>
  );
}
