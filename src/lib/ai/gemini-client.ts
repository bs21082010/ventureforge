import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

let genAI: GoogleGenerativeAI | null = null;

function getClient() {
  if (!GEMINI_API_KEY) return null;
  if (!genAI) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }
  return genAI;
}

export function isGeminiSet(): boolean {
  return !!GEMINI_API_KEY;
}

export async function geminiChat(
  prompt: string,
  systemPrompt: string,
  history: { role: "user" | "model"; parts: string }[] = []
): Promise<string> {
  const client = getClient();
  if (!client) throw new Error("No Gemini API key");

  const model = client.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: systemPrompt,
  });

  const chat = model.startChat({
    history: history.map((h) => ({
      role: h.role,
      parts: [{ text: h.parts }],
    })),
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  });

  const result = await chat.sendMessage(prompt);
  return result.response.text();
}

export async function geminiGenerate(
  prompt: string,
  systemPrompt: string
): Promise<string> {
  const client = getClient();
  if (!client) throw new Error("No Gemini API key");

  const model = client.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: systemPrompt,
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}
