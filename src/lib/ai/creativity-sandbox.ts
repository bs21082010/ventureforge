import type { CreativityRequest, CreativityResult, CreativeIdea } from "@/types/ai";

const MARKETING_TEMPLATES: Record<string, CreativeIdea[]> = {
  TECHNOLOGY: [
    {
      title: "Tech Thought Leadership Campaign",
      description: "Position founders as industry experts through technical blog posts, open-source contributions, and conference talks.",
      channels: ["Blog", "GitHub", "LinkedIn", "Conference"],
      estimatedImpact: "HIGH",
      estimatedCost: "LOW",
      implementationSteps: [
        "Identify 5 core technical differentiators",
        "Create weekly technical blog series",
        "Contribute to relevant open-source projects",
        "Submit talk proposals to 3 industry conferences",
      ],
    },
    {
      title: "Developer Community Building",
      description: "Build an engaged developer community through API documentation, SDKs, hackathons, and developer newsletters.",
      channels: ["Developer Portal", "Discord", "Newsletter", "Hackathon"],
      estimatedImpact: "HIGH",
      estimatedCost: "MEDIUM",
      implementationSteps: [
        "Create comprehensive API documentation",
        "Launch developer Discord/Slack community",
        "Host quarterly virtual hackathons",
        "Publish monthly developer newsletter",
      ],
    },
  ],
  FOOD_SERVICE: [
    {
      title: "Farm-to-Table Storytelling",
      description: "Authentic storytelling about ingredient sourcing, local farmers, and sustainable practices.",
      channels: ["Instagram", "TikTok", "Local Media", "Packaging"],
      estimatedImpact: "MEDIUM",
      estimatedCost: "LOW",
      implementationSteps: [
        "Document supplier relationships with video",
        "Create behind-the-scenes content series",
        "Partner with local food influencers",
        "Design story-driven packaging",
      ],
    },
  ],
  RETAIL: [
    {
      title: "Omnichannel Experience Launch",
      description: "Seamless integration between online and offline shopping with AR try-on, in-store digital kiosks, and unified loyalty.",
      channels: ["Website", "Mobile App", "Social Commerce", "Physical Store"],
      estimatedImpact: "HIGH",
      estimatedCost: "HIGH",
      implementationSteps: [
        "Develop mobile app with AR features",
        "Implement unified inventory system",
        "Launch cross-channel loyalty program",
        "Install smart kiosks in physical locations",
      ],
    },
  ],
};

const TAGLINE_TEMPLATES: Record<string, string[]> = {
  TECHNOLOGY: [
    "Building tomorrow's solutions today",
    "Innovation that works for you",
    "Technology, simplified",
    "Empowering the future of business",
  ],
  FOOD_SERVICE: [
    "Taste the difference authenticity makes",
    "Where every meal tells a story",
    "Fresh flavors, timeless traditions",
    "Nourishing communities, one plate at a time",
  ],
  RETAIL: [
    "Curated for your lifestyle",
    "Shop different, live better",
    "Where quality meets convenience",
    "Your style, your way",
  ],
  HEALTHCARE: [
    "Healthcare that cares",
    "Innovation in every diagnosis",
    "Wellness, reimagined",
    "Your health, our mission",
  ],
};

export async function generateMarketingIdeas(
  request: CreativityRequest
): Promise<CreativityResult> {
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

function generateGenericIdeas(request: CreativityRequest): CreativeIdea[] {
  return [
    {
      title: `${request.context} Brand Awareness Campaign`,
      description: `A multi-channel campaign designed to build brand recognition for ${request.context} businesses targeting ${request.targetAudience || "broad audience"}.`,
      channels: ["Social Media", "Content Marketing", "Partnerships"],
      estimatedImpact: "MEDIUM",
      estimatedCost: "MEDIUM",
      implementationSteps: [
        "Define brand voice and visual identity",
        "Create content calendar for 3 months",
        "Identify and outreach to 10 potential partners",
        "Launch and iterate based on engagement data",
      ],
    },
    {
      title: "Customer Referral Program",
      description: "Implement a tiered referral program that rewards both referrer and new customer, creating viral growth loops.",
      channels: ["Email", "In-App", "Social"],
      estimatedImpact: "HIGH",
      estimatedCost: "LOW",
      implementationSteps: [
        "Design referral reward structure",
        "Build referral tracking system",
        "Create shareable referral assets",
        "Launch with pilot group and optimize",
      ],
    },
    {
      title: "Local Community Engagement",
      description: "Host community events, workshops, or meetups to build local brand presence and trust.",
      channels: ["Events", "Local Media", "Community"],
      estimatedImpact: "MEDIUM",
      estimatedCost: "LOW",
      implementationSteps: [
        "Identify 5 potential event venues",
        "Plan quarterly community events",
        "Partner with local organizations",
        "Document and share event highlights",
      ],
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
