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
      // Template fallback for chat
      const msg = (body.message || "").toLowerCase();
      const ctx = body.businessContext || "your business";
      let response = "";
      if (msg.includes("marketing") || msg.includes("promot") || msg.includes("advertise")) {
        response = `For ${ctx}, here are some practical marketing strategies:\n\n• Social Media Campaign: Start with Instagram and LinkedIn. Post 3-5 times per week with a mix of educational and promotional content. Budget: $500-1000/month to start.\n\n• Content Marketing: Create a blog with weekly articles solving your customers' problems. This builds trust and drives organic traffic over time.\n\n• Referral Program: Offer existing customers a discount or reward for bringing in new customers. This is often the cheapest customer acquisition channel.\n\n• Local Partnerships: Partner with complementary businesses for cross-promotions. Share audiences without sharing costs.\n\n• Email Marketing: Build an email list from day one. Send weekly value-packed newsletters with occasional promotional offers.\n\nWould you like me to go deeper into any of these strategies?`;
      } else if (msg.includes("pric") || msg.includes("revenue") || msg.includes("monetiz") || msg.includes("profit")) {
        response = `Here's a practical pricing framework for ${ctx}:\n\n• Cost-Plus Pricing: Calculate your costs, add your desired margin (typically 20-50%). Simple but may not reflect market value.\n\n• Value-Based Pricing: Price based on the value to the customer, not your costs. Research what competitors charge and what customers are willing to pay.\n\n• Tiered Pricing: Offer 3 tiers (Basic, Pro, Enterprise). Most customers pick the middle one - this is called the "anchor effect."\n\n• Freemium Model: Offer a free basic tier to attract users, then convert to paid with premium features. Works well for SaaS and digital products.\n\n• Subscription Model: Recurring revenue is more predictable. Offer monthly/annual plans with a discount for annual commitment.\n\nQuick tip: Start with 2-3 price points and A/B test to find what converts best. Don't be afraid to raise prices - most businesses undercharge.`;
      } else if (msg.includes("compet") || msg.includes("rival") || msg.includes("different")) {
        response = `To stand out from competitors for ${ctx}:\n\n• Find Your Niche: Don't try to be everything to everyone. Focus on a specific segment where you can be the best.\n\n• Unique Value Proposition (UVP): Clearly state what makes you different. Example: "We're the only [product] that [specific benefit] for [specific audience]."\n\n• Customer Experience: Compete on experience, not just price. Faster support, better onboarding, more personal touch.\n\n• Content & Thought Leadership: Share your expertise publicly. Blog, podcast, speak at events. Become the go-to expert in your space.\n\n• Speed & Innovation: Move faster than competitors. Ship features quicker, respond to market changes faster.\n\n• Community Building: Build a community around your brand. Loyal communities are harder to compete with than features.\n\nAction step: List your top 3 competitors, read their worst reviews, and build marketing that highlights how you solve those exact problems.`;
      } else if (msg.includes("team") || msg.includes("hire") || msg.includes("employee") || msg.includes("culture")) {
        response = `Building a strong team for ${ctx}:\n\n• First 5 Hires Matter Most: Focus on versatile people who can wear multiple hats. Generalists first, specialists later.\n\n• Culture Is What You Do, Not What You Say: Define your values through actions. If you say "work-life balance," don't send emails at midnight.\n\n• Hire Slow, Fire Fast: Take your time hiring (3-4 interview rounds). If someone isn't working out, address it quickly - one bad hire can toxicify a team.\n\n• Compensation Strategy: You can't always compete on salary. Offer equity, flexibility, growth opportunities, and meaningful work.\n\n• Remote-First Culture: If possible, hire remotely. You get access to global talent and reduce office costs.\n\n• Feedback Loops: Implement weekly 1-on-1s, quarterly reviews, and anonymous feedback channels. People leave managers, not companies.`;
      } else if (msg.includes("fund") || msg.includes("invest") || msg.includes("raise") || msg.includes("vc") || msg.includes("bootstr")) {
        response = `Funding options for ${ctx}:\n\n• Bootstrapping: Self-fund from revenue or savings. You keep 100% control but grow slower. Best for businesses that can generate revenue quickly.\n\n• Friends & Family: Raise from your network. Typical range: $10K-$150K. Always formalize with legal documents - don't ruin relationships over handshake deals.\n\n• Angel Investors: Individual investors who invest $25K-$500K. Find them at pitch events, AngelList, or through warm introductions.\n\n• Venture Capital: For high-growth startups. VCs invest $500K-$50M+ but want 10x+ returns. Only pursue VC if you can build a $100M+ business.\n\n• Revenue-Based Financing: Borrow against future revenue. No equity dilution. Good for businesses with predictable recurring revenue.\n\n• Grants & Competitions: Non-dilutive funding. Check government grants, startup competitions, and accelerator programs.\n\nRecommendation: Start with bootstrapping or friends & family. Only raise VC if you need it for hyper-growth.`;
      } else if (msg.includes("legal") || msg.includes("compliance") || msg.includes("register") || msg.includes("license")) {
        response = `Legal essentials for ${ctx}:\n\n• Business Structure: Choose wisely - LLC (flexibility), C-Corp (for VC funding), S-Corp (tax benefits). Most startups go C-Corp if planning to raise VC.\n\n• Register Your Business: File with your state/country. Get an EIN (US) or equivalent. Open a business bank account.\n\n• Intellectual Property: File trademarks for your brand name and logo. Consider patents for unique technology. Protect trade secrets with NDAs.\n\n• Contracts & Agreements: Always use written contracts. Key documents: operating agreement, customer contracts, employee agreements, vendor contracts.\n\n• Data Privacy: Comply with GDPR, CCPA, and other privacy laws. Have a privacy policy, get consent for data collection, and implement security measures.\n\n• Insurance: Get general liability, professional liability (E&O), and cyber liability insurance. Don't skip this - one lawsuit can sink a business.`;
      } else if (msg.includes("scale") || msg.includes("grow") || msg.includes("expand")) {
        response = `Scaling ${ctx} strategically:\n\n• Fix Before You Scale: Don't pour fuel on a leaky bucket. Ensure unit economics work, customer acquisition is predictable, and operations are efficient.\n\n• Automate Everything: Use tools like Zapier, HubSpot, or custom scripts to automate repetitive tasks. Free up your time for high-leverage work.\n\n• Geographic Expansion: Expand to 1-2 new markets at a time. Adapt messaging for local audiences. Test with small budgets before committing.\n\n• Product Line Extensions: Add complementary products/services to existing customers. It's 5x cheaper to sell to existing customers than acquire new ones.\n\n• Strategic Partnerships: Partner with larger companies for distribution. They have the customers; you have the product.\n\n• Hire Ahead of Growth: Hire key roles 2-3 months before you desperately need them. Good talent takes time to find and onboard.`;
      } else {
        response = `Great question about ${ctx}! Here's my take:\n\n• Start with clarity: Define exactly what success looks like for this initiative. What metrics will tell you it's working?\n\n• Research first: Spend 2-3 days researching before acting. Look at what competitors have tried, what worked, and what didn't.\n\n• Start small: Run a small experiment before committing fully. Test with 10-20% of your resources to validate the approach.\n\n• Measure everything: Set up tracking from day one. You can't improve what you don't measure.\n\n• Iterate fast: Review results weekly. Double down on what works, cut what doesn't. Speed of iteration beats perfection.\n\n• Get feedback: Talk to 5-10 customers or peers about this. Their perspectives will surprise you and improve your approach.\n\nWould you like me to go deeper on any specific aspect? I can provide more detailed strategies, tactics, or examples.`;
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
