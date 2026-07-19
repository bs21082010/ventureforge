import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isDeepSeekSet, deepSeekGenerate } from "@/lib/ai/deepseek-client";
import { isGeminiSet, geminiGenerate } from "@/lib/ai/gemini-client";
import { isApiKeySet, chatCompletion, getModel } from "@/lib/ai/openai-client";

const SECTION_PROMPTS = [
  { type: "EXECUTIVE_SUMMARY", title: "Executive Summary", prompt: "Write a professional executive summary for this business. Cover the mission, value proposition, target market, and key financial highlights. Be specific and concise. 3-4 paragraphs." },
  { type: "MARKET_ANALYSIS", title: "Market Analysis", prompt: "Write a detailed market analysis. Include market size, growth trends, target audience demographics, competitor landscape, and market opportunity. Use specific numbers and data points." },
  { type: "PRODUCT_DESCRIPTION", title: "Product Description", prompt: "Write a compelling product description. Cover what the product/service does, key features, unique selling points, technology stack, and how it solves customer problems. Be specific." },
  { type: "MARKETING_STRATEGY", title: "Marketing Strategy", prompt: "Write a comprehensive marketing strategy. Include channels (digital, social, content, paid), customer acquisition strategy, branding approach, pricing strategy, and growth tactics. Be actionable." },
  { type: "OPERATIONS_PLAN", title: "Operations Plan", prompt: "Write a detailed operations plan. Cover daily operations, technology infrastructure, supply chain, key processes, quality control, and scaling strategy. Be practical." },
  { type: "FINANCIAL_PLAN", title: "Financial Plan", prompt: "Write a financial plan. Include revenue model, cost structure, funding requirements, break-even analysis, 3-year projections summary, and key financial metrics. Use realistic numbers." },
  { type: "RISK_ASSESSMENT", title: "Risk Assessment", prompt: "Write a risk assessment. Identify 5-7 key business risks (market, financial, operational, regulatory, competitive), their likelihood, impact, and specific mitigation strategies for each." },
  { type: "TEAM_ORGANIZATION", title: "Team & Organization", prompt: "Write a team and organization plan. Cover required roles, organizational structure, hiring plan, culture values, advisory board needs, and key responsibilities. Be specific about roles." },
];

