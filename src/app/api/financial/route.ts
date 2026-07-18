import { NextRequest, NextResponse } from "next/server";
import { recalculate } from "@/lib/financial-engine/engine";
import type { RecalculationInput } from "@/types/financial";

export async function POST(request: NextRequest) {
  try {
    const body: RecalculationInput = await request.json();

    if (!body.planId || !body.assumptions || !body.periodRange) {
      return NextResponse.json(
        { error: "Missing required fields: planId, assumptions, periodRange" },
        { status: 400 }
      );
    }

    const result = recalculate(body);
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Calculation failed" },
      { status: 500 }
    );
  }
}
