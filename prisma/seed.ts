import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("demo1234", 12);

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@ventureforge.io" },
    update: {},
    create: {
      email: "demo@ventureforge.io",
      name: "Demo User",
      passwordHash,
      role: "ENTREPRENEUR",
      organization: "VentureForge Demo",
    },
  });
  console.log("Created demo user:", demoUser.email);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@ventureforge.io" },
    update: {},
    create: {
      email: "admin@ventureforge.io",
      name: "Admin User",
      passwordHash,
      role: "ADMIN",
      organization: "VentureForge",
    },
  });
  console.log("Created admin user:", adminUser.email);

  await prisma.plan.upsert({
    where: { id: "plan_demo_1" },
    update: {},
    create: {
      id: "plan_demo_1",
      title: "TechStart AI Platform",
      description: "An AI-powered platform for small business automation",
      industry: "Technology",
      region: "IN",
      status: "ACTIVE",
      ownerId: demoUser.id,
      sections: {
        create: [
          { type: "EXECUTIVE_SUMMARY", title: "Executive Summary", content: JSON.stringify({ text: "TechStart aims to democratize AI for small businesses in India. Our platform provides no-code automation tools for customer service, inventory, and marketing." }), order: 0 },
          { type: "MARKET_ANALYSIS", title: "Market Analysis", content: JSON.stringify({ text: "India's SME sector contributes 30% of GDP. 63M+ SMEs with <47% digital adoption. Addressable market: $4.2B by 2027." }), order: 1 },
          { type: "FINANCIAL_PROJECTIONS", title: "Financial Projections", content: JSON.stringify({ text: "Year 1: $500K ARR, 200 customers. Year 3: $5M ARR, 2000 customers. Breakeven at month 18." }), order: 2 },
        ],
      },
      assumptions: {
        create: [
          { category: "REVENUE", name: "Monthly Subscription Price", value: 49, unit: "USD", isDynamic: true },
          { category: "REVENUE", name: "Monthly Customer Growth Rate", value: 15, unit: "%", isDynamic: true },
          { category: "COSTS", name: "Cloud Infrastructure Monthly", value: 8000, unit: "USD" },
          { category: "COSTS", name: "Team Size (Year 1)", value: 8, unit: "people" },
          { category: "MARKET", name: "Total Addressable Market", value: 4200, unit: "million USD" },
        ],
      },
    },
  });
  console.log("Created plan: TechStart AI Platform");

  await prisma.plan.upsert({
    where: { id: "plan_demo_2" },
    update: {},
    create: {
      id: "plan_demo_2",
      title: "GreenLeaf Organic Foods",
      description: "Organic food delivery startup in the UAE market",
      industry: "Food & Beverage",
      region: "AE",
      status: "DRAFT",
      ownerId: demoUser.id,
      sections: {
        create: [
          { type: "EXECUTIVE_SUMMARY", title: "Executive Summary", content: JSON.stringify({ text: "GreenLeaf delivers organic, sustainably sourced food to health-conscious consumers in the UAE. Farm-to-table in 24 hours." }), order: 0 },
          { type: "MARKET_ANALYSIS", title: "Market Analysis", content: JSON.stringify({ text: "UAE organic food market: $380M, growing 12% annually. Premium segment with 45% margins." }), order: 1 },
        ],
      },
      assumptions: {
        create: [
          { category: "REVENUE", name: "Average Order Value", value: 85, unit: "AED" },
          { category: "REVENUE", name: "Daily Orders (Month 1)", value: 50, unit: "orders" },
          { category: "COSTS", name: "Delivery Fleet Monthly", value: 12000, unit: "AED" },
        ],
      },
    },
  });
  console.log("Created plan: GreenLeaf Organic Foods");

  console.log("\nDatabase seeded successfully!");
  console.log("Login: demo@ventureforge.io / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
