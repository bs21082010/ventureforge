import { getModel, chatCompletion, isApiKeySet, checkOllama } from "@/lib/ai/openai-client";
import type { CreativityRequest, CreativityResult, CreativeIdea } from "@/types/ai";

const TYPE_PROMPTS: Record<string, { system: string; user: string }> = {
  MARKETING: {
    system: `You are a growth hacker and digital marketing strategist. Generate aggressive, data-driven marketing campaigns. Focus on customer acquisition, viral loops, paid ads strategy, SEO, content marketing funnels, and conversion optimization. Return ONLY valid JSON:
{"ideas":[{"title":"string","description":"detailed marketing strategy with specific tactics and channels","channels":["specific channel1","specific channel2"],"estimatedImpact":"LOW"|"MEDIUM"|"HIGH","estimatedCost":"LOW"|"MEDIUM"|"HIGH","implementationSteps":["step1","step2","step3","step4"]}],"taglines":["marketing tagline1","tagline2","tagline3","tagline4"],"visualSuggestions":["visual direction 1","visual 2","visual 3"],"nameSuggestions":["campaign name 1","name 2","name 3","name 4","name 5","name 6"]}`,
    user: (ctx: string, aud: string, tone: string) => `Create 6-8 aggressive marketing campaign strategies for: ${ctx}\nTarget: ${aud || "general audience"}\nTone: ${tone || "bold and compelling"}\n\nEach idea must be a COMPLETELY DIFFERENT marketing strategy (e.g. one viral social campaign, one SEO strategy, one influencer partnership, one referral program, one email funnel, one paid ads strategy). Do NOT just change names - each must be a genuinely different approach.`,
  },
  BRANDING: {
    system: `You are a brand strategist and visual identity expert. Generate brand identity concepts including brand positioning, visual identity systems, brand voice guidelines, and brand storytelling frameworks. Return ONLY valid JSON:
{"ideas":[{"title":"string","description":"detailed brand identity concept with positioning, colors, typography, voice","channels":["Brand Touchpoint 1","Touchpoint 2"],"estimatedImpact":"LOW"|"MEDIUM"|"HIGH","estimatedCost":"LOW"|"MEDIUM"|"HIGH","implementationSteps":["step1","step2","step3","step4"]}],"taglines":["brand tagline 1","tagline2","tagline3","tagline4"],"visualSuggestions":["visual identity direction 1","visual 2","visual 3"],"nameSuggestions":["brand name 1","name 2","name 3","name 4","name 5","name 6"]}`,
    user: (ctx: string, aud: string, tone: string) => `Create 6-8 brand identity concepts for: ${ctx}\nTarget audience: ${aud || "general market"}\nDesired tone: ${tone || "modern and trustworthy"}\n\nEach concept must cover a DIFFERENT branding angle: brand positioning statement, visual identity (colors/fonts/mood), brand voice personality, brand story/narrative, brand archetype, and brand experience design. Each must be genuinely different.`,
  },
  CUSTOMER_ENGAGEMENT: {
    system: `You are a customer experience designer and community builder. Generate customer engagement strategies focused on retention, loyalty, community building, gamification, and emotional connection. Return ONLY valid JSON:
{"ideas":[{"title":"string","description":"detailed engagement strategy with specific mechanics and touchpoints","channels":["Engagement Channel 1","Channel 2"],"estimatedImpact":"LOW"|"MEDIUM"|"HIGH","estimatedCost":"LOW"|"MEDIUM"|"HIGH","implementationSteps":["step1","step2","step3","step4"]}],"taglines":["engagement tagline 1","tagline2","tagline3","tagline4"],"visualSuggestions":["engagement visual 1","visual 2","visual 3"],"nameSuggestions":["program name 1","name 2","name 3","name 4","name 5","name 6"]}`,
    user: (ctx: string, aud: string, tone: string) => `Create 6-8 customer engagement strategies for: ${ctx}\nTarget: ${aud || "existing customers"}\nTone: ${tone || "warm and personal"}\n\nEach strategy must be a DIFFERENT engagement mechanic: loyalty program, gamification system, community platform, personalized journey, surprise & delight, user-generated content campaign, VIP tier system, and feedback loop. Each must be genuinely different.`,
  },
  CONTENT: {
    system: `You are a content strategist and storyteller. Generate content marketing strategies including blog series, video concepts, podcast ideas, social media content calendars, and thought leadership pieces. Return ONLY valid JSON:
{"ideas":[{"title":"string","description":"detailed content strategy with format, topics, publishing cadence","channels":["Content Platform 1","Platform 2"],"estimatedImpact":"LOW"|"MEDIUM"|"HIGH","estimatedCost":"LOW"|"MEDIUM"|"HIGH","implementationSteps":["step1","step2","step3","step4"]}],"taglines":["content tagline 1","tagline2","tagline3","tagline4"],"visualSuggestions":["content visual 1","visual 2","visual 3"],"nameSuggestions":["series name 1","name 2","name 3","name 4","name 5","name 6"]}`,
    user: (ctx: string, aud: string, tone: string) => `Create 6-8 content marketing strategies for: ${ctx}\nAudience: ${aud || "target market"}\nTone: ${tone || "informative and engaging"}\n\nEach strategy must be a DIFFERENT content format: long-form blog series, short-form video series, podcast format, infographic campaign, email newsletter series, social media challenge, webinar series, and user-generated content campaign. Each must be genuinely different.`,
  },
  NAMING: {
    system: `You are a naming expert and brand linguist. Generate business/product names with domain availability considerations, memorability scoring, and naming rationale. Return ONLY valid JSON:
{"ideas":[{"title":"string","description":"naming rationale including meaning, origin, memorability factors, domain considerations","channels":["Naming Convention 1","Convention 2"],"estimatedImpact":"LOW"|"MEDIUM"|"HIGH","estimatedCost":"LOW"|"MEDIUM"|"HIGH","implementationSteps":["step1","step2","step3","step4"]}],"taglines":["slogan 1","slogan2","slogan3","slogan4"],"visualSuggestions":["logo direction 1","visual 2","visual 3"],"nameSuggestions":["name option 1","name 2","name 3","name 4","name 5","name 6"]}`,
    user: (ctx: string, aud: string, tone: string) => `Create 6-8 naming concepts for: ${ctx}\nTarget: ${aud || "global market"}\nTone: ${tone || "modern and memorable"}\n\nEach naming concept must use a DIFFERENT naming technique: portmanteau (blend words), compound word, metaphorical name, invented word, acronym, experiential name, founder name, and descriptive-modifier combination. Each must be genuinely different.`,
  },
};

