import { NextRequest, NextResponse } from "next/server";
import { savePlan, getPlan, listPlans, deletePlan, isDynamoDBSet } from "@/lib/db/dynamodb";
import { isDeepSeekSet, deepSeekGenerate } from "@/lib/ai/deepseek-client";
import { isGeminiSet, geminiGenerate } from "@/lib/ai/gemini-client";

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

function generateLocalSections(title: string, industry: string, region: string): Record<string, string> {
  return {
    EXECUTIVE_SUMMARY: `${title} is a ${industry.toLowerCase()} company established to address a significant market opportunity in ${region}. Our mission is to deliver innovative solutions that create measurable value for our customers.\n\nWe target mid-market businesses seeking to modernize their operations through technology-driven solutions. Our value proposition centers on delivering superior outcomes at competitive prices with exceptional service.\n\nFinancial projections indicate strong growth potential, with break-even achievable within 18-24 months. We are seeking initial funding of $500K-$1M to fuel product development and market entry.\n\nKey success factors include our experienced team, differentiated technology, and deep understanding of ${industry.toLowerCase()} market dynamics in ${region}.`,
    MARKET_ANALYSIS: `The ${industry} market in ${region} represents a $2.5B+ opportunity growing at 12-15% annually. Key drivers include digital transformation, increasing demand for efficiency, and evolving customer expectations.\n\nTarget audience: Mid-market companies (100-1000 employees) in ${region} with annual revenues of $10M-$100M.\n\nCompetition: The market includes 15-20 established players, but most focus on enterprise clients. There is a clear gap for solutions tailored to mid-market needs.\n\nTotal Addressable Market (TAM): $2.5B | Serviceable Market (SAM): $500M | Obtainable Market (SOM): $25M within 3 years.`,
    PRODUCT_DESCRIPTION: `${title} provides a comprehensive platform that combines ${industry.toLowerCase()} expertise with modern technology to deliver measurable results.\n\nCore features:\n- Real-time analytics and reporting dashboard\n- Automated workflows reducing manual effort by 60%\n- AI-powered insights and recommendations\n- Seamless integration with existing business tools\n- Mobile-first design for on-the-go access\n\nUnique differentiators:\n1. Industry-specific templates and workflows\n2. 99.9% uptime SLA with dedicated support\n3. Implementation in 2-4 weeks vs. industry average of 3-6 months\n4. Transparent pricing with no hidden fees`,
    MARKETING_STRATEGY: `Our go-to-market strategy combines digital marketing, content marketing, and strategic partnerships.\n\nDigital Marketing:\n- SEO-optimized website targeting high-intent keywords\n- LinkedIn and Google Ads campaigns with $5K/month initial budget\n- Email nurture sequences for lead conversion\n\nContent Marketing:\n- Weekly industry insights blog and monthly research reports\n- Webinars and case studies featuring early customers\n\nSales Strategy:\n- Inside sales team for inbound leads\n- Outbound prospecting targeting top 100 companies\n- Free trial/POC program to reduce adoption friction\n\nCustomer Acquisition Cost (CAC) target: $2,000 | Lifetime Value (LTV): $24,000 | LTV:CAC ratio: 12:1`,
    OPERATIONS_PLAN: `Operations are designed for efficiency, scalability, and quality from day one.\n\nTechnology Infrastructure:\n- Cloud-native architecture on AWS with auto-scaling\n- CI/CD pipelines for daily deployments\n- Automated testing with 90%+ code coverage\n\nTeam Structure (Phase 1):\n- CEO/Founder: Strategy, fundraising, key partnerships\n- CTO: Product development, architecture\n- 3 Engineers: Full-stack development\n- 1 Designer: UI/UX design\n- 1 Growth Lead: Marketing, sales, customer success\n\nKey Milestones:\n- Month 1-3: MVP launch and first 10 customers\n- Month 4-6: Product-market fit validation\n- Month 7-12: Scale to 100 customers`,
    FINANCIAL_PLAN: `Revenue Model:\n- SaaS subscription: $200-$2,000/month per customer\n- Implementation fees: $5,000-$15,000 one-time\n- Professional services: $150/hour\n\nCost Structure:\n- Cloud infrastructure: $3,000/month\n- Team salaries: $40,000/month (8 people)\n- Marketing: $5,000/month\n- Total monthly burn: ~$50,000\n\nFunding Requirements:\n- Seed round: $1M to fund 18 months\n- Use of funds: 40% product, 30% sales/marketing, 20% operations, 10% reserves\n\nProjections (3-Year):\n- Year 1: $300K revenue, -$500K net\n- Year 2: $1.5M revenue, +$200K net\n- Year 3: $4M revenue, +$1.2M net\n\nBreak-even: Month 18 | Target gross margin: 75%`,
    RISK_ASSESSMENT: `1. Market Risk (Medium): Competition from established players.\n   Mitigation: Focus on underserved mid-market niche, build strong brand.\n\n2. Financial Risk (Medium): Slower-than-expected revenue growth.\n   Mitigation: Maintain 12-month runway, flexible cost structure.\n\n3. Technology Risk (Low): Platform reliability concerns.\n   Mitigation: SOC 2 compliance, automated testing, disaster recovery.\n\n4. Regulatory Risk (Low): Changes in regulations.\n   Mitigation: Proactive compliance monitoring, flexible architecture.\n\n5. Talent Risk (Medium): Difficulty hiring skilled talent.\n   Mitigation: Remote-first culture, competitive equity packages.\n\n6. Customer Concentration Risk (Medium): Over-reliance on early customers.\n   Mitigation: Diversify customer base, no single customer >10% of revenue.`,
    TEAM_ORGANIZATION: `Founding Team:\n- CEO/Founder: 10+ years in ${industry.toLowerCase()}, previous startup experience\n- CTO: 12+ years software engineering, former tech lead\n\nOrganizational Structure (Phase 1 - 8 people):\nExecutive: CEO, CTO\nEngineering: 3 Full-Stack Engineers\nDesign: 1 Product Designer\nGrowth: 1 Growth Lead\nOperations: 1 Operations Manager\n\nHiring Plan (Year 1):\n- Q2: +2 Engineers\n- Q3: +1 Customer Success Manager\n- Q4: +1 Sales Representative\n\nCulture Values:\n1. Customer Obsession\n2. Bias for Action\n3. Transparency\n4. Excellence\n5. Ownership`,
  };
}

