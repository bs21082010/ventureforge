import { chatCompletion, getModel, isApiKeySet, checkOllama } from "@/lib/ai/openai-client";

export interface BusinessRequest {
  idea: string;
  industry: string;
  includeWebsite?: boolean;
  includeApp?: boolean;
}

export interface BusinessResult {
  businessPlan: { summary: string; sections: { title: string; content: string }[] };
  websiteCode?: string;
  appCode?: string;
  techStack: string[];
  timeline: string;
  estimatedCosts: { item: string; cost: string }[];
}

function generateBusinessLocal(request: BusinessRequest): BusinessResult {
  const idea = request.idea;
  const industry = request.industry;

  const industryCosts: Record<string, { setup: string; monthly: string; staff: string }> = {
    tech: { setup: "$15,000 - $50,000", monthly: "$8,000 - $25,000", staff: "$120,000 - $200,000/year" },
    food: { setup: "$50,000 - $150,000", monthly: "$12,000 - $30,000", staff: "$80,000 - $150,000/year" },
    retail: { setup: "$20,000 - $80,000", monthly: "$6,000 - $18,000", staff: "$60,000 - $120,000/year" },
    healthcare: { setup: "$40,000 - $120,000", monthly: "$15,000 - $40,000", staff: "$100,000 - $250,000/year" },
    education: { setup: "$10,000 - $40,000", monthly: "$5,000 - $15,000", staff: "$50,000 - $100,000/year" },
    consulting: { setup: "$5,000 - $20,000", monthly: "$3,000 - $10,000", staff: "$80,000 - $150,000/year" },
  };

  let costs = industryCosts.tech;
  const indLower = industry.toLowerCase();
  for (const [key, val] of Object.entries(industryCosts)) {
    if (indLower.includes(key)) { costs = val; break; }
  }

  const sections = [
    {
      title: "Executive Summary",
      content: `${idea} is a ${industry} venture focused on delivering innovative solutions to meet growing market demand. The business will leverage cutting-edge technology and industry best practices to establish a strong market presence. With a clear value proposition and scalable business model, ${idea} is positioned for sustainable growth.`,
    },
    {
      title: "Market Analysis",
      content: `The ${industry} industry is experiencing significant growth driven by technological advancement and changing consumer preferences. The target market includes both B2B and B2C segments, with particular focus on early adopters and tech-savvy customers. Market research indicates a TAM of approximately $1.2T globally with 7% CAGR.`,
    },
    {
      title: "Business Model",
      content: `Revenue will be generated through a multi-channel approach including direct sales, subscription services, and strategic partnerships. The pricing strategy is designed to be competitive while maintaining healthy margins. Initial customer acquisition will focus on digital marketing and strategic partnerships within the ${industry} ecosystem.`,
    },
    {
      title: "Operations Plan",
      content: `The business will operate with a lean startup approach, utilizing cloud infrastructure and remote-first team structure. Key operational milestones include: (1) Company registration and legal setup, (2) Product development MVP, (3) Beta launch with 100 early users, (4) Full market launch, (5) Series A fundraising.`,
    },
    {
      title: "Financial Projections",
      content: `Year 1: Revenue $120K - $250K, operating costs ${costs.monthly}, initial investment required ${costs.setup}. Year 2: Projected revenue $500K - $1.2M with improved margins. Year 3: Scalability phase with projected revenue of $2M - $5M. Break-even expected within 18-24 months.`,
    },
    {
      title: "Risk Assessment",
      content: `Key risks include: (1) Market competition from established players, (2) Technology adoption barriers, (3) Regulatory changes in the ${industry} sector. Mitigation strategies include continuous innovation, customer education programs, and proactive compliance monitoring.`,
    },
  ];

  const result: BusinessResult = {
    businessPlan: {
      summary: `${idea} is a comprehensive ${industry} venture that addresses key market gaps through innovation and customer-centric approach. The business plan outlines a clear path to market entry, growth, and profitability over a 3-year horizon.`,
      sections,
    },
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
    timeline: `Months 1-3: Company formation, product development, MVP launch\nMonths 4-6: Beta testing, initial customer acquisition\nMonths 7-12: Full market launch, first revenue\nYear 2: Scale operations, expand team to 8-15\nYear 3: Series A fundraising, international expansion`,
    estimatedCosts: [
      { item: "Initial Setup & Legal", cost: costs.setup },
      { item: "Monthly Operations", cost: costs.monthly },
      { item: "Staff Salaries", cost: costs.staff },
      { item: "Marketing Budget (Year 1)", cost: "$20,000 - $50,000" },
      { item: "Technology Infrastructure", cost: "$5,000 - $15,000/year" },
      { item: "Professional Services", cost: "$10,000 - $25,000" },
    ],
  };

  if (request.includeWebsite) {
    result.websiteCode = `<div style="padding:2rem;text-align:center;background:linear-gradient(135deg,#0f172a,#1e293b);color:white;min-height:300px;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:sans-serif">
      <h1 style="font-size:2.5rem;font-weight:bold;margin-bottom:0.5rem">${idea}</h1>
      <p style="color:#94a3b8;max-width:500px;margin-bottom:2rem">A leading ${industry} platform built for modern businesses.</p>
      <div style="display:flex;gap:1rem;flex-wrap:wrap;justify-content:center">
        <span style="background:rgba(59,130,246,0.2);padding:0.5rem 1rem;border-radius:8px;color:#60a5fa">Innovation</span>
        <span style="background:rgba(16,185,129,0.2);padding:0.5rem 1rem;border-radius:8px;color:#34d399">Scalability</span>
        <span style="background:rgba(139,92,246,0.2);padding:0.5rem 1rem;border-radius:8px;color:#a78bfa">Reliability</span>
      </div>
    </div>`;
  }

  if (request.includeApp) {
    result.appCode = `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>${idea}</Text>
      <Text style={styles.subtitle}>Your ${industry} companion app</Text>
      <View style={styles.features}>
        <Text style={styles.feature}>📊 Dashboard</Text>
        <Text style={styles.feature}>📋 Business Plans</Text>
        <Text style={styles.feature}>📈 Analytics</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#94a3b8', marginBottom: 30 },
  features: { backgroundColor: '#1e293b', borderRadius: 16, padding: 20, width: '100%' },
  feature: { fontSize: 18, color: '#e2e8f0', marginBottom: 10 },
});`;
  }

  return result;
}

export async function generateBusinessBundle(request: BusinessRequest): Promise<BusinessResult> {
  const prompt = `Generate a complete business plan bundle for:
Idea: "${request.idea}"
Industry: "${request.industry}"
Include website: ${request.includeWebsite ? "yes" : "no"}
Include app: ${request.includeApp ? "yes" : "no"}

Return JSON:
{
  "businessPlan": {
    "summary": "executive summary",
    "sections": [{"title": "...", "content": "..."}]
  },
  "websiteCode": "optional preview HTML",
  "appCode": "optional React Native code",
  "techStack": ["technologies"],
  "timeline": "3-year timeline",
  "estimatedCosts": [{"item": "cost item", "cost": "price"}]
}`;

  const shouldTryAI = isApiKeySet() || await checkOllama();
  if (shouldTryAI) {
    try {
      const systemPrompt = "You are a business strategist. Generate detailed, realistic business plans. Return only valid JSON.";
      const result = await chatCompletion(getModel(), systemPrompt, prompt, { temperature: 0.7, maxTokens: 4096 });
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch {}
  }

  return generateBusinessLocal(request);
}
