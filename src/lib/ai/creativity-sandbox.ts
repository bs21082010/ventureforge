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

  if (request.followUp) {
    return generateDynamicFollowUp(request);
  }

  return generateContextAwareInitial(request);
}

// ==================== INITIAL GENERATION ====================

function detectIndustry(context: string): string[] {
  const lower = context.toLowerCase();
  const tags: string[] = [];

  const keywordMap: Record<string, string[]> = {
    tech: ["software", "app", "saas", "platform", "digital", "ai", "data", "cloud", "api", "dev", "code", "web", "mobile", "blockchain", "crypto"],
    food: ["food", "restaurant", "cafe", "coffee", "tea", "bakery", "meal", "cuisine", "dish", "cook", "chef", "pizza", "burger", "sushi", "organic", "recipe"],
    health: ["health", "medical", "fitness", "wellness", "gym", "yoga", "therapy", "clinic", "hospital", "pharma", "mental", "nutrition", "diet", "supplement"],
    retail: ["shop", "store", "ecommerce", "fashion", "clothing", "beauty", "cosmetic", "jewelry", "shoe", "accessories", "boutique", "marketplace"],
    edu: ["education", "learning", "course", "tutor", "school", "training", "skill", "academy", "student", "teacher", "class", "degree", "certification"],
    finance: ["finance", "banking", "invest", "trading", "insurance", "loan", "credit", "payment", "fintech", "wealth", "crypto", "defi"],
    realestate: ["real estate", "property", "housing", "apartment", "rent", "mortgage", "construction", "interior", "land"],
    travel: ["travel", "tourism", "hotel", "booking", "flight", "vacation", "adventure", "hostel", "resort", "airbnb"],
    agriculture: ["farm", "agriculture", "crop", "livestock", "dairy", "organic", "fertilizer", "harvest", "greenhouse", "horticulture"],
    energy: ["energy", "solar", "wind", "renewable", "battery", "grid", "power", "electricity", "hydrogen", "nuclear"],
    logistics: ["logistics", "shipping", "delivery", "warehouse", "supply chain", "freight", "courier", "fleet", "transport"],
    media: ["media", "entertainment", "music", "video", "podcast", "streaming", "gaming", "esports", "content creator", "influencer"],
    manufacturing: ["manufacturing", "factory", "production", "assembly", "industrial", "machine", "automation", "3d printing"],
    consulting: ["consulting", "advisory", "professional services", "agency", "freelance", "contractor"],
    legal: ["legal", "law", "attorney", "litigation", "compliance", "regulatory"],
    sports: ["sports", "fitness", "gym", "athletic", "wellness", "coaching", "training"],
    telecom: ["telecom", "isp", "broadband", "5g", "network", "connectivity"],
    automotive: ["automotive", "car", "vehicle", "ev", "electric", "dealer", "garage"],
    aerospace: ["aerospace", "aviation", "drone", "satellite", "space", "defense"],
    mining: ["mining", "mineral", "ore", "extraction", "quarry", "metals"],
    insurance: ["insurance", "underwriting", "claim", "actuarial", "coverage"],
    water: ["water", "utility", "waste", "sewage", "desalination"],
    pharma: ["pharmaceutical", "drug", "biotech", "clinical trial", "medical device"],
    hospitality: ["hospitality", "hotel", "restaurant", "bar", "event", "catering"],
    sportsfit: ["sports", "gym", "fitness", "yoga", "personal training", "athlete"],
  };

  for (const [tag, keywords] of Object.entries(keywordMap)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      tags.push(tag);
    }
  }

  if (tags.length === 0) tags.push("general");
  return tags;
}

