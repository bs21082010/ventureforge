import OpenAI from "openai";

let instance: OpenAI | null = null;
let ollamaAvailable: boolean | null = null;

function getClient(): OpenAI {
  if (!instance) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      instance = new OpenAI({
        apiKey,
        timeout: 30_000,
        maxRetries: 1,
      });
    } else {
      instance = new OpenAI({
        apiKey: "ollama",
        baseURL: (process.env.OLLAMA_URL || "http://localhost:11434") + "/v1",
        timeout: 30_000,
        maxRetries: 0,
      });
    }
  }
  return instance;
}

export function getModel(): string {
  if (process.env.OPENAI_API_KEY) {
    return "gpt-4o";
  }
  return process.env.OLLAMA_MODEL || "llama3.2";
}

export async function checkOllama(): Promise<boolean> {
  if (ollamaAvailable !== null) return ollamaAvailable;
  try {
    const baseUrl = (process.env.OLLAMA_URL || "http://localhost:11434").replace(/\/+$/, "");
    const res = await fetch(`${baseUrl}/api/tags`, { signal: AbortSignal.timeout(5000) });
    ollamaAvailable = res.ok;
    return ollamaAvailable;
  } catch {
    ollamaAvailable = false;
    return false;
  }
}

export async function chatCompletion(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const client = getClient();
  const response = await client.chat.completions.create({
    model,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 4096,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });
  return response.choices[0]?.message?.content ?? "";
}

export async function jsonCompletion<T = unknown>(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<T> {
  const text = await chatCompletion(model, systemPrompt, userPrompt, options);
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/```\s*([\s\S]*?)```/);
  const raw = jsonMatch ? jsonMatch[1].trim() : text.trim();
  return JSON.parse(raw) as T;
}

export function isApiKeySet(): boolean {
  return !!process.env.OPENAI_API_KEY;
}
