import { createClient } from "@insforge/sdk";

let client: ReturnType<typeof createClient> | null = null;

const hasPlaceholderValue = (value: string) =>
  value.includes("your-project.insforge.app") || value.includes("your-insforge-anon-key");

export function getInsforgeClient() {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

  if (!baseUrl || !anonKey || hasPlaceholderValue(baseUrl) || hasPlaceholderValue(anonKey)) {
    throw new Error(
      "Invalid InsForge environment variables. Set NEXT_PUBLIC_INSFORGE_URL and NEXT_PUBLIC_INSFORGE_ANON_KEY with real values (not placeholders).",
    );
  }

  if (!client) {
    client = createClient({ baseUrl, anonKey });
  }

  return client;
}
