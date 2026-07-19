"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const FEATURES = [
  { category: "AI Studios", items: ["Game Studio — create playable HTML5 games", "Website Builder — generate full websites", "App Builder — build React Native/Expo apps", "Research Hub — deep-dive market analysis", "Business Builder — plans + websites + apps"] },
  { category: "Business Planning", items: ["Unlimited business plans", "AI-powered analysis & suggestions", "Advanced financial engine with scenarios", "Data source integrations (World Bank, IMF, FRED)", "Compliance automation (multi-jurisdiction)"] },
  { category: "Platform", items: ["Team collaboration", "Export to PDF", "Custom branding", "API access", "Dedicated community support", "All future features included"] },
];

export default function PricingPage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 text-green-500 text-sm font-medium">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          No payment required
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Free Forever</h1>
        <p className="text-sm sm:text-lg text-muted-foreground">
          Every feature, every tool, every update — completely free. No credit card, no time limit, no catch.
        </p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-4xl sm:text-5xl md:text-6xl font-bold">$0</span>
          <span className="text-muted-foreground text-sm sm:text-lg">/month</span>
        </div>
      </div>

      <Card className="max-w-4xl mx-auto border-green-500/20">
        <CardHeader className="text-center pb-0">
          <CardTitle className="text-2xl">Everything included</CardTitle>
          <p className="text-muted-foreground text-sm mt-1">
            All studios, all tools, all integrations — one price: zero.
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((section) => (
              <div key={section.category}>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-5 rounded-full bg-green-500 inline-block" />
                  {section.category}
                </h3>
                <ul className="space-y-2.5">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <svg className="w-4 h-4 mt-0.5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground max-w-lg mx-auto">
        <p>VentureForge is entirely free for now. All of the features are unlocked with no caps, no credit cards, and no tricks up our sleeve. If and when we release paid plans in your region, you will have continuous free access to all that you&apos;ve enjoyed, with nothing taken from you.</p>
      </div>
    </div>
  );
}