function generateLocalSections(title: string, industry: string, region: string): Record<string, string> {
  return {
    EXECUTIVE_SUMMARY: `${title} is a ${industry.toLowerCase()} company established to address a significant market opportunity in ${region}. Our mission is to deliver innovative solutions that create measurable value for our customers.\n\nWe target mid-market businesses seeking to modernize their operations through technology-driven solutions. Our value proposition centers on delivering superior outcomes at competitive prices with exceptional service.\n\nFinancial projections indicate strong growth potential, with break-even achievable within 18-24 months. We are seeking initial funding of $500K-$1M to fuel product development and market entry.\n\nKey success factors include our experienced team, differentiated technology, and deep understanding of ${industry.toLowerCase()} market dynamics in ${region}.`,

    MARKET_ANALYSIS: `The ${industry} market in ${region} represents a $2.5B+ opportunity growing at 12-15% annually. Key drivers include digital transformation, increasing demand for efficiency, and evolving customer expectations.\n\nTarget audience: Mid-market companies (100-1000 employees) in ${region} with annual revenues of $10M-$100M. These organizations are underserved by current solutions, which are either too expensive or too basic.\n\nCompetition: The market includes 15-20 established players, but most focus on enterprise clients. There is a clear gap for solutions tailored to mid-market needs.\n\nMarket entry strategy: Focus on a specific vertical within ${industry} where we can establish thought leadership and build case studies before expanding to adjacent segments.\n\nTotal Addressable Market (TAM): $2.5B | Serviceable Market (SAM): $500M | Obtainable Market (SOM): $25M within 3 years.`,

    PRODUCT_DESCRIPTION: `${title} provides a comprehensive platform that combines ${industry.toLowerCase()} expertise with modern technology to deliver measurable results for our customers.\n\nCore features:\n- Real-time analytics and reporting dashboard\n- Automated workflows reducing manual effort by 60%\n- AI-powered insights and recommendations\n- Seamless integration with existing business tools\n- Mobile-first design for on-the-go access\n\nTechnology stack: Built on modern cloud infrastructure (AWS/Azure) with React frontend, Node.js backend, and PostgreSQL database. The architecture is designed for scalability, security, and reliability.\n\nUnique differentiators:\n1. Industry-specific templates and workflows\n2. 99.9% uptime SLA with dedicated support\n3. Implementation in 2-4 weeks vs. industry average of 3-6 months\n4. Transparent pricing with no hidden fees`,

    MARKETING_STRATEGY: `Our go-to-market strategy combines digital marketing, content marketing, and strategic partnerships to efficiently acquire customers in ${region}.\n\nDigital Marketing:\n- SEO-optimized website targeting high-intent keywords in ${industry.toLowerCase()}\n- LinkedIn and Google Ads campaigns with $5K/month initial budget\n- Email nurture sequences for lead conversion\n\nContent Marketing:\n- Weekly industry insights blog and monthly research reports\n- Webinars and case studies featuring early customers\n- Guest articles in industry publications\n\nSales Strategy:\n- Inside sales team for inbound leads\n- Outbound prospecting targeting top 100 companies in ${region}\n- Free trial/POC program to reduce adoption friction\n\nPartnerships:\n- Technology integrations with complementary platforms\n- Channel partnerships with ${region}-based consultancies\n- Industry association memberships\n\nCustomer Acquisition Cost (CAC) target: $2,000 | Lifetime Value (LTV): $24,000 | LTV:CAC ratio: 12:1`,

    OPERATIONS_PLAN: `Operations are designed for efficiency, scalability, and quality from day one.\n\nTechnology Infrastructure:\n- Cloud-native architecture on AWS with auto-scaling\n- CI/CD pipelines for daily deployments\n- Automated testing with 90%+ code coverage\n- SOC 2 compliant data handling\n\nTeam Structure (Phase 1 - 6 months):\n- CEO/Founder: Strategy, fundraising, key partnerships\n- CTO: Product development, architecture, technical leadership\n- 3 Engineers: Full-stack development\n- 1 Designer: UI/UX design\n- 1 Growth Lead: Marketing, sales, customer success\n\nDevelopment Process:\n- 2-week sprint cycles with daily standups\n- Feature flags for safe rollouts\n- Monitoring and alerting with PagerDuty\n- Customer feedback integration via in-app surveys\n\nKey Milestones:\n- Month 1-3: MVP launch and first 10 customers\n- Month 4-6: Product-market fit validation\n- Month 7-12: Scale to 100 customers`,

    FINANCIAL_PLAN: `Revenue Model:\n- SaaS subscription: $200-$2,000/month per customer based on tier\n- Implementation fees: $5,000-$15,000 one-time\n- Professional services: $150/hour for customization\n\nCost Structure:\n- Cloud infrastructure: $3,000/month (scales with usage)\n- Team salaries: $40,000/month (8 people)\n- Marketing: $5,000/month\n- Office/Remote: $2,000/month\n- Total monthly burn: ~$50,000\n\nFunding Requirements:\n- Seed round: $1M to fund 18 months of operations\n- Use of funds: 40% product development, 30% sales/marketing, 20% operations, 10% reserves\n\nProjections (3-Year):\n- Year 1: $300K revenue, -$500K net (investment phase)\n- Year 2: $1.5M revenue, +$200K net (break-even)\n- Year 3: $4M revenue, +$1.2M net (profitable growth)\n\nBreak-even: Month 18 | Target gross margin: 75%`,

    RISK_ASSESSMENT: `1. Market Risk (Medium): Competition from established players may slow adoption.\n   Mitigation: Focus on underserved mid-market niche, build strong brand, deliver exceptional customer experience.\n\n2. Financial Risk (Medium): Slower-than-expected revenue growth could strain cash flow.\n   Mitigation: Maintain 12-month runway, flexible cost structure, milestone-based spending.\n\n3. Technology Risk (Low): Platform reliability and security concerns.\n   Mitigation: SOC 2 compliance, automated testing, disaster recovery, regular security audits.\n\n4. Regulatory Risk (Low): Changes in ${industry.toLowerCase()} regulations in ${region}.\n   Mitigation: Proactive compliance monitoring, flexible architecture for policy changes.\n\n5. Talent Risk (Medium): Difficulty hiring skilled technical talent in ${region}.\n   Mitigation: Remote-first culture, competitive equity packages, strong employer brand.\n\n6. Customer Concentration Risk (Medium): Over-reliance on early customers.\n   Mitigation: Diversify customer base, aim for no single customer >10% of revenue by Year 2.\n\n7. Competitive Risk (High): Well-funded competitors may pivot to our market.\n   Mitigation: Speed of execution, deep industry focus, strong customer relationships.`,

    TEAM_ORGANIZATION: `Founding Team:\n- CEO/Founder: 10+ years in ${industry.toLowerCase()}, previous startup experience, MBA\n- CTO: 12+ years software engineering, former tech lead at major company\n\nOrganizational Structure (Phase 1 - 8 people):\nExecutive: CEO, CTO\nEngineering: 3 Full-Stack Engineers\nDesign: 1 Product Designer\nGrowth: 1 Growth Lead (Marketing + Sales)\nOperations: 1 Operations Manager\n\nHiring Plan (Year 1):\n- Q2: +2 Engineers (backend focus)\n- Q3: +1 Customer Success Manager\n- Q4: +1 Sales Representative\n\nCulture Values:\n1. Customer Obsession: Every decision starts with the customer\n2. Bias for Action: Move fast, learn fast, iterate fast\n3. Transparency: Open communication, shared context\n4. Excellence: High standards, continuous improvement\n5. Ownership: Take responsibility, drive results\n\nAdvisory Board (Planned):\n- Industry veteran from ${industry.toLowerCase()}\n- ${region}-based business leader\n- SaaS growth expert`,
  };
}