export async function generateMarketingIdeas(
  request: CreativityRequest
): Promise<CreativityResult> {
  const hasAI = isApiKeySet() || await checkOllama();

  if (hasAI) {
    try {
      const model = getModel();
      const typeConfig = TYPE_PROMPTS[request.type] || TYPE_PROMPTS.MARKETING;

      const systemPrompt = typeConfig.system;
      let userPrompt: string;

      if (request.followUp) {
        // Follow-up: clean, focused prompt
        userPrompt = `Business: ${request.context}\nType: ${request.type.replace(/_/g, " ")}\nTarget: ${request.targetAudience || "general audience"}\n\nThe user asks: ${request.followUp}\n\nGive 3-4 SHORT, SPECIFIC ideas answering this exact question. Each idea: 2-3 sentences max. Return JSON only.`;
      } else {
        userPrompt = typeConfig.user(
          request.context,
          request.targetAudience || "",
          request.tone || "professional"
        );
      }

      const result = await chatCompletion(model, systemPrompt, userPrompt, {
        temperature: 0.85,
        maxTokens: 4096,
      });

      const jsonMatch = result.match(/```json\s*([\s\S]*?)```/) || result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0].replace(/```json\s*/g, "").replace(/```/g, "").trim());
        if (parsed.ideas && Array.isArray(parsed.ideas)) {
          return {
            ideas: parsed.ideas.map((idea: any) => ({
              title: idea.title || "Untitled Idea",
              description: idea.description || "",
              channels: idea.channels || ["Social Media"],
              estimatedImpact: idea.estimatedImpact || "MEDIUM",
              estimatedCost: idea.estimatedCost || "MEDIUM",
              implementationSteps: idea.implementationSteps || [],
            })),
            taglines: parsed.taglines || [],
            visualSuggestions: parsed.visualSuggestions || [],
            nameSuggestions: parsed.nameSuggestions || [],
          };
        }
      }
    } catch (err) {
      console.error("AI creativity generation failed, using templates:", err);
    }
  }

  // Fallback to templates
  const industryKey = request.context.toUpperCase().replace(/\s+/g, "_");
  const ideas = MARKETING_TEMPLATES[industryKey] || generateGenericIdeas(request);
  const taglines = TAGLINE_TEMPLATES[industryKey] || generateGenericTaglines(request);

  return {
    ideas,
    taglines,
    visualSuggestions: generateVisualSuggestions(request),
    nameSuggestions: generateNameSuggestions(request),
  };
}

