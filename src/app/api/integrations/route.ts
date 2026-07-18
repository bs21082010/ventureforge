import { NextRequest, NextResponse } from "next/server";
import { getAvailableIntegrations, getAdapterByType } from "@/lib/integrations/crm";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const integrations = getAvailableIntegrations().map((a) => ({
    type: a.type,
    name: a.name,
    description: a.description,
    capabilities: a.capabilities,
    authType: a.authType,
  }));

  return NextResponse.json({ integrations });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const adapter = getAdapterByType(body.type);

    if (!adapter) {
      return NextResponse.json({ error: "Unknown integration type" }, { status: 400 });
    }

    const status = await adapter.connect(body.config || {});
    return NextResponse.json({ status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Connection failed" },
      { status: 500 }
    );
  }
}