function generateContextAwareInitial(request: CreativityRequest): CreativityResult {
  const industries = detectIndustry(request.context);
  const ctx = request.context;
  const type = request.type;

  const ideaBank: CreativeIdea[] = [];
  const taglineBank: string[] = [];
  const visualBank: string[] = [];
  const nameBank: string[] = [];

  if (industries.includes("tech")) {
    ideaBank.push(
      { title: "Open Source Community Strategy", description: `Release a core component of ${ctx} as open-source. Build developer community through documentation, tutorials, and GitHub presence. Monetize through premium features and enterprise support.`, channels: ["GitHub", "Dev.to", "Discord", "HackerNews"], estimatedImpact: "HIGH", estimatedCost: "LOW", implementationSteps: ["Identify open-sourceable component", "Write comprehensive docs", "Launch on Product Hunt", "Build Discord community", "Create premium tier"] },
      { title: "Technical Content SEO", description: `Create deep-dive technical articles ranking for long-tail keywords. Focus on developer pain points that ${ctx} solves. Build topical authority through 50+ articles over 6 months.`, channels: ["Blog", "Medium", "Dev.to", "Google"], estimatedImpact: "HIGH", estimatedCost: "LOW", implementationSteps: ["Research 50 long-tail keywords", "Create technical writing calendar", "Publish 2 articles per week", "Build backlinks through guest posts", "Track rankings weekly"] },
      { title: "API-First Partnership Program", description: `Build public APIs that let other companies integrate ${ctx}. Create partner portal with documentation, SDKs, and revenue sharing.`, channels: ["API Portal", "Partner Program", "Developer Relations"], estimatedImpact: "HIGH", estimatedCost: "MEDIUM", implementationSteps: ["Design public API", "Build developer portal", "Create partner onboarding", "Launch revenue sharing", "Host partner hackathons"] },
      { title: "Product Hunt Launch Campaign", description: `Orchestrate a Product Hunt launch with 30 days of pre-launch buzz. Coordinate hunters, makers, and community to hit #1 Product of the Day.`, channels: ["Product Hunt", "Twitter", "LinkedIn", "Email"], estimatedImpact: "MEDIUM", estimatedCost: "LOW", implementationSteps: ["Build pre-launch email list", "Create launch assets", "Recruit 100+ upvoters", "Schedule launch for Tuesday", "Follow up with all supporters"] },
      { title: "Developer Conference Sponsorship", description: `Sponsor 3-5 key developer conferences. Host workshops, give talks, and run booths that demonstrate ${ctx} in action.`, channels: ["Conferences", "Workshops", "Booth", "Talks"], estimatedImpact: "MEDIUM", estimatedCost: "HIGH", implementationSteps: ["Identify top 5 conferences", "Submit talk proposals", "Design booth experience", "Create workshop curriculum", "Follow up with attendees"] },
      { title: "SaaS Freemium Conversion Funnel", description: `Design a freemium experience that naturally leads to paid conversion. Use usage limits, feature gates, and in-app prompts to drive upgrades.`, channels: ["Product", "Email", "In-App", "Sales"], estimatedImpact: "HIGH", estimatedCost: "LOW", implementationSteps: ["Define free vs paid features", "Build onboarding flow", "Add usage dashboards", "Create upgrade nudges", "A/B test conversion points"] },
    );
    taglineBank.push("Build faster, ship smarter", "Developer-first, always", "Code meets strategy", "The API for modern teams", "Ship it. Scale it. Love it.", "Built by devs, for devs");
    visualBank.push("Dark theme with neon accents and code snippets", "Terminal-style UI elements with monospace fonts", "Minimalist with geometric patterns", "Gradient backgrounds inspired by popular code editors");
    nameBank.push("CodeForge", "DevPulse", "ShipFast", "APIHub", "BuildStack", "ByteCraft", "NexusDev", "SprintLabs", "DeployHQ", "SynthAPI");
  }

  if (industries.includes("food")) {
    ideaBank.push(
      { title: "Farm-to-Table Storytelling Series", description: `Create weekly video content showing ${ctx}'s ingredient sourcing journey. Feature local farmers, seasonal produce, and behind-the-scenes kitchen action.`, channels: ["Instagram Reels", "TikTok", "YouTube", "Packaging"], estimatedImpact: "MEDIUM", estimatedCost: "LOW", implementationSteps: ["Identify 5 key suppliers", "Schedule monthly farm visits", "Film 3 videos per visit", "Post 5x per week", "Feature on packaging"] },
      { title: "Seasonal Menu Experience", description: `Launch rotating seasonal menus that create urgency and repeat visits. Each season tells a story through ingredients, plating, and ambiance.`, channels: ["In-Store", "Social Media", "Email", "Local Press"], estimatedImpact: "HIGH", estimatedCost: "MEDIUM", implementationSteps: ["Source seasonal ingredients", "Design 4 themed menus", "Create launch events", "Partner with food bloggers", "Document each season"] },
      { title: "Food Photography Contest", description: `Launch a UGC campaign where customers share their best ${ctx} photos. Winners get featured on the menu and win free meals for a year.`, channels: ["Instagram", "TikTok", "In-Store", "Website"], estimatedImpact: "MEDIUM", estimatedCost: "LOW", implementationSteps: ["Create branded hashtag", "Design contest rules", "Partner with food influencers", "Feature winners weekly", "Announce grand prize winner"] },
      { title: "Local Influencer Tasting Events", description: `Host exclusive monthly tasting events for local food influencers. Let them experience new dishes before anyone else and share their honest reviews.`, channels: ["Instagram", "YouTube", "Blog", "Local Media"], estimatedImpact: "MEDIUM", estimatedCost: "LOW", implementationSteps: ["Identify 20 local food influencers", "Create monthly tasting menu", "Host intimate events", "Provide content kit", "Track mentions and engagement"] },
      { title: "Corporate Catering Outreach", description: `Target local businesses for weekly lunch catering. Offer corporate packages with rotating menus and dedicated account management.`, channels: ["LinkedIn", "Email", "Local Business Network", "Direct Sales"], estimatedImpact: "HIGH", estimatedCost: "MEDIUM", implementationSteps: ["Build prospect list of 100 companies", "Create corporate menu packages", "Send personalized outreach", "Offer free trial lunch", "Set up recurring orders"] },
      { title: "Recipe Box Subscription", description: `Launch a meal kit subscription featuring ${ctx}'s signature recipes. Customers get pre-portioned ingredients and step-by-step instructions.`, channels: ["Website", "Instagram", "Email", "Local Delivery"], estimatedImpact: "HIGH", estimatedCost: "HIGH", implementationSteps: ["Develop 12 signature recipes", "Design packaging", "Set up delivery logistics", "Launch with 50 subscribers", "Scale to 500 in 6 months"] },
    );
    taglineBank.push("Fresh ingredients, bold flavors", "Where every meal tells a story", "Cook with heart, eat with joy", "From our kitchen to your table", "Taste the local difference", "Seasonal. Sustainable. Delicious.");
    visualBank.push("Warm, earthy tones with natural textures", "Fresh produce photography with rustic backgrounds", "Hand-drawn illustrations of ingredients", "Clean white plates with colorful food styling");
    nameBank.push("FreshPlate", "HarvestTable", "GreenFork", "CooksCraft", "TasteTrail", "PantryPride", "SeasonBite", "FarmFreshCo", "KitchCraft", "MouthfulMakers");
  }

  if (industries.includes("health")) {
    ideaBank.push(
      { title: "Wellness Challenge Campaign", description: `Launch a 30-day wellness challenge with daily prompts, progress tracking, and community support. Participants share their journey on social media.`, channels: ["Mobile App", "Instagram", "Email", "Community"], estimatedImpact: "HIGH", estimatedCost: "LOW", implementationSteps: ["Design 30-day curriculum", "Build tracking feature", "Create community group", "Partner with wellness influencers", "Offer prizes for completion"] },
      { title: "Health Education Content Series", description: `Create weekly educational content debunking health myths and providing evidence-based advice. Position ${ctx} as the trusted authority.`, channels: ["Blog", "YouTube", "Podcast", "Social Media"], estimatedImpact: "MEDIUM", estimatedCost: "LOW", implementationSteps: ["Research top 50 health myths", "Create content calendar", "Produce weekly videos", "Launch podcast series", "Build email list"] },
      { title: "Corporate Wellness Partnerships", description: `Partner with companies to offer ${ctx} as part of their employee wellness program. Provide group rates and dedicated account management.`, channels: ["LinkedIn", "HR Networks", "Direct Sales", "Events"], estimatedImpact: "HIGH", cost: "MEDIUM", estimatedCost: "MEDIUM", implementationSteps: ["Create corporate packages", "Build HR relationships", "Present at wellness conferences", "Offer pilot programs", "Track employee outcomes"] },
      { title: "Patient Success Story Campaign", description: `Feature real patient success stories (with consent) across all channels. Authentic testimonials build trust and emotional connection.`, channels: ["Website", "Social Media", "Email", "In-Store"], estimatedImpact: "HIGH", estimatedCost: "LOW", implementationSteps: ["Collect patient stories", "Create video testimonials", "Design social media templates", "Build case study library", "Share across all touchpoints"] },
      { title: "Community Health Workshops", description: `Host free monthly health workshops in your community. Topics include nutrition, stress management, sleep optimization, and preventive care.`, channels: ["Events", "Local Media", "Community Centers", "Social"], estimatedImpact: "MEDIUM", estimatedCost: "LOW", implementationSteps: ["Partner with community centers", "Design 12 workshop topics", "Create educational materials", "Promote through local channels", "Collect attendee feedback"] },
      { title: "Wearable Integration Partnership", description: `Integrate with Apple Health, Fitbit, and Garmin to pull user data and provide personalized health insights. Create a data-driven wellness experience.`, channels: ["App", "Wearables", "Email", "Dashboard"], estimatedImpact: "HIGH", estimatedCost: "MEDIUM", implementationSteps: ["Integrate with 3 wearable APIs", "Build data dashboard", "Create personalized insights", "Launch with early adopters", "Iterate based on user feedback"] },
    );
    taglineBank.push("Your health, our mission", "Wellness reimagined", "Care that connects", "Live better, live longer", "Health with heart", "Science meets self-care");
    visualBank.push("Calming blues and greens with clean medical aesthetics", "Soft gradients with health icons", "Natural imagery with modern typography", "Minimalist with human warmth");
    nameBank.push("VitalCare", "WellSync", "HealthPulse", "CareLink", "MediMind", "ThriveWell", "PureHealth", "NexaCare", "BodyBalance", "WellnessWorks");
  }

  if (industries.includes("edu")) {
    ideaBank.push(
      { title: "Free Masterclass Series", description: `Offer a free 5-part masterclass that showcases ${ctx}'s teaching quality. Each session provides genuine value while demonstrating why paid courses are worth it.`, channels: ["Zoom", "YouTube", "Email", "Social Media"], estimatedImpact: "HIGH", estimatedCost: "LOW", implementationSteps: ["Design 5-episode curriculum", "Set up Zoom and recording", "Promote through social media", "Collect registrations via email", "Convert 20% to paid courses"] },
      { title: "Student Success Stories", description: `Feature student transformation stories across all channels. Show before/after outcomes, career changes, and skill achievements.`, channels: ["Website", "Instagram", "LinkedIn", "Email"], estimatedImpact: "HIGH", estimatedCost: "LOW", implementationSteps: ["Collect 20 student stories", "Create video testimonials", "Design case study graphics", "Build social proof library", "Share weekly"] },
      { title: "Corporate Training Packages", description: `Package ${ctx}'s courses for enterprise training. Offer group discounts, progress tracking, and customized learning paths.`, channels: ["LinkedIn", "Direct Sales", "HR Networks", "Events"], estimatedImpact: "HIGH", estimatedCost: "MEDIUM", implementationSteps: ["Create enterprise curriculum", "Build LMS integration", "Design corporate pricing", "Target 50 companies", "Offer pilot programs"] },
      { title: "Scholarship Program Launch", description: `Launch a scholarship program for underrepresented students. Builds brand goodwill, generates press, and creates loyal alumni advocates.`, channels: ["Press", "Social Media", "University Partnerships", "Website"], estimatedImpact: "MEDIUM", estimatedCost: "MEDIUM", implementationSteps: ["Define scholarship criteria", "Partner with universities", "Launch PR campaign", "Select recipients", "Document impact stories"] },
      { title: "Gamified Learning Platform", description: `Add gamification elements: badges, leaderboards, streaks, and rewards. Make learning addictive through game mechanics.`, channels: ["App", "Email", "Social", "Community"], estimatedImpact: "HIGH", estimatedCost: "MEDIUM", implementationSteps: ["Design badge system", "Build streak tracking", "Create leaderboards", "Add social sharing", "Launch with beta group"] },
      { title: "Alumni Network Building", description: `Create an exclusive alumni network with job boards, mentorship matching, and networking events. Turns graduates into brand ambassadors.`, channels: ["Community Platform", "LinkedIn", "Events", "Email"], estimatedImpact: "MEDIUM", estimatedCost: "LOW", implementationSteps: ["Build alumni directory", "Launch mentorship matching", "Host quarterly virtual events", "Create job board", "Feature alumni successes"] },
    );
    taglineBank.push("Learn smarter, grow faster", "Education that transforms", "Your future starts here", "Master the skill, change your life", "Knowledge meets opportunity", "Learn without limits");
    visualBank.push("Bright, inspiring colors with education icons", "Clean academic design with modern twist", "Gradient backgrounds with graduation motifs", "Minimalist with learning journey graphics");
    nameBank.push("SkillForge", "LearnPulse", "EduVance", "MindSpark", "CourseCraft", "StudyHub", "KnowledgeNest", "GrowthLab", "LearnBridge", "AcademyX");
  }

  if (industries.includes("retail")) {
    ideaBank.push(
      { title: "Social Commerce Launch", description: `Launch shoppable posts on Instagram, TikTok, and Pinterest. Create a seamless path from discovery to purchase in 2 taps.`, channels: ["Instagram Shopping", "TikTok Shop", "Pinterest", "Website"], estimatedImpact: "HIGH", estimatedCost: "MEDIUM", implementationSteps: ["Set up Instagram Shop", "Create TikTok product videos", "Design shoppable pins", "Run social ads", "Track conversion rates"] },
      { title: "VIP Early Access Program", description: `Give loyal customers early access to new collections 48 hours before public launch. Creates exclusivity and drives repeat purchases.`, channels: ["Email", "App", "SMS", "VIP Portal"], estimatedImpact: "MEDIUM", estimatedCost: "LOW", implementationSteps: ["Segment top 20% customers", "Create early access portal", "Send 48-hour advance emails", "Track early vs public launch sales", "Gather VIP feedback"] },
      { title: "Unboxing Experience Optimization", description: `Redesign packaging to be Instagram-worthy. Include handwritten notes, samples, and surprise gifts that customers want to share.`, channels: ["Packaging", "Social Media", "Email", "UGC"], estimatedImpact: "MEDIUM", cost: "MEDIUM", estimatedCost: "MEDIUM", implementationSteps: ["Design premium packaging", "Add personalized touches", "Include surprise samples", "Encourage social sharing", "Track UGC volume"] },
      { title: "Flash Sale Countdown Campaign", description: `Run weekly flash sales with countdown timers. Create urgency through limited quantities and time-bound offers.`, channels: ["Website", "Email", "SMS", "Social Media"], estimatedImpact: "HIGH", estimatedCost: "LOW", implementationSteps: ["Design countdown timers", "Create urgency copy", "Segment email lists", "Run social ads", "Measure conversion lift"] },
      { title: "Style Quiz Personalization", description: `Create an interactive style quiz that recommends products based on preferences. Capture email while providing personalized suggestions.`, channels: ["Website", "Email", "Social", "Retargeting"], estimatedImpact: "HIGH", estimatedCost: "MEDIUM", implementationSteps: ["Design style quiz", "Build recommendation engine", "Create email sequences", "Set up retargeting", "A/B test quiz flows"] },
      { title: "Local Store Pop-Up Events", description: `Host monthly pop-up events in-store with exclusive products, meet-and-greets, and community experiences.`, channels: ["In-Store", "Social Media", "Local Media", "Events"], estimatedImpact: "MEDIUM", estimatedCost: "LOW", implementationSteps: ["Plan 12 monthly themes", "Create event promotions", "Partner with local influencers", "Document each event", "Build community list"] },
    );
    taglineBank.push("Shop different, live better", "Curated for your lifestyle", "Where style meets substance", "Your look, your way", "Discover something new", "Quality you can feel");
    visualBank.push("Clean product photography with lifestyle context", "Lifestyle imagery showing products in use", "Minimalist with bold product colors", "User-generated content collages");
    nameBank.push("StyleVault", "TrendSpot", "ShopCraft", "CurateCo", "GiltEdge", "UrbanNest", "ChicHive", "BoutiqueBox", "LuxeLane", "PrismShop");
  }

  // Generic fallback for any industry
  if (ideaBank.length === 0) {
    ideaBank.push(
      { title: `Community-First ${type.replace(/_/g, " ")} Strategy`, description: `Build a community around ${ctx}. Create a space where customers connect, share experiences, and become advocates. Focus on value-first content and genuine engagement.`, channels: ["Discord", "Slack", "Forum", "Social Media"], estimatedImpact: "HIGH", estimatedCost: "LOW", implementationSteps: ["Create community platform", "Seed with 50 founding members", "Host weekly discussions", "Feature member stories", "Grow to 1000+ members"] },
      { title: "Referral Engine", description: `Build a viral referral program for ${ctx}. Reward both referrer and new customer. Use asymmetric rewards (give more to referrer).`, channels: ["Email", "In-App", "Social", "SMS"], estimatedImpact: "HIGH", estimatedCost: "LOW", implementationSteps: ["Design reward structure", "Build referral tracking", "Create shareable assets", "Launch with pilot group", "Optimize based on K-factor"] },
      { title: "Thought Leadership Campaign", description: `Position ${ctx} as an industry thought leader through original research, expert interviews, and insightful commentary on industry trends.`, channels: ["LinkedIn", "Blog", "Podcast", "PR"], estimatedImpact: "MEDIUM", estimatedCost: "LOW", implementationSteps: ["Publish original research", "Launch expert interview series", "Comment on industry news", "Build media relationships", "Speak at conferences"] },
      { title: "Strategic Partnership Program", description: `Partner with 5 complementary businesses for cross-promotion. Create bundled offerings that provide value to both audiences.`, channels: ["Cross-promotion", "Email", "Social", "Events"], estimatedImpact: "HIGH", estimatedCost: "LOW", implementationSteps: ["Identify complementary brands", "Propose value exchange", "Create co-branded content", "Cross-promote to audiences", "Measure mutual benefit"] },
      { title: "Customer Advisory Board", description: `Invite your top 10 customers to an advisory board. Monthly calls for feedback, roadmap input, and exclusive previews. Creates deep loyalty.`, channels: ["Video Calls", "Email", "Slack", "Events"], estimatedImpact: "MEDIUM", estimatedCost: "LOW", implementationSteps: ["Select top 10 customers", "Create advisory charter", "Schedule monthly calls", "Implement feedback", "Share roadmap previews"] },
      { title: "Content Repurposing Machine", description: `Create one flagship piece of content per week, then repurpose into 10+ pieces across all channels. Blog → video → podcast → social → email.`, channels: ["Blog", "YouTube", "Podcast", "Social", "Email"], estimatedImpact: "MEDIUM", estimatedCost: "LOW", implementationSteps: ["Create weekly long-form content", "Repurpose into video", "Extract audio for podcast", "Create social snippets", "Build email sequence"] },
    );
    taglineBank.push(`The future of ${ctx}`, "Built different, built to last", "Where vision meets execution", "Innovation starts here", "Your journey, our mission", "Transforming the ordinary");
    visualBank.push("Modern, clean design with bold typography", "Gradient backgrounds with brand colors", "Custom illustrations over stock photos", "Data visualizations showcasing impact");
    nameBank.push(`${ctx.split(" ")[0]}Hub`, `${ctx.split(" ")[0]}Lab`, "NextGen", "ApexWorks", "PulseForge", "CoreSync", "VibeCo", "NovaCraft", "ZenithAI", "StratEdge");
  }

  const taglines = taglineBank.length > 0 ? taglineBank.slice(0, 4) : [`The future of ${ctx}`, "Built different", "Where vision meets execution", "Innovation starts here"];
  const visuals = visualBank.length > 0 ? visualBank.slice(0, 3) : ["Clean modern design", "Bold typography with gradients", "Custom illustrations"];
  const names = nameBank.length > 0 ? nameBank.slice(0, 6) : [`${ctx.split(" ")[0]}X`, "NextGen", "PulseHub", "CoreLab", "VibeWorks", "NovaCo"];

  return {
    ideas: ideaBank.slice(0, 6),
    taglines,
    visualSuggestions: visuals,
    nameSuggestions: names,
  };
}