async function generateAISections(title: string, industry: string, region: string): Promise<Record<string, string>> {
  const context = `Business: ${title}\nIndustry: ${industry}\nRegion: ${region}\n`;
  const results: Record<string, string> = {};

  if (isDeepSeekSet()) {
    try {
      for (const section of SECTION_PROMPTS) {
        try {
          const content = await deepSeekGenerate(`${context}\n\n${section.prompt}`, "You are a professional business plan writer. Write detailed, specific, and actionable business plan sections. Use professional language with concrete numbers and specifics.");
          results[section.type] = content;
        } catch {}
      }
      if (Object.keys(results).length >= 6) return results;
    } catch {}
  }

  if (isGeminiSet()) {
    try {
      for (const section of SECTION_PROMPTS) {
        if (!results[section.type]) {
          try {
            const content = await geminiGenerate(`${context}\n\n${section.prompt}`, "You are a professional business plan writer. Write detailed, specific, and actionable business plan sections.");
            results[section.type] = content;
          } catch {}
        }
      }
      if (Object.keys(results).length >= 6) return results;
    } catch {}
  }

  return generateLocalSections(title, industry, region);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    // Get single plan
    if (isDynamoDBSet()) {
      try {
        const plan = await getPlan(id);
        if (plan) return NextResponse.json({ plan });
      } catch (err) {
        console.error("DynamoDB get failed:", err);
      }
    }
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  // List all plans
  if (isDynamoDBSet()) {
    try {
      const plans = await listPlans();
      if (plans.length > 0) return NextResponse.json({ plans });
    } catch (err) {
      console.error("DynamoDB list failed:", err);
    }
  }

  return NextResponse.json({ plans: [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title || !body.industry || !body.region) {
      return NextResponse.json({ error: "title, industry, and region are required" }, { status: 400 });
    }

    const planId = `plan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();

    // Generate AI content for all sections
    const sectionContent = await generateAISections(body.title, body.industry, body.region);

    const sections = SECTION_PROMPTS.map((s, i) => ({
      type: s.type,
      title: s.title,
      content: { text: sectionContent[s.type] || "" },
      order: i,
    }));

    const plan = {
      id: planId,
      title: body.title,
      description: body.description || "",
      industry: body.industry,
      region: body.region,
      status: "DRAFT",
      version: 1,
      ownerId: "local",
      createdAt: now,
      updatedAt: now,
      sections,
      assumptions: DEFAULT_ASSUMPTIONS,
    };

    // Save to DynamoDB if configured
    if (isDynamoDBSet()) {
      try {
        await savePlan(plan);
      } catch (err) {
        console.error("DynamoDB save failed:", err);
      }
    }

    return NextResponse.json({ plan }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: "Plan ID required" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const updates: any = { id: body.id, updatedAt: now };
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.status !== undefined) updates.status = body.status;
    if (body.sections) updates.sections = body.sections;

    // Save to DynamoDB if configured
    if (isDynamoDBSet()) {
      try {
        const existing = await getPlan(body.id);
        if (existing) {
          const merged = { ...existing, ...updates };
          await savePlan(merged);
        }
      } catch (err) {
        console.error("DynamoDB update failed:", err);
      }
    }

    return NextResponse.json({ plan: { ...updates } });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Plan ID required" }, { status: 400 });

  if (isDynamoDBSet()) {
    try {
      await deletePlan(id);
    } catch (err) {
      console.error("DynamoDB delete failed:", err);
    }
  }

  return NextResponse.json({ success: true });
}
