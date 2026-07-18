import { NextRequest, NextResponse } from "next/server";
import {
  generateBusinessIdeas,
  generatePredictions,
  explainDecision,
} from "@/lib/ai/gpt-bridge";
import { generateMarketingIdeas } from "@/lib/ai/creativity-sandbox";
import { generateForesight } from "@/lib/ai/foresight";
import { generateExplainability, rankSuggestions } from "@/lib/ai/explainable";
import {
  createDefaultWorkflow,
  advanceWorkflow,
  generateAISectionDraft,
} from "@/lib/ai/workflow";
import { isApiKeySet } from "@/lib/ai/openai-client";
import { auth } from "@/lib/auth";
import type {
  CreativityRequest,
  ForesightRequest,
  AISuggestion,
} from "@/types/ai";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "generate") {
      const result = await generateBusinessIdeas(
        body.industry || "Technology",
        body.region || "global",
        body.count || 5
      );
      return NextResponse.json(result);
    }

    if (action === "predict") {
      const result = await generatePredictions(
        body.assumptions || [],
        body.horizon || 5
      );
      return NextResponse.json(result);
    }

    if (action === "explain") {
      const result = await explainDecision(
        body.decisionType || "GENERAL",
        body.inputs || {}
      );
      return NextResponse.json(result);
    }

    if (action === "workflow") {
      const config = createDefaultWorkflow(body.planId || "");
      let current = config;
      const steps = body.steps || 1;
      for (let i = 0; i < steps && current.status !== "COMPLETED"; i++) {
        current = advanceWorkflow(current);
      }
      const sectionDraft = generateAISectionDraft(
        body.sectionType || "EXECUTIVE_SUMMARY",
        body.context || {}
      );
      return NextResponse.json({ workflow: current, draft: sectionDraft });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI processing failed";
    const isVisionError = message.includes("does not support image");
    return NextResponse.json(
      {
        error: isVisionError
          ? "The AI model is not available. Try setting OPENAI_API_KEY or ensuring Ollama is running with a compatible model (ollama pull llama3.2)."
          : message,
        fallback: true,
      },
      { status: 500 }
    );
  }
}