// ==================== DYNAMIC FOLLOW-UPS ====================

function generateDynamicFollowUp(request: CreativityRequest): CreativityResult {
  const q = (request.followUp || "").toLowerCase();
  const ctx = request.context;
  const type = request.type;
  const industries = detectIndustry(ctx);

  const ideas: CreativeIdea[] = [];

  // Parse the question to understand what the user wants
  const isAskingAbout = (keywords: string[]) => keywords.some((kw) => q.includes(kw));
  const isHowTo = q.includes("how") || q.includes("what") || q.includes("best way") || q.includes("strategy") || q.includes("approach");
  const isBudget = q.includes("cheap") || q.includes("free") || q.includes("budget") || q.includes("low cost") || q.includes("affordable");
  const isScale = q.includes("scale") || q.includes("grow") || q.includes("expand") || q.includes("increase") || q.includes("boost");
  const isBrand = q.includes("brand") || q.includes("identity") || q.includes("image") || q.includes("reputation");
  const isOnline = q.includes("online") || q.includes("digital") || q.includes("internet") || q.includes("website") || q.includes("seo");
  const isLocal = q.includes("local") || q.includes("near me") || q.includes("neighborhood") || q.includes("community");
  const isCompetitor = q.includes("competitor") || q.includes("competition") || q.includes("rival") || q.includes("differentiat");
  const isRetention = q.includes("retain") || q.includes("loyalty") || q.includes("repeat") || q.includes("churn") || q.includes("come back");
  const isAcquisition = q.includes("acquire") || q.includes("new customer") || q.includes("first time") || q.includes("attract") || q.includes("get more");
  const isContent = q.includes("content") || q.includes("blog") || q.includes("video") || q.includes("podcast") || q.includes("social media");
  const isEmail = q.includes("email") || q.includes("newsletter") || q.includes("drip") || q.includes("automation");
  const isPaid = q.includes("ad") || q.includes("paid") || q.includes("facebook") || q.includes("google") || q.includes("ppc") || q.includes("campaign");
  const isPartnership = q.includes("partner") || q.includes("collaborat") || q.includes("influencer") || q.includes("affiliate");
  const isPricing = q.includes("pric") || q.includes("revenue") || q.includes("monetiz") || q.includes("profit") || q.includes("margin");

  // Generate ideas based on the ACTUAL question
  if (isAskingAbout(["instagram", "social media", "tiktok", "reel", "stories"])) {
    ideas.push(
      { title: "Instagram Reels Storytelling", description: `Create 15-30 second Reels showing ${ctx} in action. Use trending audio, quick cuts, and text overlays. Post 5x/week with 3 content pillars: education, entertainment, behind-the-scenes.`, channels: ["Instagram Reels", "TikTok"], estimatedImpact: "HIGH", estimatedCost: "LOW", implementationSteps: ["Batch film 10 Reels per session", "Use trending sounds within 24 hours", "Add captions for accessibility", "Post at peak hours (12pm, 6pm, 9pm)", "Engage with comments within 30 minutes"] },
      { title: "Social Media UGC Engine", description: `Launch a branded hashtag challenge for ${ctx}. Ask customers to share their experience with your product/service. Feature the best content weekly. Reward top creators with discounts or free products.`, channels: ["Instagram", "TikTok", "Twitter"], estimatedImpact: "HIGH", estimatedCost: "LOW", implementationSteps: ["Create unique branded hashtag", "Seed with 10 influencer posts", "Run weekly contests", "Repost top content daily", "Offer monthly prizes"] },
      { title: "Social Listening & Engagement", description: `Monitor mentions of ${ctx} and related keywords. Jump into relevant conversations, answer questions, and provide value without selling. Build trust through helpful engagement.`, channels: ["Twitter", "Reddit", "Facebook Groups", "LinkedIn"], estimatedImpact: "MEDIUM", estimatedCost: "LOW", implementationSteps: ["Set up monitoring alerts", "Respond to mentions within 1 hour", "Join 10 relevant groups", "Provide helpful answers daily", "Track sentiment changes"] },
    );
  } else if (isAskingAbout(["instagram", "social media"])) {
    ideas.push(
      { title: "Instagram Reels Strategy", description: `Create 3-5 Reels per week showcasing ${ctx}. Use trending audio, quick tips, and customer stories. Each Reel should teach something or entertain - never just sell.`, channels: ["Instagram Reels", "Stories"], estimatedImpact: "HIGH", estimatedCost: "LOW", implementationSteps: ["Film batch of 15 Reels", "Use trending sounds", "Post at peak hours", "Add text overlays", "Engage with every comment"] },
    );
  } else if (isAskingAbout(["partner", "collaborat", "influencer"])) {
    ideas.push(
      { title: "Micro-Influencer Army", description: `Recruit 30-50 micro-influencers (5K-50K followers) in your niche. Pay $100-300 per post. Micro-influencers have 3-5x higher engagement than macro-influencers.`, channels: ["Instagram", "TikTok", "YouTube"], estimatedImpact: "HIGH", estimatedCost: "MEDIUM", implementationSteps: ["Search hashtags for niche creators", "Send personalized DMs", "Offer free product + commission", "Create content guidelines", "Track affiliate conversions"] },
      { title: "Cross-Brand Bundle", description: `Partner with 3 complementary brands to create a bundle deal. Each brand promotes to their audience, tripling your reach with zero ad spend.`, channels: ["Email", "Social", "Landing Page"], estimatedImpact: "HIGH", estimatedCost: "LOW", implementationSteps: ["Identify complementary brands", "Create joint offer", "Build landing page", "Cross-promote via email", "Track referral traffic"] },
      { title: "Affiliate Program Launch", description: `Launch a 20-30% commission affiliate program. Recruit bloggers, YouTubers, and newsletter owners who already serve your audience.`, channels: ["Affiliate Dashboard", "Bloggers", "YouTubers"], estimatedImpact: "MEDIUM", estimatedCost: "LOW", implementationSteps: ["Set up affiliate tracking", "Create promotional materials", "Recruit 50 affiliates", "Pay commissions monthly", "Top performer bonuses"] },
    );
  } else if (isAskingAbout(["email", "newsletter", "drip"])) {
    ideas.push(
      { title: "Welcome Email Sequence", description: `5-part automated email series for new subscribers. Email 1: Welcome + story. Email 2: Value + tips. Email 3: Social proof. Email 4: Offer. Email 5: Urgency.`, channels: ["Email", "Automation"], estimatedImpact: "HIGH", estimatedCost: "LOW", implementationSteps: ["Write 5 email templates", "Set up automation trigger", "Add personalization tokens", "A/B test subject lines", "Track open and click rates"] },
      { title: "Weekly Value Newsletter", description: `Send one high-value email per week. Mix 80% educational content with 20% promotional. Become the email they actually want to open.`, channels: ["Email", "Substack"], estimatedImpact: "MEDIUM", estimatedCost: "LOW", implementationSteps: ["Choose a consistent send day", "Curate 3-5 valuable links", "Add personal commentary", "Include one clear CTA", "Grow list through referrals"] },
    );
  } else if (isAskingAbout(["pric", "revenue", "monetiz", "profit"])) {
    ideas.push(
      { title: "Value-Based Pricing Tiers", description: `Create 3 tiers: Starter ($29), Professional ($79), Enterprise ($199). Each tier adds specific value. Most customers pick the middle tier (anchor effect).`, channels: ["Website", "Sales"], estimatedImpact: "HIGH", estimatedCost: "LOW", implementationSteps: ["Analyze competitor pricing", "Define 3 value tiers", "Add feature comparison table", "A/B test price points", "Monitor conversion by tier"] },
      { title: "Upsell & Cross-Sell Engine", description: `Implement intelligent upsells at checkout. "Customers who bought X also bought Y." Average order value increase of 20-35%.`, channels: ["Website", "App", "Email"], estimatedImpact: "HIGH", estimatedCost: "LOW", implementationSteps: ["Analyze purchase patterns", "Build recommendation engine", "Add checkout upsells", "Create post-purchase emails", "Track AOV lift"] },
    );
  } else if (isAskingAbout(["seo", "search", "google", "organic"])) {
    ideas.push(
      { title: "Topic Cluster Strategy", description: `Create 10 pillar pages with 20 supporting articles each. Dominate search results for your core topics. Internal linking boosts all pages.`, channels: ["Blog", "Google", "SEO Tools"], estimatedImpact: "HIGH", estimatedCost: "LOW", implementationSteps: ["Research 10 pillar topics", "Create 10 comprehensive guides", "Write 200 supporting articles", "Build internal link structure", "Track rankings weekly"] },
      { title: "Local SEO Domination", description: `Optimize Google Business Profile, get 100+ reviews, and create location-specific landing pages. Dominate "near me" searches.`, channels: ["Google Business", "Website", "Local Directories"], estimatedImpact: "HIGH", estimatedCost: "LOW", implementationSteps: ["Optimize GBP completely", "Request reviews from every customer", "Create location pages", "Build local citations", "Post weekly GBP updates"] },
    );
  } else if (isScale) {
    ideas.push(
      { title: `Scale ${ctx} Through Automation`, description: `Automate repetitive tasks: email sequences, social posting, customer onboarding. Free up 20+ hours per week for growth activities.`, channels: ["Zapier", "Make", "HubSpot", "Custom Scripts"], estimatedImpact: "HIGH", estimatedCost: "LOW", implementationSteps: ["Audit all repetitive tasks", "Prioritize by time saved", "Implement top 5 automations", "Monitor and optimize", "Document SOPs"] },
      { title: "Geographic Expansion Playbook", description: `Expand to 3 new geographic markets. Adapt messaging for local audiences, partner with local influencers, and test with small budgets first.`, channels: ["Local Social", "Google Ads", "Partnerships", "PR"], estimatedImpact: "HIGH", estimatedCost: "MEDIUM", implementationSteps: ["Research 3 target markets", "Adapt content for each", "Partner with 10 local influencers", "Test with $500 budget per market", "Scale winning markets"] },
    );
  } else if (isCompetitor) {
    ideas.push(
      { title: "Competitor Weakness Exploitation", description: `Analyze top 3 competitors. Find their worst reviews, slowest features, and biggest complaints. Build marketing that highlights how you solve those exact problems.`, channels: ["Review Sites", "Social Media", "Landing Pages", "Ads"], estimatedImpact: "HIGH", estimatedCost: "LOW", implementationSteps: ["Read 100 competitor reviews", "Identify top 5 pain points", "Create comparison landing pages", "Run 'vs competitor' ads", "Track conquest conversions"] },
    );
  } else if (isRetention) {
    ideas.push(
      { title: "VIP Loyalty Program", description: `Create a tiered loyalty program: Bronze (0-500 pts), Silver (500-2000), Gold (2000+). Each tier unlocks exclusive benefits. Points for purchases, referrals, and engagement.`, channels: ["App", "Email", "In-Store", "SMS"], estimatedImpact: "HIGH", estimatedCost: "MEDIUM", implementationSteps: ["Design point system", "Create tier benefits", "Build tracking dashboard", "Launch with existing customers", "Send tier upgrade notifications"] },
      { title: "Win-Back Campaign", description: `Target customers who haven't purchased in 60+ days with a personalized re-engagement campaign. "We miss you" + exclusive offer.`, channels: ["Email", "SMS", "Retargeting Ads"], estimatedImpact: "HIGH", estimatedCost: "LOW", implementationSteps: ["Segment 60+ day inactive", "Create win-back email sequence", "Add SMS for high-value customers", "Offer 20% discount", "Track reactivation rate"] },
    );
  } else {
    // Truly dynamic: generate ideas based on question keywords
    const words = q.split(/\s+/).filter((w) => w.length > 3);
    const topic = words.slice(0, 3).join(" ") || request.followUp;

    ideas.push(
      { title: `Targeted ${topic} Strategy for ${ctx}`, description: `Research your specific audience interested in "${topic}". Create tailored messaging that speaks directly to their pain points. Test with 3 variants, measure engagement for 2 weeks, then double down on the winner.`, channels: ["Research", "Testing", "Scaling"], estimatedImpact: "MEDIUM", estimatedCost: "LOW", implementationSteps: ["Define target segment interested in this topic", "Create 3 messaging variants", "Run small-scale test ($100 budget)", "Analyze results after 2 weeks", "Reallocate budget to top performer"] },
      { title: `Data-Driven ${topic} Approach`, description: `Use analytics to find where your audience engages most with "${topic}" content. Create 5 pieces of content targeting that angle, distribute across top 3 channels, and measure which drives the most conversions.`, channels: ["Analytics", "Content", "Distribution"], estimatedImpact: "MEDIUM", estimatedCost: "LOW", implementationSteps: ["Analyze current content performance", "Create 5 topic-specific pieces", "Distribute to top 3 channels", "Track engagement and conversions", "Iterate on winners"] },
      { title: `Community-Driven ${topic} Initiative`, description: `Ask your existing customers what they think about "${topic}". Run a poll, host a discussion, or create a focus group. Use their language in your marketing.`, channels: ["Community", "Social", "Email", "Survey"], estimatedImpact: "MEDIUM", estimatedCost: "LOW", implementationSteps: ["Create poll or survey", "Share with email list", "Post in community groups", "Analyze responses", "Create marketing using customer language"] },
    );
  }

  const taglines: string[] = [];
  const visualSuggestions: string[] = [];
  const nameSuggestions: string[] = [];

  if (isBrand) {
    taglines.push("Built on trust, designed for impact", "Where vision meets identity", "Brand that speaks volumes", "Distinctly you, unmistakably different");
    visualSuggestions.push("Bold logo with clean typography", "Consistent color palette across all touchpoints", "Custom photography style guide", "Minimalist with strong brand presence");
    nameSuggestions.push("BrandForge", "IdentityLab", "CoreBrand", "VividMark", "TrueNorth", "SignalStudio");
  } else if (isOnline || isPaid) {
    taglines.push("Click. Convert. Scale.", "Digital-first, results-driven", "Online presence, offline impact", "Data beats guesswork");
    visualSuggestions.push("Dashboard-style metrics display", "Clean conversion-focused layouts", "Bold CTAs with contrasting colors", "Social proof elements throughout");
    nameSuggestions.push("ClickForge", "AdPulse", "ConvertLab", "DigitalEdge", "MetricMind", "AdVantage");
  } else if (isLocal) {
    taglines.push("Your neighborhood favorite", "Local roots, global quality", "Community first, always", "Where locals go");
    visualSuggestions.push("Warm, community-focused imagery", "Local landmarks and people", "Map-based UI elements", "Neighborhood-style design");
    nameSuggestions.push("LocalPulse", "NeighborHub", "CommunityCore", "TownForge", "LocalEdge", "AreaVibe");
  } else {
    taglines.push("Smart moves, big results", "Strategy that works", "Built to perform", "Your growth engine");
    visualSuggestions.push("Modern, clean design with bold metrics", "Dashboard-style data visualizations", "Professional with approachable feel", "Gradient accents on dark backgrounds");
    nameSuggestions.push("StratEdge", "GrowthPulse", "CoreMetric", "VibeWorks", "ApexFlow", "NexaGrowth");
  }

  return {
    ideas: ideas.slice(0, 4),
    taglines,
    visualSuggestions,
    nameSuggestions,
  };
}
