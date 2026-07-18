import { NextRequest, NextResponse } from "next/server";
import { runComplianceChecks } from "@/lib/compliance/checker";
import { auth } from "@/lib/auth";
import type { ComplianceCheckRequest } from "@/types/compliance";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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
