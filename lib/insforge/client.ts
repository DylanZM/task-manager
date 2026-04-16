import { createClient } from "@insforge/sdk";

let client: ReturnType<typeof createClient> | null = null;

export function getInsforgeClient() {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

  if (!baseUrl || !anonKey) {
    throw new Error(
      "Missing InsForge environment variables. Set NEXT_PUBLIC_INSFORGE_URL and NEXT_PUBLIC_INSFORGE_ANON_KEY.",
    );
  }

  if (!client) {
    client = createClient({ baseUrl, anonKey });
  }

  return client;
}
