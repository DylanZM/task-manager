"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { getInsforgeClient } from "@/lib/insforge/client";
import { AuthConfig, Board, Task, TaskChecklistItem, TaskPriority, TaskStatus } from "@/lib/task-types";
import { DEFAULT_AUTH_CONFIG, toDateInputValue, toSafeBoards, toSafeTasks, toSafeUser } from "@/app/hooks/kanban/normalizers";
import { AuthUser, QuickTaskInput } from "@/app/hooks/kanban/types";
import {
  buildFallbackDescription,
  buildTaskDescriptionMessages,
  extractCompletionText,
  isUsableDescription,
  resolveTaskDescriptionModel,
} from "@/lib/insforge/ai-task-description";
import { useBoardRealtimeSync } from "@/app/hooks/kanban/use-board-realtime-sync";

export function useKanbanLogic() {
  const [insforgeInit] = useState(() => {
    try {
      return { client: getInsforgeClient(), error: "" };
    } catch (error) {
      return {
        client: null,
        error: error instanceof Error ? error.message : "Invalid InsForge configuration.",
      };
    }
  });
  const insforge = insforgeInit.client;

  const [authConfig, setAuthConfig] = useState<AuthConfig>(DEFAULT_AUTH_CONFIG);
  const [isLoadingAuth, setIsLoadingAuth] = useState(Boolean(insforge));
  const [authMessage, setAuthMessage] = useState("");
  const [authError, setAuthError] = useState(insforgeInit.error);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [oauthLoadingProvider, setOAuthLoadingProvider] = useState<"github" | "google" | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState("");
  const [verificationMethod, setVerificationMethod] = useState<"code" | "link">("code");

  const [user, setUser] = useState<AuthUser | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [newBoardName, setNewBoardName] = useState("");
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [taskError, setTaskError] = useState("");
  const [aiModelId, setAiModelId] = useState<string | null>(
    process.env.NEXT_PUBLIC_INSFORGE_AI_MODEL?.trim() || null,
  );
  const [isGeneratingNewDescription, setIsGeneratingNewDescription] = useState(false);
  const [isGeneratingEditingDescription, setIsGeneratingEditingDescription] = useState(false);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>("todo");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("medium");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingStatus, setEditingStatus] = useState<TaskStatus>("todo");
  const [editingPriority, setEditingPriority] = useState<TaskPriority>("medium");
  const [editingDueDate, setEditingDueDate] = useState("");
  const [editingChecklist, setEditingChecklist] = useState<TaskChecklistItem[]>([]);

  const selectedBoard = useMemo(
    () => boards.find((board) => board.id === selectedBoardId) ?? null,
    [boards, selectedBoardId],
  );

  const groupedTasks = useMemo(
    () => ({
      backlog: tasks.filter((task) => task.status === "backlog"),
      todo: tasks.filter((task) => task.status === "todo"),
      in_progress: tasks.filter((task) => task.status === "in_progress"),
      done: tasks.filter((task) => task.status === "done"),
    }),
    [tasks],
  );

  const fetchAuthConfig = useCallback(async () => {
    const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
    if (!baseUrl || baseUrl.includes("your-project.insforge.app")) return;
    try {
      const response = await fetch(`${baseUrl}/api/auth/public-config`, { cache: "no-store" });
      if (!response.ok) return;
      const config = (await response.json()) as Partial<AuthConfig>;
      setAuthConfig({
        requireEmailVerification: Boolean(config.requireEmailVerification),
        passwordMinLength:
          typeof config.passwordMinLength === "number"
            ? config.passwordMinLength
            : DEFAULT_AUTH_CONFIG.passwordMinLength,
        verifyEmailMethod: config.verifyEmailMethod === "link" ? "link" : "code",
        resetPasswordMethod: config.resetPasswordMethod === "code" ? "code" : "link",
        oAuthProviders: Array.isArray(config.oAuthProviders)
          ? config.oAuthProviders.filter((provider): provider is string => typeof provider === "string")
          : DEFAULT_AUTH_CONFIG.oAuthProviders,
      });
    } catch {
      // Keep local defaults when auth metadata endpoint is unreachable.
    }
  }, []);

  const loadCurrentUser = useCallback(async (client: ReturnType<typeof getInsforgeClient>) => {
    const { data, error } = await client.auth.getCurrentUser();
    if (error) {
      setUser(null);
      return null;
    }
    const currentUser = toSafeUser(data?.user);
    setUser(currentUser);
    return currentUser;
  }, []);

  const loadBoards = useCallback(async (client: ReturnType<typeof getInsforgeClient>, userId: string) => {
    const { data, error } = await client.database
      .from("boards")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (error) {
      setTaskError(error.message);
      return [] as Board[];
    }
    return toSafeBoards(data);
  }, []);

  const loadTasks = useCallback(
    async (client: ReturnType<typeof getInsforgeClient>, userId: string, boardId: string) => {
      setIsLoadingTasks(true);
      const { data, error } = await client.database
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .eq("board_id", boardId)
        .order("position", { ascending: true })
        .order("created_at", { ascending: true });
      setIsLoadingTasks(false);
      if (error) {
        setTaskError(error.message);
        return;
      }
      setTasks(toSafeTasks(data));
    },
    [],
  );

  const ensureProfile = useCallback(async (client: ReturnType<typeof getInsforgeClient>, currentUser: AuthUser) => {
    const { data, error } = await client.database
      .from("profiles")
      .select("user_id")
      .eq("user_id", currentUser.id)
      .limit(1);
    if (error) {
      setTaskError(error.message);
      return;
    }
    if (Array.isArray(data) && data.length > 0) return;
    const { error: insertError } = await client.database.from("profiles").insert([
      { user_id: currentUser.id, display_name: currentUser.name ?? null, avatar_url: null },
    ]);
    if (insertError) setTaskError(insertError.message);
  }, []);

  const resolveAiModel = useCallback(
    async (_client: ReturnType<typeof getInsforgeClient>) => {
      void _client;
      const resolvedModel = resolveTaskDescriptionModel(
        aiModelId,
        process.env.NEXT_PUBLIC_INSFORGE_AI_MODEL?.trim(),
      );
      setAiModelId(resolvedModel);
      return resolvedModel;
    },
    [aiModelId],
  );

  const loadBoardsAndTasks = useCallback(
    async (client: ReturnType<typeof getInsforgeClient>, currentUser: AuthUser) => {
      const existingBoards = await loadBoards(client, currentUser.id);
      setBoards(existingBoards);
      const boardId = existingBoards[0]?.id ?? null;
      setSelectedBoardId(boardId);
      if (boardId) {
        await loadTasks(client, currentUser.id, boardId);
      } else {
        setTasks([]);
      }
    },
    [loadBoards, loadTasks],
  );

  useEffect(() => {
    if (!insforge) return;
    void (async () => {
      await fetchAuthConfig();
      const currentUser = await loadCurrentUser(insforge);
      if (currentUser) {
        await ensureProfile(insforge, currentUser);
        await loadBoardsAndTasks(insforge, currentUser);
      }
      setIsLoadingAuth(false);
    })();
  }, [ensureProfile, fetchAuthConfig, insforge, loadBoardsAndTasks, loadCurrentUser]);

  useBoardRealtimeSync({ insforge, user, selectedBoardId, loadTasks, setTaskError });

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!insforge) return;
    setAuthError("");
    setAuthMessage("");
    setIsSubmittingAuth(true);
    const { data, error } = await insforge.auth.signUp({
      email,
      password,
      name: displayName || undefined,
      redirectTo: `${window.location.origin}/`,
    });
    setIsSubmittingAuth(false);
    if (error) {
      setAuthError(error.message);
      return;
    }
    if (data?.requireEmailVerification) {
      const method = authConfig.verifyEmailMethod;
      setVerificationMethod(method);
      setPendingVerificationEmail(email);
      setAuthMessage(method === "link" ? "Revisa tu correo y luego inicia sesión." : "Ingresa el código de verificación.");
      return;
    }
    const signedUpUser = toSafeUser(data?.user);
    setUser(signedUpUser);
    if (signedUpUser) {
      await ensureProfile(insforge, signedUpUser);
      await loadBoardsAndTasks(insforge, signedUpUser);
    }
  }

  async function handleVerifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!insforge || !pendingVerificationEmail) return;
    setAuthError("");
    setIsSubmittingAuth(true);
    const { data, error } = await insforge.auth.verifyEmail({
      email: pendingVerificationEmail,
      otp: verificationCode,
    });
    setIsSubmittingAuth(false);
    if (error) {
      setAuthError(error.message);
      return;
    }
    const verifiedUser = toSafeUser(data?.user);
    setUser(verifiedUser);
    if (verifiedUser) {
      await ensureProfile(insforge, verifiedUser);
      await loadBoardsAndTasks(insforge, verifiedUser);
    }
    setVerificationCode("");
    setPendingVerificationEmail("");
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!insforge) return;
    setAuthError("");
    setAuthMessage("");
    setIsSubmittingAuth(true);
    const { data, error } = await insforge.auth.signInWithPassword({ email, password });
    setIsSubmittingAuth(false);
    if (error) {
      setAuthError(error.message);
      return;
    }
    const signedInUser = toSafeUser(data?.user);
    setUser(signedInUser);
    if (signedInUser) {
      await ensureProfile(insforge, signedInUser);
      await loadBoardsAndTasks(insforge, signedInUser);
    }
  }

  async function handleOAuthSignIn(provider: "github" | "google") {
    if (!insforge) return;
    setAuthError("");
    setAuthMessage("");
    setOAuthLoadingProvider(provider);
    const { error } = await insforge.auth.signInWithOAuth({
      provider,
      redirectTo: `${window.location.origin}/`,
    });
    if (error) {
      setAuthError(error.message);
      setOAuthLoadingProvider(null);
    }
  }

  async function handleSignOut() {
    if (!insforge) return;
    const { error } = await insforge.auth.signOut();
    if (error) {
      setTaskError(error.message);
      return;
    }
    setUser(null);
    setBoards([]);
    setSelectedBoardId(null);
    setTasks([]);
    setEditingTaskId(null);
  }

  async function handleCreateBoard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!insforge || !user) return;
    const boardName = newBoardName.trim();
    if (!boardName) return;
    setIsCreatingBoard(true);
    const { data, error } = await insforge.database
      .from("boards")
      .insert([{ user_id: user.id, name: boardName }])
      .select();
    setIsCreatingBoard(false);
    if (error) {
      setTaskError(error.message);
      return;
    }
    const created = toSafeBoards(data)[0];
    if (!created) return;
    setBoards((prev) => [...prev, created]);
    setSelectedBoardId(created.id);
    setTasks([]);
    setNewBoardName("");
  }

  async function switchBoard(boardId: string) {
    if (!insforge || !user) return;
    setSelectedBoardId(boardId);
    await loadTasks(insforge, user.id, boardId);
  }

  async function handleDeleteBoard(boardId: string) {
    if (!insforge || !user) return;
    const { error } = await insforge.database
      .from("boards")
      .delete()
      .eq("id", boardId)
      .eq("user_id", user.id);
    if (error) {
      setTaskError(error.message);
      return;
    }
    const nextBoards = boards.filter((board) => board.id !== boardId);
    setBoards(nextBoards);
    if (selectedBoardId === boardId) {
      const nextBoardId = nextBoards[0]?.id ?? null;
      setSelectedBoardId(nextBoardId);
      if (nextBoardId) {
        await loadTasks(insforge, user.id, nextBoardId);
      } else {
        setTasks([]);
      }
    }
  }

  async function handleCreateTask(event: FormEvent<HTMLFormElement> | TaskStatus | QuickTaskInput) {
    if (!insforge || !user || !selectedBoardId) return;
    
    // Check if it's a form event or direct call
    const isFormEvent = typeof event === "object" && event !== null && 'preventDefault' in event;
    const isStatusString = typeof event === "string";
    const isDataObj = typeof event === "object" && event !== null && "title" in event;
    const dataEvent = isDataObj ? (event as QuickTaskInput) : null;

    if (isFormEvent) {
      event.preventDefault();
    }

    const finalStatus: TaskStatus = isStatusString 
      ? (event as TaskStatus)
      : isDataObj
      ? (dataEvent?.status || "todo")
      : newTaskStatus;

    const finalTitle = isDataObj ? dataEvent?.title ?? "" : newTaskTitle;
    const finalDescription = isDataObj ? dataEvent?.description : newTaskDescription;
    const finalPriority = isDataObj ? dataEvent?.priority : newTaskPriority;
    const finalDueDate = isFormEvent ? newTaskDueDate : null;

    const title = finalTitle.trim();
    if (!title) return;

    const nextPosition =
      tasks.filter((task) => task.status === finalStatus).reduce((max, task) => Math.max(max, task.position), 0) + 1;

    const payload = {
      user_id: user.id,
      board_id: selectedBoardId,
      title,
      description: finalDescription?.trim() || null,
      status: finalStatus,
      priority: finalPriority || "medium",
      due_date: finalDueDate ? new Date(finalDueDate).toISOString() : null,
      checklist: [],
      position: nextPosition,
    };

    const { data, error } = await insforge.database.from("tasks").insert([payload]).select();
    if (error) {
      setTaskError(error.message);
      return;
    }

    setTasks((prev) => [...prev, ...toSafeTasks(data)]);
    
    if (!isDataObj && !isStatusString) {
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskStatus("todo");
      setNewTaskPriority("medium");
      setNewTaskDueDate("");
    }
  }

  async function handleAiGenerate(title: string): Promise<string | null> {
    if (!insforge || !title.trim()) return null;
    const model = await resolveAiModel(insforge);
    if (!model) return null;

    const requestDescription = async (strictPrompt: boolean) => {
      const response = await insforge.ai.chat.completions.create({
        model,
        messages: buildTaskDescriptionMessages(title, strictPrompt),
        temperature: 0.3,
        maxTokens: 260,
      });

      const responseError =
        "error" in (response as object) ? (response as { error?: { message?: string } }).error : undefined;
      if (responseError) {
        const message = responseError.message ?? "Error en la IA.";
        setTaskError(
          message.toLowerCase().includes("model")
            ? "No se pudo usar GPT-5 mini. Verifica en InsForge Dashboard que el modelo esté activo y que NEXT_PUBLIC_INSFORGE_AI_MODEL apunte a ese model_id."
            : message,
        );
        return null;
      }

      return extractCompletionText(response);
    };

    try {
      const primary = (await requestDescription(false)) ?? "";
      if (isUsableDescription(primary)) return primary;

      const retry = (await requestDescription(true)) ?? "";
      if (isUsableDescription(retry)) return retry;

      return buildFallbackDescription(title);
    } catch (error) {
      setTaskError(error instanceof Error ? error.message : "Error al generar con IA.");
      return null;
    }
  }

  async function generateTaskDescription(mode: "new" | "edit") {
    const title = (mode === "new" ? newTaskTitle : editingTitle).trim();
    if (!title) {
      setTaskError("Escribe un título para generar la descripción con IA.");
      return;
    }

    if (mode === "new") setIsGeneratingNewDescription(true);
    else setIsGeneratingEditingDescription(true);
    
    setTaskError("");
    const description = await handleAiGenerate(title);
    
    if (description) {
      if (mode === "new") setNewTaskDescription(description);
      else setEditingDescription(description);
    }

    if (mode === "new") setIsGeneratingNewDescription(false);
    else setIsGeneratingEditingDescription(false);
  }

  async function updateTask(taskId: string, update: Partial<Task>) {
    if (!insforge || !user) return;
    const dbUpdate: Record<string, unknown> = {};
    if (typeof update.title === "string") dbUpdate.title = update.title.trim();
    if (update.description !== undefined) dbUpdate.description = update.description?.trim() || null;
    if (update.status) dbUpdate.status = update.status;
    if (update.priority) dbUpdate.priority = update.priority;
    if (update.position !== undefined) dbUpdate.position = update.position;
    if (update.due_date !== undefined) dbUpdate.due_date = update.due_date;
    if (update.checklist !== undefined) dbUpdate.checklist = update.checklist;
    const { data, error } = await insforge.database
      .from("tasks")
      .update(dbUpdate)
      .eq("id", taskId)
      .eq("user_id", user.id)
      .select();
    if (error) {
      setTaskError(error.message);
      return;
    }
    const updated = toSafeTasks(data)[0];
    if (!updated) return;
    setTasks((prev) => prev.map((task) => (task.id === taskId ? updated : task)));
  }

  async function handleDeleteTask(taskId: string) {
    if (!insforge || !user) return;
    const { error } = await insforge.database
      .from("tasks")
      .delete()
      .eq("id", taskId)
      .eq("user_id", user.id);
    if (error) {
      setTaskError(error.message);
      return;
    }
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }

  function openEditor(task: Task) {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
    setEditingDescription(task.description ?? "");
    setEditingStatus(task.status);
    setEditingPriority(task.priority);
    setEditingDueDate(toDateInputValue(task.due_date));
    setEditingChecklist(task.checklist ?? []);
  }

  async function saveEditor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingTaskId) return;
    await updateTask(editingTaskId, {
      title: editingTitle,
      description: editingDescription,
      status: editingStatus,
      priority: editingPriority,
      due_date: editingDueDate ? new Date(editingDueDate).toISOString() : null,
      checklist: editingChecklist,
    });
    setEditingTaskId(null);
  }

  function createChecklistItem(text: string): TaskChecklistItem {
    const fallbackId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return {
      id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : fallbackId,
      text: text.trim(),
      done: false,
    };
  }

  function addEditingChecklistItem(text: string) {
    const value = text.trim();
    if (!value) return;
    setEditingChecklist((prev) => [...prev, createChecklistItem(value)]);
  }

  function toggleEditingChecklistItem(itemId: string) {
    setEditingChecklist((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item)),
    );
  }

  function removeEditingChecklistItem(itemId: string) {
    setEditingChecklist((prev) => prev.filter((item) => item.id !== itemId));
  }

  async function toggleChecklistItem(taskId: string, itemId: string) {
    const task = tasks.find((candidate) => candidate.id === taskId);
    if (!task) return;
    const nextChecklist = task.checklist.map((item) =>
      item.id === itemId ? { ...item, done: !item.done } : item,
    );
    await updateTask(taskId, { checklist: nextChecklist });
  }

  return {
    // Auth State
    authConfig,
    isLoadingAuth,
    authMessage,
    authError,
    isSubmittingAuth,
    oauthLoadingProvider,
    email,
    setEmail,
    password,
    setPassword,
    displayName,
    setDisplayName,
    verificationCode,
    setVerificationCode,
    pendingVerificationEmail,
    verificationMethod,
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
    isGeneratingNewDescription,
    isGeneratingEditingDescription,

    // New Task State
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

    // Actions
    handleRegister,
    handleVerifyCode,
    handleLogin,
    handleOAuthSignIn,
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
  };
}
