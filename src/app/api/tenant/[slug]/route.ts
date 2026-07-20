import { NextRequest, NextResponse } from "next/server";
import { loadTenantConfig } from "@/lib/tenant/loader";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const config = await loadTenantConfig(slug);
    return NextResponse.json(config);
  } catch {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }
}
