import { aiJsonCompletion, isAnyAI } from "@/lib/ai/ai-client";

export interface WebsiteRequest {
  prompt: string;
  framework?: "nextjs" | "html" | "tailwind";
}

export interface WebsiteResult {
  code: string;
  preview: string;
  title: string;
  techStack: string[];
  deploymentSteps: string[];
}

function generateSite(request: WebsiteRequest): WebsiteResult {
  const p = request.prompt.toLowerCase();
  const framework = request.framework || "Next.js";
  let title = "My Website";
  let pages = ["Home", "About"];
  let theme: { bg: string; accent: string; heading: string; subheading: string; features: string[] } = {
    bg: "from-slate-900 to-slate-800",
    accent: "blue",
    heading: "Build Something Amazing",
    subheading: "Your vision, brought to life with modern technology.",
    features: ["Fast Performance", "Responsive Design", "Modern Stack"],
  };

  if (p.includes("restaurant") || p.includes("food") || p.includes("cafe") || p.includes("bakery")) {
    title = p.match(/(?:called|named|for)\s+(\w+(?:\s+\w+)?)/i)?.[1] || "Savory Bites";
    theme = {
      bg: "from-amber-900 to-orange-800",
      accent: "orange",
      heading: "Welcome to " + title,
      subheading: "Authentic flavors crafted with passion. Farm-fresh ingredients, timeless recipes, and an unforgettable dining experience.",
      features: ["Farm-Fresh Ingredients", "Award-Winning Chef", "Warm Ambiance"],
    };
    pages = ["Home", "Menu", "About", "Contact"];
  } else if (p.includes("ecommerce") || p.includes("shop") || p.includes("store") || p.includes("product")) {
    title = p.match(/(?:called|named|for)\s+(\w+(?:\s+\w+)?)/i)?.[1] || "ShopVerse";
    theme = {
      bg: "from-violet-900 to-purple-800",
      accent: "purple",
      heading: title + " — Shop the Best",
      subheading: "Curated collections, unbeatable prices, delivered to your door. Discover what's new and trending today.",
      features: ["Free Shipping", "Easy Returns", "24/7 Support"],
    };
    pages = ["Home", "Shop", "Categories", "Cart", "Contact"];
  } else if (p.includes("portfolio") || p.includes("resume") || p.includes("personal") || p.includes("photograph")) {
    title = p.match(/(?:called|named|for)\s+(\w+(?:\s+\w+)?)/i)?.[1] || "My Portfolio";
    theme = {
      bg: "from-gray-900 to-gray-800",
      accent: "blue",
      heading: "Hi, I'm " + (p.match(/(?:called|named|for)\s+(\w+)/i)?.[1] || "a Creator"),
      subheading: "I craft digital experiences through design, code, and creativity. Welcome to my portfolio.",
      features: ["UI/UX Design", "Full-Stack Dev", "Creative Direction"],
    };
    pages = ["Home", "Work", "About", "Contact"];
  } else if (p.includes("blog") || (p.includes("news") && !p.includes("newsletter"))) {
    title = p.match(/(?:called|named|for)\s+(\w+(?:\s+\w+)?)/i)?.[1] || "The Daily Post";
    theme = {
      bg: "from-emerald-900 to-teal-800",
      accent: "emerald",
      heading: title,
      subheading: "Stories that matter. Insights that inspire. Stay informed with curated articles and deep dives.",
      features: ["Weekly Articles", "Expert Interviews", "Community Voices"],
    };
    pages = ["Home", "Articles", "Categories", "About"];
  } else if (p.includes("saas") || p.includes("app") || p.includes("software") || p.includes("platform") || p.includes("tool")) {
    title = p.match(/(?:called|named|for)\s+(\w+(?:\s+\w+)?)/i)?.[1] || "LaunchPad";
    theme = {
      bg: "from-indigo-900 to-blue-800",
      accent: "indigo",
      heading: title + " — Built for Scale",
      subheading: "Enterprise-grade SaaS platform. Automate workflows, boost productivity, and grow your business exponentially.",
      features: ["Cloud-Native", "Team Collaboration", "Advanced Analytics"],
    };
    pages = ["Home", "Features", "Pricing", "Docs", "Contact"];
  } else if (p.includes("agency") || p.includes("consulting") || p.includes("business")) {
    title = p.match(/(?:called|named|for)\s+(\w+(?:\s+\w+)?)/i)?.[1] || "Nexus Agency";
    theme = {
      bg: "from-rose-900 to-pink-800",
      accent: "rose",
      heading: title + " — Strategy Meets Execution",
      subheading: "Full-service agency delivering brand strategy, digital marketing, and growth solutions for modern businesses.",
      features: ["Brand Strategy", "Digital Marketing", "Growth Analytics"],
    };
    pages = ["Home", "Services", "Case Studies", "Contact"];
  }

  const navLinks = pages.slice(1).map(p => p.toLowerCase()).join('", "');
  const featureCards = theme.features.map((f, i) => `            <div class="bg-white/10 rounded-xl p-6 backdrop-blur-sm hover:bg-white/20 transition-all">
              <div class="w-12 h-12 rounded-lg bg-${theme.accent}-500/20 flex items-center justify-center mb-4">
                <svg class="w-6 h-6 text-${theme.accent}-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${["M13 10V3L4 14h7v7l9-11h-7z", "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"][i]}"/>
                </svg>
              </div>
              <h3 class="text-lg font-semibold mb-2 text-white">${f}</h3>
              <p class="text-sm text-white/60">Powerful ${f.toLowerCase()} capabilities built for modern teams and businesses of every size.</p>
            </div>`).join("\n");

  const code = `import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>${title}</title>
        <meta name="description" content="${theme.subheading}" />
      </Head>
      <div class="min-h-screen bg-gradient-to-br ${theme.bg} text-white">
        <nav class="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
          <span class="text-2xl font-bold">${title}</span>
          <div class="flex gap-6">
            ${pages.slice(1).map(p => `<a href="/${p.toLowerCase()}" class="text-white/70 hover:text-white transition-colors">${p}</a>`).join("\n            ")}
          </div>
        </nav>
        <main class="max-w-7xl mx-auto px-8 py-20">
          <section class="text-center mb-24">
            <h1 class="text-6xl font-bold mb-6">${theme.heading}</h1>
            <p class="text-xl text-white/60 max-w-2xl mx-auto mb-10">${theme.subheading}</p>
            <a href="/${pages[1].toLowerCase()}" class="inline-block px-8 py-4 bg-${theme.accent}-600 rounded-lg font-semibold hover:bg-${theme.accent}-700 transition-colors">Get Started</a>
          </section>
          <section class="grid md:grid-cols-3 gap-8">
${featureCards}
          </section>
        </main>
      </div>
    </>
  )
}`;

  const preview = `<div style="padding:2rem;text-align:center;background:linear-gradient(135deg,${theme.bg.replace("from-", "#").replace(" to-", ", #").replace("from-", "").replace(/-/g, "")});color:white;min-height:400px;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:sans-serif">
    <h1 style="font-size:2.5rem;margin-bottom:0.5rem;font-weight:bold">${theme.heading}</h1>
    <p style="color:#94a3b8;max-width:500px;margin-bottom:2rem">${theme.subheading}</p>
    <div style="display:flex;gap:1rem;flex-wrap:wrap;justify-content:center">${theme.features.map(f => `<div style="background:rgba(255,255,255,0.1);padding:0.75rem 1.5rem;border-radius:8px;font-size:0.9rem">${f}</div>`).join("")}</div>
  </div>`;

  return {
    code,
    preview,
    title,
    techStack: [framework, "Tailwind CSS"],
    deploymentSteps: ["Run npx next build", "Deploy to Vercel"],
  };
}

export async function generateWebsite(request: WebsiteRequest): Promise<WebsiteResult> {
  const prompt = `Generate a complete ${request.framework || "Next.js"} website based on this description: "${request.prompt}"

Return JSON:
{
  "code": "complete source code as string",
  "preview": "inline HTML preview (styled div with inline CSS)",
  "title": "page title",
  "techStack": ["array of technologies used"],
  "deploymentSteps": ["step 1", "step 2"]
}`;

  const available = await isAnyAI();
  if (available) {
    try {
      const systemPrompt = "You are a web developer. Generate complete, production-ready website code. Return only valid JSON.";
      return await aiJsonCompletion<WebsiteResult>(systemPrompt, prompt, { temperature: 0.7, maxTokens: 4096 });
    } catch {}
  }

  return generateSite(request);
}