async function generateAISections(title: string, industry: string, region: string): Promise<Record<string, string>> {
  const context = `Business: ${title}\nIndustry: ${industry}\nRegion: ${region}\n`;
  const results: Record<string, string> = {};

  // Try DeepSeek first
  if (isDeepSeekSet()) {
    try {
      for (const section of SECTION_PROMPTS) {
        try {
          const content = await deepSeekGenerate(`${context}\n\n${section.prompt}`, "You are a professional business plan writer. Write detailed, specific, and actionable business plan sections. Use professional language with concrete numbers and specifics. No placeholders or generic statements.");
          results[section.type] = content;
        } catch {
          // If individual section fails, skip to next
        }
      }
      if (Object.keys(results).length >= 6) return results;
    } catch {}
  }

  // Try Gemini
  if (isGeminiSet()) {
    try {
      for (const section of SECTION_PROMPTS) {
        if (!results[section.type]) {
          try {
            const content = await geminiGenerate(`${context}\n\n${section.prompt}`, "You are a professional business plan writer. Write detailed, specific, and actionable business plan sections. Use professional language with concrete numbers and specifics.");
            results[section.type] = content;
          } catch {}
        }
      }
      if (Object.keys(results).length >= 6) return results;
    } catch {}
  }

  // Try OpenAI/Ollama
  if (isApiKeySet()) {
    try {
      for (const section of SECTION_PROMPTS) {
        if (!results[section.type]) {
          try {
            const content = await chatCompletion(getModel(), "You are a professional business plan writer. Write detailed, specific, and actionable business plan sections.", `${context}\n\n${section.prompt}`, { temperature: 0.7, maxTokens: 1024 });
            results[section.type] = content;
          } catch {}
        }
      }
      if (Object.keys(results).length >= 6) return results;
    } catch {}
  }

  // Local fallback - always fills all sections
  const localSections = generateLocalSections(title, industry, region);
  for (const section of SECTION_PROMPTS) {
    if (!results[section.type]) {
      results[section.type] = localSections[section.type];
    }
  }

  return results;
}

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

    // Generate AI content for all sections
    const sectionContent = await generateAISections(body.title, body.industry, body.region);

    const sections = SECTION_PROMPTS.map((s, i) => ({
      type: s.type,
      title: s.title,
      content: JSON.stringify({ text: sectionContent[s.type] || "" }),
      order: i,
    }));

    const plan = await prisma.plan.create({
      data: {
        title: body.title,
        description: body.description || "",
        industry: body.industry,
        region: body.region,
        ownerId: session.user.id,
        sections: { create: sections },
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
