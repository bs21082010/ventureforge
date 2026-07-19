import { deepSeekChat, isDeepSeekSet } from "./deepseek-client";
import { geminiGenerate, isGeminiSet } from "./gemini-client";
import { chatCompletion, getModel, isApiKeySet, checkOllama } from "./openai-client";

export type AIProvider = "deepseek" | "gemini" | "openai" | "ollama";

export async function getAvailableProvider(): Promise<AIProvider | null> {
  if (isDeepSeekSet()) return "deepseek";
  if (isGeminiSet()) return "gemini";
  if (isApiKeySet()) return "openai";
  const hasOllama = await checkOllama();
  if (hasOllama) return "ollama";
  return null;
}

export async function isAnyAI(): Promise<boolean> {
  return (await getAvailableProvider()) !== null;
}

export async function aiChat(
  systemPrompt: string,
  userPrompt: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  // Try DeepSeek first (free, strong reasoning)
  if (isDeepSeekSet()) {
    try {
      return await deepSeekChat(userPrompt, systemPrompt);
    } catch (err) {
      console.error("DeepSeek failed, trying Gemini:", err);
    }
  }

  // Try Gemini (free, 1M tokens/day)
  if (isGeminiSet()) {
    try {
      return await geminiGenerate(userPrompt, systemPrompt);
    } catch (err) {
      console.error("Gemini failed, trying OpenAI/Ollama:", err);
    }
  }

  // Try OpenAI or Ollama
  const hasOpenAI = isApiKeySet() || (await checkOllama());
  if (hasOpenAI) {
    try {
      return await chatCompletion(getModel(), systemPrompt, userPrompt, options);
    } catch (err) {
      console.error("OpenAI/Ollama failed:", err);
    }
  }

  throw new Error(
    "No AI provider available. Set DEEPSEEK_API_KEY (free at platform.deepseek.com), GEMINI_API_KEY (free at aistudio.google.com/apikey), or run Ollama locally."
  );
}

export async function aiJsonCompletion<T = unknown>(
  systemPrompt: string,
  userPrompt: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<T> {
  const text = await aiChat(systemPrompt, userPrompt, options);
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI response did not contain valid JSON:\n" + text.slice(0, 500));
  return JSON.parse(jsonMatch[0]) as T;
}
