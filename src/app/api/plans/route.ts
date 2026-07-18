import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

const DEFAULT_SECTIONS = [
  { type: "EXECUTIVE_SUMMARY", title: "Executive Summary", content: { text: "" }, order: 0 },
  { type: "MARKET_ANALYSIS", title: "Market Analysis", content: { text: "" }, order: 1 },
  { type: "PRODUCT_DESCRIPTION", title: "Product Description", content: { text: "" }, order: 2 },
  { type: "MARKETING_STRATEGY", title: "Marketing Strategy", content: { text: "" }, order: 3 },
  { type: "OPERATIONS_PLAN", title: "Operations Plan", content: { text: "" }, order: 4 },
  { type: "FINANCIAL_PLAN", title: "Financial Plan", content: { text: "" }, order: 5 },
  { type: "RISK_ASSESSMENT", title: "Risk Assessment", content: { text: "" }, order: 6 },
  { type: "TEAM_ORGANIZATION", title: "Team & Organization", content: { text: "" }, order: 7 },
];

const DEFAULT_ASSUMPTIONS = [
  { category: "REVENUE", name: "REVENUE", value: 100000, unit: "USD", isDynamic: true },
  { category: "COST", name: "COST_OF_GOODS", value: 30000, unit: "USD", isDynamic: true },
  { category: "INFLATION", name: "INFLATION_RATE", value: 5.0, unit: "%", isDynamic: false },
  { category: "TAX", name: "TAX_RATE", value: 25, unit: "%", isDynamic: false },
  { category: "SALARY", name: "SALARY_BUDGET", value: 0.30, unit: "ratio", isDynamic: true },
  { category: "RENT", name: "RENT", value: 5000, unit: "USD", isDynamic: false },
  { category: "MARKETING", name: "MARKETING_BUDGET", value: 0.12, unit: "ratio", isDynamic: true },
  { category: "INTEREST_RATE", name: "INTEREST_RATE", value: 6.5, unit: "%", isDynamic: false },
];

function transformPlan(plan: any) {
  return {
    ...plan,
    sections: plan.sections?.map((s: any) => ({
      ...s,
      content: typeof s.content === "string" ? JSON.parse(s.content) : s.content,
    })) || [],
  };
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const plan = await prisma.plan.findUnique({
      where: { id },
      include: { sections: { orderBy: { order: "asc" } }, assumptions: true },
    });
    if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    if (plan.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ plan: transformPlan(plan) });
  }

  const plans = await prisma.plan.findMany({
    where: { ownerId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { sections: { orderBy: { order: "asc" } }, assumptions: true },
  });

  return NextResponse.json({ plans: plans.map(transformPlan) });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.title || !body.industry || !body.region) {
      return NextResponse.json({ error: "title, industry, and region are required" }, { status: 400 });
    }

    const plan = await prisma.plan.create({
      data: {
        title: body.title,
        description: body.description || "",
        industry: body.industry,
        region: body.region,
        ownerId: session.user.id,
        sections: {
          create: DEFAULT_SECTIONS.map((s) => ({
            type: s.type,
            title: s.title,
            content: JSON.stringify(s.content),
            order: s.order,
          })),
        },
        assumptions: {
          create: DEFAULT_ASSUMPTIONS.map((a) => ({
            category: a.category,
            name: a.name,
            value: a.value,
            unit: a.unit,
            isDynamic: a.isDynamic,
          })),
        },
      },
      include: { sections: { orderBy: { order: "asc" } }, assumptions: true },
    });

    return NextResponse.json({ plan: transformPlan(plan) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: "Plan ID required" }, { status: 400 });
    }

    const existing = await prisma.plan.findUnique({ where: { id: body.id } });
    if (!existing) return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    if (existing.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data: any = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.description !== undefined) data.description = body.description;
    if (body.status !== undefined) data.status = body.status;
    if (body.industry !== undefined) data.industry = body.industry;
    if (body.region !== undefined) data.region = body.region;
    if (body.isPublished !== undefined) data.isPublished = body.isPublished;

    if (body.sections) {
      await prisma.planSection.deleteMany({ where: { planId: body.id } });
      await prisma.planSection.createMany({
        data: body.sections.map((s: any, i: number) => ({
          planId: body.id,
          type: s.type,
          title: s.title,
          content: typeof s.content === "string" ? s.content : JSON.stringify(s.content),
          order: s.order ?? i,
        })),
      });
    }

    if (body.assumptions) {
      await prisma.assumption.deleteMany({ where: { planId: body.id } });
      await prisma.assumption.createMany({
        data: body.assumptions.map((a: any) => ({
          planId: body.id,
          category: a.category,
          name: a.name,
          value: a.value,
          unit: a.unit || null,
          isDynamic: a.isDynamic ?? false,
          dataSource: a.dataSource || null,
        })),
      });
    }

    const plan = await prisma.plan.update({
      where: { id: body.id },
      data,
      include: { sections: { orderBy: { order: "asc" } }, assumptions: true },
    });

    return NextResponse.json({ plan: transformPlan(plan) });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Plan ID required" }, { status: 400 });

  const existing = await prisma.plan.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  if (existing.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.plan.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
