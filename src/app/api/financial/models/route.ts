import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const models = await prisma.financialModel.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ models });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load models";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, assumptions, scenarios, periodRange } = body;

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const model = await prisma.financialModel.create({
      data: {
        userId: session.user.id,
        name,
        assumptions: JSON.stringify(assumptions || []),
        scenarios: JSON.stringify(scenarios || []),
        periodRange: JSON.stringify(periodRange || {}),
      },
    });

    return NextResponse.json({ model });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save model";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, assumptions, scenarios, periodRange } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const existing = await prisma.financialModel.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }
    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const model = await prisma.financialModel.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(assumptions !== undefined && { assumptions: JSON.stringify(assumptions) }),
        ...(scenarios !== undefined && { scenarios: JSON.stringify(scenarios) }),
        ...(periodRange !== undefined && { periodRange: JSON.stringify(periodRange) }),
      },
    });

    return NextResponse.json({ model });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update model";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const existing = await prisma.financialModel.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }
    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.financialModel.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete model";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
