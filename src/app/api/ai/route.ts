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
import { getModel, chatCompletion, isApiKeySet, checkOllama } from "@/lib/ai/openai-client";
import type {
  CreativityRequest,
  ForesightRequest,
  AISuggestion,
} from "@/types/ai";

const CHAT_SYSTEM_PROMPT = `You are VentureForge AI, a helpful business assistant. You help entrepreneurs with:
- Business strategy and planning
- Marketing and branding ideas
- Financial planning and projections
- Market research and analysis
- Product development advice
- Leadership and team building
- Any business-related questions

Be concise, practical, and actionable. Give specific steps when possible. Use plain text with bullet points for lists. No JSON, no code blocks - just natural helpful conversation.`;

export async function POST(request: NextRequest) {
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

    if (action === "chat") {
      const hasAI = isApiKeySet() || await checkOllama();
      if (hasAI) {
        try {
          const model = getModel();
          const history = body.history || [];
          const messages = [
            { role: "system" as const, content: CHAT_SYSTEM_PROMPT },
            ...history.slice(-6).map((m: { role: string; content: string }) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            })),
            { role: "user" as const, content: body.message || "" },
          ];
          const result = await chatCompletion(model, CHAT_SYSTEM_PROMPT, messages.map(m => m.content).join("\n"), { temperature: 0.7, maxTokens: 2048 });
          return NextResponse.json({ response: result });
        } catch (err) {
          console.error("AI chat failed, using template:", err);
        }
      }
      // Template fallback for chat - answers ANY question freely
      const msg = (body.message || "").toLowerCase();
      const ctx = body.businessContext || "your business";
      const words = msg.split(/\s+/).filter((w: string) => w.length > 3);
      const topic = words.slice(0, 5).join(" ") || "this topic";

      // Detect question type
      const isHowTo = msg.includes("how") || msg.includes("way") || msg.includes("method") || msg.includes("process");
      const isWhat = msg.includes("what") || msg.includes("define") || msg.includes("explain") || msg.includes("mean");
      const isWhy = msg.includes("why") || msg.includes("reason") || msg.includes("benefit") || msg.includes("advantage");
      const isCompare = msg.includes("vs") || msg.includes("compare") || msg.includes("better") || msg.includes("difference") || msg.includes("or ");
      const isAdvice = msg.includes("should") || msg.includes("recommend") || msg.includes("suggest") || msg.includes("advice") || msg.includes("tip");
      const isStep = msg.includes("step") || msg.includes("guide") || msg.includes("tutorial") || msg.includes("roadmap") || msg.includes("plan");
      const isTool = msg.includes("tool") || msg.includes("software") || msg.includes("app") || msg.includes("platform") || msg.includes("saas");
      const isMistake = msg.includes("mistake") || msg.includes("avoid") || msg.includes("wrong") || msg.includes("fail") || msg.includes("problem");
      const isCost = msg.includes("cost") || msg.includes("budget") || msg.includes("expensive") || msg.includes("cheap") || msg.includes("afford");
      const isTime = msg.includes("how long") || msg.includes("time") || msg.includes("fast") || msg.includes("quick") || msg.includes("speed");
      const isMetric = msg.includes("metric") || msg.includes("kpi") || msg.includes("measure") || msg.includes("track") || msg.includes("analytics");
      const isCustomer = msg.includes("customer") || msg.includes("client") || msg.includes("user") || msg.includes("audience") || msg.includes("target");
      const isProduct = msg.includes("product") || msg.includes("feature") || msg.includes("mvp") || msg.includes("build") || msg.includes("develop");
      const isMarket = msg.includes("market") || msg.includes("industry") || msg.includes("trend") || msg.includes("demand") || msg.includes("supply");
      const isRisk = msg.includes("risk") || msg.includes("danger") || msg.includes("threat") || msg.includes("challenge") || msg.includes("problem");
      const isIdea = msg.includes("idea") || msg.includes("suggest") || msg.includes("brainstorm") || msg.includes("creative") || msg.includes("innovative");

      let response = "";

      if (isHowTo) {
        response = `Here's how to approach "${topic}" for ${ctx}:\n\n1. Define your goal: What specific outcome do you want? Be as concrete as possible.\n\n2. Research: Spend 1-2 days looking at how others have solved this. Note what worked and what didn't.\n\n3. Create a simple plan: Break it into 3-5 steps. Start with the easiest win to build momentum.\n\n4. Start with minimum viable effort: Don't try to do everything at once. Pick ONE thing and do it well.\n\n5. Measure results: Track the key metric that tells you if it's working. Review weekly.\n\n6. Iterate: Based on results, adjust your approach. Double down on what works, cut what doesn't.\n\nThe biggest mistake people make is overthinking before starting. Action beats perfection every time.\n\nWant me to go deeper on any specific step?`;
      } else if (isWhat) {
        response = `Regarding "${topic}" for ${ctx}:\n\nThis is an important area to understand. Here are the key things to know:\n\n• Core concept: This relates to how you create, deliver, and capture value in your business.\n\n• Why it matters: Getting this right can be the difference between growth and stagnation.\n\n• Key components: It typically involves understanding your customers, your competition, and your unique strengths.\n\n• Common approaches: Most successful businesses start simple and iterate based on customer feedback.\n\n• Actionable next step: Start by talking to 5 customers. Ask them what they struggle with and what they wish existed.\n\nThe best businesses are built on deep understanding of the problem, not clever solutions.\n\nWould you like me to explain any specific aspect in more detail?`;
      } else if (isWhy) {
        response = `Why "${topic}" matters for ${ctx}:\n\n• Competitive advantage: Businesses that master this area outperform those that ignore it.\n\n• Customer value: It directly impacts how much value you deliver to customers.\n\n• Revenue impact: This can increase revenue by 20-50% when done well.\n\n• Risk reduction: Understanding this helps you avoid costly mistakes.\n\n• Long-term sustainability: It builds a foundation for sustainable growth.\n\nThe data shows that companies who invest in this area grow 2-3x faster than those who don't.\n\nStart with the basics, measure results, and gradually increase your investment as you see returns.`;
      } else if (isCompare) {
        response = `Comparing options for "${topic}" in ${ctx}:\n\nOption A: The simpler approach\n• Pros: Easier to implement, lower cost, faster to launch\n• Cons: May not scale as well, fewer features\n• Best for: Early stage, testing assumptions, limited budget\n\nOption B: The comprehensive approach\n• Pros: More complete, scales better, more professional\n• Cons: Higher cost, longer to implement, more complex\n• Best for: Established businesses, larger budgets, proven market\n\nMy recommendation: Start with Option A. You can always upgrade later once you've validated the approach and have revenue to fund the upgrade.\n\nThe key insight: The best option depends on your current stage, budget, and goals. Don't over-engineer early on.`;
      } else if (isAdvice) {
        response = `My advice on "${topic}" for ${ctx}:\n\n• Start before you're ready: Don't wait for perfect conditions. Launch with 70% of what you think you need.\n\n• Focus on one thing: Don't try to do everything at once. Pick the ONE thing that will have the biggest impact.\n\n• Talk to customers: Spend more time listening than talking. Your customers will tell you exactly what to build.\n\n• Measure what matters: Track 1-3 key metrics, not 20. The simple dashboard you actually look at beats the complex one you ignore.\n\n• Be patient: Most businesses take 2-3 years to gain real traction. Don't expect overnight success.\n\n• Stay flexible: Your first idea will probably be wrong. Be ready to pivot based on what you learn.\n\nThe number one advice: Just start. You'll learn more in 1 week of doing than in 3 months of planning.`;
      } else if (isStep) {
        response = `Step-by-step guide for "${topic}" in ${ctx}:\n\nStep 1: Foundation (Week 1)\nDefine your goal, identify your target customer, and write down your assumptions.\n\nStep 2: Research (Week 2)\nTalk to 10 potential customers. Understand their problems, what they've tried, and what they'd pay for.\n\nStep 3: Validate (Week 3)\nCreate a simple test. This could be a landing page, a mockup, or a conversation. Measure interest.\n\nStep 4: Build MVP (Week 4-6)\nBuild the simplest version that solves the core problem. Don't add extra features.\n\nStep 5: Launch (Week 7)\nGet it in front of real users. Start with a small group and gather feedback.\n\nStep 6: Iterate (Week 8+)\nBased on feedback, improve. Focus on what users actually use, not what you think they should use.\n\nTimeline: Expect 2-3 months from start to initial results. Don't rush it.`;
      } else if (isTool) {
        response = `Tools and software for "${topic}" in ${ctx}:\n\nFree/Low-cost options:\n• Google Workspace - docs, sheets, email (free-$7/user/month)\n• Notion - project management and documentation (free-$10/user/month)\n• Canva - design and marketing materials (free-$13/month)\n• Buffer/Hootsuite - social media scheduling (free-$15/month)\n\nMid-range options:\n• HubSpot - CRM and marketing ($45-$800/month)\n• Slack - team communication ($7-$13/user/month)\n• Figma - design collaboration ($12-$45/user/month)\n\nEnterprise options:\n• Salesforce - enterprise CRM ($25-$300/user/month)\n• SAP - business operations (custom pricing)\n\nMy recommendation: Start with free tools. Upgrade only when you've outgrown them. Most businesses don't need enterprise tools until they're past $1M revenue.`;
      } else if (isMistake) {
        response = `Common mistakes to avoid with "${topic}" for ${ctx}:\n\n1. Perfectionism: Spending months polishing before launching. Ship at 70% and improve based on feedback.\n\n2. Ignoring customers: Building what you think they want instead of what they actually need. Talk to them weekly.\n\n3. Scaling too early: Trying to grow before you've found product-market fit. Fix the foundation first.\n\n4. Underpricing: Most businesses charge too little. Price based on value, not costs. Test higher prices.\n\n5. Doing everything yourself: Delegate early. Your time is worth more than the cost of help.\n\n6. Ignoring numbers: Not tracking key metrics. You can't improve what you don't measure.\n\n7. Copying competitors: What works for them may not work for you. Find your unique angle.\n\nThe biggest mistake of all: Not starting. Fear of failure stops more businesses than actual failure does.`;
      } else if (isCost) {
        response = `Cost considerations for "${topic}" in ${ctx}:\n\nLow-cost approach ($0-500):\n• Use free tools and templates\n• Do it yourself with online guides\n• Start with organic marketing\n• Hire freelancers for specific tasks\n\nMedium investment ($500-5000):\n• Professional tools and software\n• Freelance help for key areas\n• Paid advertising tests\n• Basic legal and accounting\n\nHigher investment ($5000+):\n• Full-time hires\n• Professional services\n• Premium tools and platforms\n• Significant marketing budget\n\nMy advice: Start with the lowest cost approach that gets you results. Upgrade only when you've validated the approach and have revenue to support it.\n\nRule of thumb: Don't spend more than 10% of your revenue on any single initiative until you've proven it works.`;
      } else if (isTime) {
        response = `Timeline for "${topic}" in ${ctx}:\n\nQuick wins (1-7 days):\n• Simple optimizations\n• Quick tests\n• Low-hanging fruit\n\nShort-term (1-4 weeks):\n• Setting up new systems\n• Initial marketing campaigns\n• Process improvements\n\nMedium-term (1-3 months):\n• Product development\n• Team building\n• Market expansion\n\nLong-term (3-12 months):\n• Major strategic initiatives\n• Scaling operations\n• Building brand awareness\n\nKey insight: Most things take longer than expected. Add 50% to your estimated timeline.\n\nPro tip: Focus on quick wins first. They build momentum and fund longer-term projects.`;
      } else if (isMetric) {
        response = `Key metrics to track for "${topic}" in ${ctx}:\n\nFinancial metrics:\n• Revenue growth rate (target: 10-20% monthly)\n• Profit margin (target: 15-30%)\n• Cash flow (always positive)\n\nCustomer metrics:\n• Customer acquisition cost (CAC)\n• Customer lifetime value (LTV) - should be 3x CAC\n• Churn rate (target: <5% monthly)\n\nOperational metrics:\n• Conversion rate (target: 2-5%)\n• Response time (target: <1 hour)\n• Completion rate (target: >80%)\n\nStart with 3 metrics max. The ones that matter most to your current stage.\n\nReview weekly. If a metric isn't improving, that's where to focus your energy.`;
      } else if (isCustomer) {
        response = `Understanding your customers for "${topic}" in ${ctx}:\n\nWho are they?\n• Demographics: age, location, income, job title\n• Psychographics: values, interests, lifestyle, personality\n• Behavior: how they buy, what they use, where they spend time\n\nWhat do they need?\n• Jobs to be done: what are they trying to accomplish?\n• Pain points: what frustrates them?\n• Desired outcomes: what does success look like for them?\n\nHow to reach them?\n• Where do they hang out online?\n• What content do they consume?\n• Who do they trust for recommendations?\n\nAction step: Create a customer persona. Give them a name, a story, and specific needs. Reference this persona for every decision.`;
      } else if (isProduct) {
        response = `Product development for "${topic}" in ${ctx}:\n\n1. Ideation: List 10 problems your customers face. Pick the one that's most painful and most frequent.\n\n2. Validation: Before building, validate demand. Create a landing page or mockup and see if people sign up.\n\n3. MVP: Build the simplest version that solves the core problem. One feature, done well.\n\n4. Testing: Get it in front of 10-20 users. Watch them use it. Note where they struggle.\n\n5. Iteration: Fix the biggest pain points first. Add features based on user requests, not your assumptions.\n\n6. Launch: When 80% of users say they'd be "very disappointed" without your product, you're ready.\n\nTimeline: MVP in 4-8 weeks. Full product in 3-6 months. Don't try to build everything at once.`;
      } else if (isMarket) {
        response = `Market analysis for "${topic}" in ${ctx}:\n\nMarket size:\n• Total Addressable Market (TAM): Everyone who could use your product\n• Serviceable Market (SAM): People you can actually reach\n• Obtainable Market (SOM): Realistic market share in 3 years\n\nTrends to watch:\n• What's growing? What's declining?\n• What technologies are emerging?\n• What regulations are changing?\n\nCompetitive landscape:\n• Who are the main players?\n• What are their strengths and weaknesses?\n• Where are the gaps in the market?\n\nAction step: Spend 2 days researching. Read industry reports, talk to experts, and analyze competitors. Then make a plan.`;
      } else if (isRisk) {
        response = `Risks to consider for "${topic}" in ${ctx}:\n\nMarket risks:\n• Demand might be lower than expected\n• Competition could increase\n• Customer preferences might change\n\nFinancial risks:\n• Costs could exceed budget\n• Revenue might be slower than planned\n• Cash flow could become tight\n\nOperational risks:\n• Key team members might leave\n• Technology could fail\n• Supply chain could be disrupted\n\nMitigation strategies:\n• Start small and validate before scaling\n• Keep 6 months of cash reserves\n• Diversify suppliers and revenue streams\n• Build a strong team culture\n\nThe biggest risk is not taking any risk. Calculated risks with good planning are how businesses grow.`;
      } else if (isIdea) {
        response = `Creative ideas for "${topic}" in ${ctx}:\n\n1. Reverse engineering: Look at successful businesses in different industries. What can you adapt?\n\n2. Customer-led innovation: Ask your customers what they wish existed. Build that.\n\n3. Bundle & unbundle: Can you combine existing solutions into something better? Or split a complex solution into simpler parts?\n\n4. Geographic expansion: What works in one market might work in another. Research underserved regions.\n\n5. Partnership play: Partner with complementary businesses for mutual benefit.\n\n6. Content as product: Create valuable content (courses, guides, tools) that attracts your target audience.\n\n7. Community-first: Build a community around a shared interest, then create products for that community.\n\nAction step: Pick ONE idea and spend 1 week testing it. Don't overthink it.`;
      } else {
        // Truly generic: respond to whatever was asked
        response = `Great question about "${topic}" for ${ctx}.\n\nHere's my perspective:\n\n• Context matters: The right approach depends on your specific situation, resources, and goals.\n\n• Start with research: Spend 1-2 days understanding the landscape before making decisions.\n\n• Test before committing: Run a small experiment to validate your assumptions.\n\n• Focus on impact: Prioritize the 20% of efforts that create 80% of results.\n\n• Stay flexible: Be ready to adjust based on what you learn.\n\n• Get feedback: Talk to customers, peers, and mentors. Different perspectives help.\n\n• Take action: The best plan executed today beats the perfect plan executed next month.\n\nWhat specifically would you like to know more about? I can go deeper on any aspect.`;
      }
      return NextResponse.json({ response });
    }

    if (action === "creativity") {
      const result = await generateMarketingIdeas({
        planId: body.planId || "",
        type: body.type || "MARKETING",
        context: body.context || body.industry || "Technology",
        targetAudience: body.targetAudience || "",
        tone: body.tone || "professional",
        constraints: body.constraints,
        followUp: body.followUp || undefined,
      });
      return NextResponse.json(result);
    }

    if (action === "foresight") {
      const result = await generateForesight({
        industry: body.industry || "Technology",
        region: body.region || "global",
        timeframe: body.timeframe || 5,
        focusAreas: body.focusAreas || [],
      });
      return NextResponse.json(result);
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
