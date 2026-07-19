import OpenAI from "openai";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";

let instance: OpenAI | null = null;

function getClient(): OpenAI | null {
  if (!DEEPSEEK_API_KEY) return null;
  if (!instance) {
    instance = new OpenAI({
      apiKey: DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com",
      timeout: 30_000,
      maxRetries: 1,
    });
  }
  return instance;
}

export function isDeepSeekSet(): boolean {
  return !!DEEPSEEK_API_KEY;
}

export async function deepSeekChat(
  prompt: string,
  systemPrompt: string,
  history: { role: "user" | "assistant"; content: string }[] = []
): Promise<string> {
  const client = getClient();
  if (!client) throw new Error("No DeepSeek API key");

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...history.slice(-8),
    { role: "user" as const, content: prompt },
  ];

  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    temperature: 0.7,
    max_tokens: 2048,
    messages,
  });

  return response.choices[0]?.message?.content ?? "";
}

export async function deepSeekGenerate(
  prompt: string,
  systemPrompt: string
): Promise<string> {
  return deepSeekChat(prompt, systemPrompt);
}
