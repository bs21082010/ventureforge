import { NextRequest, NextResponse } from "next/server";
import { runComplianceChecks } from "@/lib/compliance/checker";
import type { ComplianceCheckRequest } from "@/types/compliance";

export async function POST(request: NextRequest) {
  try {
    const body: ComplianceCheckRequest = await request.json();

    if (!body.jurisdiction || !body.industry) {
      return NextResponse.json(
        { error: "jurisdiction and industry are required" },
        { status: 400 }
      );
    }

    const result = await runComplianceChecks({
      planId: body.planId || "",
      jurisdiction: body.jurisdiction,
      industry: body.industry,
      sections: body.sections || [],
    });

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Compliance check failed" },
      { status: 500 }
    );
  }
}
