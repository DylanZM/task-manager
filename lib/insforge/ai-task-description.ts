export const DEFAULT_GPT5_MINI_MODEL = "openai/gpt-5-mini";

export const isGpt5MiniModel = (modelId: string) => {
  const normalized = modelId.toLowerCase().replaceAll("_", "-");
  return normalized.includes("gpt-5-mini") || normalized.includes("gpt5-mini");
};

export const resolveTaskDescriptionModel = (activeModelId: string | null, envModelId?: string) => {
  if (activeModelId && isGpt5MiniModel(activeModelId)) return activeModelId;
  if (envModelId && isGpt5MiniModel(envModelId)) return envModelId;
  return DEFAULT_GPT5_MINI_MODEL;
};

const extractTextFromContentItem = (item: unknown): string => {
  if (typeof item === "string") return item;
  if (!item || typeof item !== "object") return "";
  const record = item as Record<string, unknown>;
  if (typeof record.text === "string") return record.text;
  if (typeof record.value === "string") return record.value;
  if (record.text && typeof record.text === "object" && typeof (record.text as Record<string, unknown>).value === "string") {
    return (record.text as Record<string, string>).value;
  }
  if (typeof record.content === "string") return record.content;
  return "";
};

const extractFromChoicesLike = (value: unknown): string => {
  if (!value || typeof value !== "object") return "";
  const scoped = value as {
    output_text?: string;
    choices?: Array<{ message?: { content?: unknown } }>;
  };

  if (typeof scoped.output_text === "string" && scoped.output_text.trim()) {
    return scoped.output_text.trim();
  }

  const content = scoped.choices?.[0]?.message?.content;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content
      .map(extractTextFromContentItem)
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  return extractTextFromContentItem(content).trim();
};

export const extractCompletionText = (response: unknown) => {
  if (!response || typeof response !== "object") return "";
  const directText = extractFromChoicesLike(response);
  if (directText) return directText;

  const wrapped = response as { data?: unknown; response?: unknown };
  const dataText = extractFromChoicesLike(wrapped.data);
  if (dataText) return dataText;

  return extractFromChoicesLike(wrapped.response);
};

export const buildTaskDescriptionMessages = (title: string, strict = false) => {
  const baseSystem =
    "You are a productivity assistant. You must respond only with a task description in English, no title, no bullet points, and no quotes.";
  const strictSystem =
    "Write a single clear sentence of 20 to 40 words, specific, actionable, and focused on measurable results.";

  return [
    { role: "system", content: strict ? `${baseSystem} ${strictSystem}` : baseSystem },
    {
      role: "user",
      content: `Task title: ${title}. Generate a professional description for a Kanban board.`,
    },
  ] as Array<{ role: "system" | "user"; content: string }>;
};

export const isUsableDescription = (value: string) => value.trim().length >= 20;

export const buildFallbackDescription = (title: string) =>
  `Plan, execute, and validate the task "${title}" by defining concrete deliverables, acceptance criteria, and results tracking to ensure quality completion.`;
