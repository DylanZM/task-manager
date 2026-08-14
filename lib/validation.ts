import { TaskChecklistItem, TaskPriority, TaskStatus } from "@/lib/task-types";

export const LIMITS = {
  emailMaxLength: 254,
  passwordMaxLength: 128,
  displayNameMaxLength: 80,
  boardNameMaxLength: 60,
  taskTitleMaxLength: 140,
  taskDescriptionMaxLength: 2000,
  checklistTextMaxLength: 200,
  checklistMaxItems: 50,
  aiTitleMaxLength: 200,
  avatarMaxBytes: 5 * 1024 * 1024,
} as const;

export const AVATAR_ALLOWED_MIME = ["image/png", "image/jpeg"] as const;
export const AVATAR_ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg"] as const;

export const TASK_STATUSES: TaskStatus[] = ["backlog", "todo", "in_progress", "done"];
export const TASK_PRIORITIES: TaskPriority[] = ["low", "medium", "high"];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const sanitizeText = (value: string) => value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");

export const isValidEmail = (value: string) => {
  const email = value.trim();
  return email.length > 0 && email.length <= LIMITS.emailMaxLength && EMAIL_REGEX.test(email);
};

export const isValidPassword = (value: string, minLength: number) =>
  value.length >= minLength && value.length <= LIMITS.passwordMaxLength;

export const isValidDisplayName = (value: string | null | undefined) =>
  value == null || value.trim().length <= LIMITS.displayNameMaxLength;

export const isValidBoardName = (value: string) => {
  const name = value.trim();
  return name.length > 0 && name.length <= LIMITS.boardNameMaxLength;
};

export const isValidTaskTitle = (value: string) => {
  const title = value.trim();
  return title.length > 0 && title.length <= LIMITS.taskTitleMaxLength;
};

export const isValidDescription = (value: string | null | undefined) =>
  value == null || sanitizeText(value).length <= LIMITS.taskDescriptionMaxLength;

export const isTaskStatusValue = (value: unknown): value is TaskStatus =>
  typeof value === "string" && (TASK_STATUSES as string[]).includes(value);

export const isTaskPriorityValue = (value: unknown): value is TaskPriority =>
  typeof value === "string" && (TASK_PRIORITIES as string[]).includes(value);

export const isValidDueDate = (value: string | null | undefined) => {
  if (value == null || value === "") return true;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
};

export const isValidChecklist = (value: TaskChecklistItem[] | null | undefined) => {
  if (!Array.isArray(value) || value.length === 0) return true;
  if (value.length > LIMITS.checklistMaxItems) return false;
  return value.every(
    (item) =>
      typeof item.id === "string" &&
      item.id.length > 0 &&
      typeof item.done === "boolean" &&
      typeof item.text === "string" &&
      sanitizeText(item.text).length > 0 &&
      sanitizeText(item.text).length <= LIMITS.checklistTextMaxLength,
  );
};

export const truncateForAi = (value: string) => sanitizeText(value).trim().slice(0, LIMITS.aiTitleMaxLength);

const readFileHeader = (file: File, byteCount: number): Promise<Uint8Array> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.readAsArrayBuffer(file.slice(0, byteCount));
  });

const hasValidImageMagic = async (file: File): Promise<boolean> => {
  const header = await readFileHeader(file, 8);
  const pngMagic = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  const jpegMagic = [0xff, 0xd8, 0xff];
  const startsWith = (magic: number[]) => magic.every((byte, index) => header[index] === byte);
  return startsWith(pngMagic) || startsWith(jpegMagic);
};

export const validateAvatarFile = async (file: File | null | undefined): Promise<string | null> => {
  if (!file) return null;
  if (file.size === 0) return "El archivo está vacío.";
  if (file.size > LIMITS.avatarMaxBytes) return "La imagen no puede superar los 5 MB.";
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!(AVATAR_ALLOWED_EXTENSIONS as readonly string[]).includes(ext)) {
    return "Solo se permiten archivos .png o .jpg.";
  }
  if (!(AVATAR_ALLOWED_MIME as readonly string[]).includes(file.type.toLowerCase())) {
    return "Solo se permiten archivos .png o .jpg.";
  }
  const validMagic = await hasValidImageMagic(file);
  if (!validMagic) return "El archivo no es una imagen válida.";
  return null;
};