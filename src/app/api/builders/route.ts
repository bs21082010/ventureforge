import { NextRequest, NextResponse } from "next/server";
import { generateGame } from "@/lib/builders/game";
import { generateWebsite } from "@/lib/builders/website";
import { generateApp } from "@/lib/builders/app";
import { researchTopic } from "@/lib/builders/research";
import { generateBusinessBundle } from "@/lib/builders/business";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    switch (type) {
      case "game": {
        const result = await generateGame({ prompt: body.prompt, genre: body.genre });
        return NextResponse.json(result);
      }
      case "website": {
        const result = await generateWebsite({ prompt: body.prompt, framework: body.framework });
        return NextResponse.json(result);
      }
      case "app": {
        const result = await generateApp({ prompt: body.prompt, platform: body.platform });
        return NextResponse.json(result);
      }
      case "research": {
        const result = await researchTopic({ topic: body.topic, depth: body.depth });
        return NextResponse.json(result);
      }
      case "business": {
        const result = await generateBusinessBundle({
          idea: body.idea,
          industry: body.industry,
          includeWebsite: body.includeWebsite ?? false,
          includeApp: body.includeApp ?? false,
        });
        return NextResponse.json(result);
      }
      default:
        return NextResponse.json({ error: "Unknown builder type" }, { status: 400 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Builder failed";
    const isVisionError = message.includes("does not support image");
    return NextResponse.json(
      {
        error: isVisionError
          ? "AI model unavailable. Set OPENAI_API_KEY or run Ollama with a compatible model (ollama pull llama3.2)."
          : message,
      },
      { status: 500 }
    );
  }
}