const MARKETING_TEMPLATES: Record<string, CreativeIdea[]> = {
  TECHNOLOGY: [
    {
      title: "Tech Thought Leadership Campaign",
      description: "Position founders as industry experts through technical blog posts, open-source contributions, and conference talks.",
      channels: ["Blog", "GitHub", "LinkedIn", "Conference"],
      estimatedImpact: "HIGH",
      estimatedCost: "LOW",
      implementationSteps: ["Identify 5 core technical differentiators", "Create weekly technical blog series", "Contribute to relevant open-source projects", "Submit talk proposals to 3 industry conferences"],
    },
    {
      title: "Developer Community Building",
      description: "Build an engaged developer community through API documentation, SDKs, hackathons, and developer newsletters.",
      channels: ["Developer Portal", "Discord", "Newsletter", "Hackathon"],
      estimatedImpact: "HIGH",
      estimatedCost: "MEDIUM",
      implementationSteps: ["Create comprehensive API documentation", "Launch developer Discord/Slack community", "Host quarterly virtual hackathons", "Publish monthly developer newsletter"],
    },
  ],
  FOOD_SERVICE: [
    {
      title: "Farm-to-Table Storytelling",
      description: "Authentic storytelling about ingredient sourcing, local farmers, and sustainable practices.",
      channels: ["Instagram", "TikTok", "Local Media", "Packaging"],
      estimatedImpact: "MEDIUM",
      estimatedCost: "LOW",
      implementationSteps: ["Document supplier relationships with video", "Create behind-the-scenes content series", "Partner with local food influencers", "Design story-driven packaging"],
    },
  ],
  RETAIL: [
    {
      title: "Omnichannel Experience Launch",
      description: "Seamless integration between online and offline shopping with AR try-on, in-store digital kiosks, and unified loyalty.",
      channels: ["Website", "Mobile App", "Social Commerce", "Physical Store"],
      estimatedImpact: "HIGH",
      estimatedCost: "HIGH",
      implementationSteps: ["Develop mobile app with AR features", "Implement unified inventory system", "Launch cross-channel loyalty program", "Install smart kiosks in physical locations"],
    },
  ],
};

const TAGLINE_TEMPLATES: Record<string, string[]> = {
  TECHNOLOGY: ["Building tomorrow's solutions today", "Innovation that works for you", "Technology, simplified", "Empowering the future of business"],
  FOOD_SERVICE: ["Taste the difference authenticity makes", "Where every meal tells a story", "Fresh flavors, timeless traditions", "Nourishing communities, one plate at a time"],
  RETAIL: ["Curated for your lifestyle", "Shop different, live better", "Where quality meets convenience", "Your style, your way"],
  HEALTHCARE: ["Healthcare that cares", "Innovation in every diagnosis", "Wellness, reimagined", "Your health, our mission"],
};

function generateGenericIdeas(request: CreativityRequest): CreativeIdea[] {
  return [
    {
      title: `${request.context} Brand Awareness Campaign`,
      description: `A multi-channel campaign designed to build brand recognition for ${request.context} businesses targeting ${request.targetAudience || "broad audience"}.`,
      channels: ["Social Media", "Content Marketing", "Partnerships"],
      estimatedImpact: "MEDIUM",
      estimatedCost: "MEDIUM",
      implementationSteps: ["Define brand voice and visual identity", "Create content calendar for 3 months", "Identify and outreach to 10 potential partners", "Launch and iterate based on engagement data"],
    },
    {
      title: "Customer Referral Program",
      description: "Implement a tiered referral program that rewards both referrer and new customer, creating viral growth loops.",
      channels: ["Email", "In-App", "Social"],
      estimatedImpact: "HIGH",
      estimatedCost: "LOW",
      implementationSteps: ["Design referral reward structure", "Build referral tracking system", "Create shareable referral assets", "Launch with pilot group and optimize"],
    },
    {
      title: "Local Community Engagement",
      description: "Host community events, workshops, or meetups to build local brand presence and trust.",
      channels: ["Events", "Local Media", "Community"],
      estimatedImpact: "MEDIUM",
      estimatedCost: "LOW",
      implementationSteps: ["Identify 5 potential event venues", "Plan quarterly community events", "Partner with local organizations", "Document and share event highlights"],
    },
  ];
}

function generateGenericTaglines(request: CreativityRequest): string[] {
  return [
    `Innovation starts with ${request.context}`,
    `Building something extraordinary`,
    `Where vision meets execution`,
    `The future of ${request.context}`,
  ];
}

function generateVisualSuggestions(request: CreativityRequest): string[] {
  return [
    "Use clean, modern design with ample white space",
    "Incorporate gradient backgrounds with brand colors",
    "Use custom illustrations over stock photos",
    "Include data visualizations to showcase impact",
    "Design for mobile-first experience",
  ];
}

function generateNameSuggestions(request: CreativityRequest): string[] {
  const contextWords = request.context.split(/\s+/);
  const prefixes = ["Neo", "Swift", "Core", "Pulse", "Wave", "Apex", "Flux", "Nova"];
  const suffixes = ["Hub", "Lab", "Forge", "Works", "Studio", "Co", "AI", "X"];

  const suggestions: string[] = [];
  for (const prefix of prefixes.slice(0, 3)) {
    for (const suffix of suffixes.slice(0, 2)) {
      suggestions.push(`${prefix}${suffix}`);
    }
  }
  if (contextWords.length > 0) {
    suggestions.push(`${contextWords[0]}Hub`);
    suggestions.push(`${contextWords[0]}Lab`);
  }

  return suggestions;
}
