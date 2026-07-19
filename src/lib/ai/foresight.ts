import type {
  ForesightRequest,
  ForesightResult,
  Trend,
  Risk,
  Opportunity,
  Forecast,
} from "@/types/ai";
import { getIndustryGrowthRate, getCompetitorDensity } from "../geospatial/indicators";
import { aiChat, isAnyAI } from "@/lib/ai/ai-client";

interface IndustryProfile {
  growthRate: number;
  trends: Trend[];
  risks: Risk[];
  opportunities: Opportunity[];
  forecasts: (industry: string, timeframe: number) => Forecast[];
}

const INDUSTRY_DATA: Record<string, IndustryProfile> = {
  "Technology": {
    growthRate: 12,
    trends: [
      { name: "AI-Native Applications", direction: "UP", impact: 10, probability: 0.95, timeframe: "2024-2030", description: "Every app becoming AI-first with LLMs embedded in core product logic, not just as features.", sources: [{ title: "Gartner 2024", source: "gartner" }] },
      { name: "Edge Computing Expansion", direction: "UP", impact: 8, probability: 0.85, timeframe: "2025-2030", description: "Processing shifting from cloud to edge devices for latency-critical applications.", sources: [{ title: "IDC Report", source: "idc" }] },
      { name: "Quantum Computing Commercialization", direction: "UP", impact: 9, probability: 0.7, timeframe: "2026-2035", description: "Quantum advantage in cryptography, drug discovery, and optimization problems.", sources: [{ title: "IBM Quantum Roadmap", source: "ibm" }] },
      { name: "Web3 Infrastructure Maturity", direction: "STABLE", impact: 6, probability: 0.75, timeframe: "2024-2028", description: "Blockchain infrastructure becoming enterprise-ready for supply chain, identity, and finance.", sources: [] },
      { name: "Cybersecurity Arms Race", direction: "UP", impact: 9, probability: 0.95, timeframe: "2024-2030", description: "AI-powered attacks driving demand for AI-powered defense systems in an escalating cycle.", sources: [{ title: "CrowdStrike Report", source: "crowdstrike" }] },
    ],
    risks: [
      { name: "Tech Talent Shortage", severity: "HIGH", probability: 0.8, impact: "Average salaries up 20-30%, hiring timelines doubled, project delays", mitigation: ["Remote-first hiring globally", "Internal training programs", "Competitive equity packages"] },
      { name: "Regulatory Crackdown on AI", severity: "HIGH", probability: 0.6, impact: "EU AI Act and US regulations could restrict data usage and model deployment", mitigation: ["Build compliance into architecture", "Diversify AI model providers", "Maintain human-in-the-loop systems"] },
      { name: "Open Source Disruption", severity: "MEDIUM", probability: 0.7, impact: "Open-source alternatives undercutting proprietary software pricing", mitigation: ["Focus on managed services", "Build community moats", "Offer premium enterprise features"] },
    ],
    opportunities: [
      { name: "AI-as-a-Service Platform", potential: "HIGH", timeframe: "6-18 months", requirements: ["GPU infrastructure", "ML engineering team", "API-first architecture"], expectedReturn: "Recurring revenue with 70%+ margins" },
      { name: "Vertical SaaS for Regulated Industries", potential: "HIGH", timeframe: "12-24 months", requirements: ["Domain expertise", "Compliance certifications", "Enterprise sales"], expectedReturn: "High switching costs, $100K+ ACV" },
      { name: "Developer Tooling Ecosystem", potential: "MEDIUM", timeframe: "6-12 months", requirements: ["Developer community", "Open-source strategy", "Freemium model"], expectedReturn: "Network effects driving viral growth" },
    ],
    forecasts: (industry, tf) => [
      { metric: "AI Adoption Rate", current: "35%", predicted: 85, confidence: 0.85 },
      { metric: "Cloud Revenue Growth", current: "$590B", predicted: 45, confidence: 0.9 },
      { metric: "Developer Productivity", current: "100", predicted: 200, confidence: 0.75 },
      { metric: "Time-to-Market", current: "12 months", predicted: 50, confidence: 0.7 },
    ],
  },
  "Finance": {
    growthRate: 8,
    trends: [
      { name: "Embedded Finance Everywhere", direction: "UP", impact: 9, probability: 0.9, timeframe: "2024-2028", description: "Every non-financial company becoming a fintech through embedded payments, lending, and insurance.", sources: [{ title: "Bain Capital Report", source: "bain" }] },
      { name: "Central Bank Digital Currencies", direction: "UP", impact: 8, probability: 0.8, timeframe: "2025-2030", description: "130+ countries exploring CBDCs, reshaping cross-border payments and monetary policy.", sources: [{ title: "Atlantic Council", source: "atlantic" }] },
      { name: "AI in Algorithmic Trading", direction: "UP", impact: 9, probability: 0.9, timeframe: "2024-2028", description: "LLMs processing earnings calls, news, and social sentiment for alpha generation.", sources: [] },
      { name: "Green Finance Boom", direction: "UP", impact: 8, probability: 0.85, timeframe: "2024-2030", description: "ESG-integrated investment products growing 3x faster than traditional funds.", sources: [{ title: "Morningstar ESG Report", source: "morningstar" }] },
    ],
    risks: [
      { name: "Systemic AI Risk", severity: "CRITICAL", probability: 0.3, impact: "Flash crashes from correlated AI trading strategies, cascading failures", mitigation: ["Circuit breakers", "Diversified model portfolios", "Regulatory oversight"] },
      { name: "Fintech Regulatory Tightening", severity: "HIGH", probability: 0.7, impact: "Stricter capital requirements and licensing for neobanks and payment processors", mitigation: ["Proactive compliance", "Bank partnership models", "Regulatory sandbox participation"] },
      { name: "Cyber Fraud Escalation", severity: "HIGH", probability: 0.8, impact: "Deepfake-powered fraud, synthetic identity theft, real-time payment fraud", mitigation: ["Biometric authentication", "Real-time AI fraud detection", "Customer education"] },
    ],
    opportunities: [
      { name: "AI Financial Advisor", potential: "HIGH", timeframe: "12-24 months", requirements: ["Fiduciary compliance", "ML models", "Market data feeds"], expectedReturn: "AUM-based revenue, $50+ per user/month" },
      { name: "Cross-Border Payment Optimization", potential: "HIGH", timeframe: "6-18 months", requirements: ["Multi-currency infrastructure", "Regulatory licenses", "Bank partnerships"], expectedReturn: "0.5-1% per transaction on $100B+ volumes" },
      { name: "Embedded Insurance Products", potential: "MEDIUM", timeframe: "12-18 months", requirements: ["Insurance licensing", "Underwriting models", "Distribution partnerships"], expectedReturn: "Commission-based, 20-40% margins" },
    ],
    forecasts: (industry, tf) => [
      { metric: "Digital Payment Volume", current: "$9.5T", predicted: 60, confidence: 0.9 },
      { metric: "Robo-Adviser AUM", current: "$2.5T", predicted: 80, confidence: 0.8 },
      { metric: "Fraud Detection Accuracy", current: "92%", predicted: 30, confidence: 0.75 },
      { metric: "Cost-to-Income Ratio", current: "55%", predicted: 35, confidence: 0.7 },
    ],
  },
  "Healthcare": {
    growthRate: 10,
    trends: [
      { name: "AI Diagnostics Mainstream", direction: "UP", impact: 10, probability: 0.9, timeframe: "2024-2028", description: "AI matching radiologist accuracy in detecting cancer, heart disease, and rare conditions.", sources: [{ title: "Nature Medicine", source: "nature" }] },
      { name: "Precision Medicine at Scale", direction: "UP", impact: 9, probability: 0.85, timeframe: "2025-2030", description: "Genomic-driven treatments becoming standard, with CRISPR therapies for 100+ conditions.", sources: [] },
      { name: "Telehealth Normalization", direction: "STABLE", impact: 7, probability: 0.9, timeframe: "2024-2028", description: "Virtual care stabilizing at 20-30% of all primary care visits post-pandemic.", sources: [{ title: "McKinsey Health", source: "mckinsey" }] },
      { name: "Mental Health Tech Surge", direction: "UP", impact: 8, probability: 0.85, timeframe: "2024-2028", description: "AI-powered therapy platforms and digital therapeutics addressing global mental health crisis.", sources: [] },
    ],
    risks: [
      { name: "Data Privacy Breaches", severity: "CRITICAL", probability: 0.6, impact: "Health records are most valuable on dark web, HIPAA violations, patient trust erosion", mitigation: ["Zero-trust architecture", "Encryption at rest and transit", "Regular penetration testing"] },
      { name: "AI Misdiagnosis Liability", severity: "HIGH", probability: 0.4, impact: "Legal liability for AI-driven diagnostic errors, unclear malpractice frameworks", mitigation: ["Human-in-the-loop validation", "Comprehensive audit trails", "Clear disclaimers"] },
      { name: "Drug Pricing Pressure", severity: "HIGH", probability: 0.7, impact: "Government price controls reducing margins for pharma and biotech", mitigation: ["Value-based pricing models", "Real-world evidence generation", "Outcome-based contracts"] },
    ],
    opportunities: [
      { name: "AI Clinical Decision Support", potential: "HIGH", timeframe: "12-24 months", requirements: ["FDA clearance", "EHR integration", "Clinical validation trials"], expectedReturn: "Per-seat licensing to hospitals, $50K+ per health system" },
      { name: "Remote Patient Monitoring", potential: "HIGH", timeframe: "6-18 months", requirements: ["IoT sensors", "AI analytics platform", "Reimbursement codes"], expectedReturn: "Recurring SaaS + device revenue" },
      { name: "Digital Therapeutics", potential: "MEDIUM", timeframe: "18-36 months", requirements: ["FDA De Novo pathway", "Clinical trials", "Payer contracts"], expectedReturn: "Prescription-based revenue, high margins" },
    ],
    forecasts: (industry, tf) => [
      { metric: "AI Diagnostic Accuracy", current: "87%", predicted: 40, confidence: 0.85 },
      { metric: "Telehealth Adoption", current: "25%", predicted: 60, confidence: 0.8 },
      { metric: "Drug Development Cost", current: "$2.6B", predicted: 35, confidence: 0.7 },
      { metric: "Patient Outcome Improvement", current: "100", predicted: 30, confidence: 0.75 },
    ],
  },
  "Education": {
    growthRate: 9,
    trends: [
      { name: "AI Personalized Learning", direction: "UP", impact: 9, probability: 0.9, timeframe: "2024-2028", description: "Adaptive learning platforms tailoring curriculum to individual student pace and style in real-time.", sources: [{ title: "HolonIQ", source: "holoniq" }] },
      { name: "Micro-Credentials Boom", direction: "UP", impact: 8, probability: 0.85, timeframe: "2024-2028", description: "Stackable certificates replacing traditional degrees for 60%+ of professional skills.", sources: [] },
      { name: "Immersive VR/AR Classrooms", direction: "UP", impact: 7, probability: 0.7, timeframe: "2026-2032", description: "Virtual labs, field trips, and simulations becoming standard in K-12 and higher ed.", sources: [] },
      { name: "Lifelong Learning Platforms", direction: "UP", impact: 8, probability: 0.85, timeframe: "2024-2030", description: "Continuous upskilling platforms for career changers and reskilling workers.", sources: [{ title: "World Economic Forum", source: "wef" }] },
    ],
    risks: [
      { name: "AI Cheating Crisis", severity: "HIGH", probability: 0.9, impact: "Academic integrity threatened, assessment methods becoming obsolete", mitigation: ["Proctored assessments", "Oral examinations", "Project-based evaluation"] },
      { name: "Digital Divide Widening", severity: "HIGH", probability: 0.7, impact: "Students without devices/internet falling further behind", mitigation: ["Device lending programs", "Offline-first design", "Community wifi initiatives"] },
      { name: "Regulatory Resistance", severity: "MEDIUM", probability: 0.5, impact: "Accreditation bodies blocking AI-integrated degree programs", mitigation: ["Accreditation partnerships", "Hybrid models", "Faculty training programs"] },
    ],
    opportunities: [
      { name: "AI Tutoring Platform", potential: "HIGH", timeframe: "6-18 months", requirements: ["Curriculum content", "NLP models", "Student engagement UX"], expectedReturn: "B2C subscription, $20-50/month per student" },
      { name: "Corporate Training Marketplace", potential: "HIGH", timeframe: "12-24 months", requirements: ["Enterprise sales", "Skill assessment tools", "LMS integration"], expectedReturn: "B2B licensing, $100-500 per employee/year" },
      { name: "Credential Verification Blockchain", potential: "MEDIUM", timeframe: "18-36 months", requirements: ["University partnerships", "Blockchain infrastructure", "Standard-setting"], expectedReturn: "Transaction fees on credential verification" },
    ],
    forecasts: (industry, tf) => [
      { metric: "EdTech Market Size", current: "$340B", predicted: 50, confidence: 0.85 },
      { metric: "Online Course Completion", current: "15%", predicted: 100, confidence: 0.6 },
      { metric: "AI Tutor Effectiveness", current: "70%", predicted: 40, confidence: 0.75 },
      { metric: "Degree Enrollment", current: "100", predicted: 25, confidence: 0.7 },
    ],
  },
  "Retail": {
    growthRate: 6,
    trends: [
      { name: "AI-Powered Personalization", direction: "UP", impact: 9, probability: 0.9, timeframe: "2024-2027", description: "Real-time product recommendations and dynamic pricing based on individual behavior patterns.", sources: [{ title: "Deloitte Retail", source: "deloitte" }] },
      { name: "Social Commerce Explosion", direction: "UP", impact: 8, probability: 0.9, timeframe: "2024-2028", description: "TikTok, Instagram, and YouTube becoming primary shopping channels for Gen Z.", sources: [] },
      { name: "Autonomous Delivery", direction: "UP", impact: 7, probability: 0.75, timeframe: "2025-2030", description: "Drone and robot delivery for last-mile, reducing costs by 40-60%.", sources: [] },
      { name: "Sustainable Retail Mandate", direction: "UP", impact: 8, probability: 0.85, timeframe: "2024-2028", description: "Consumers demanding transparency in supply chain, carbon footprint labeling.", sources: [{ title: "IBM Consumer Study", source: "ibm" }] },
    ],
    risks: [
      { name: "Margin Compression", severity: "HIGH", probability: 0.8, impact: "Rising logistics costs, inflation pressures, and Amazon competition squeezing margins", mitigation: ["Private label expansion", "Direct-to-consumer channels", "Operational efficiency"] },
      { name: "Inventory Obsolescence", severity: "MEDIUM", probability: 0.6, impact: "Fast fashion cycles and trend volatility leading to dead stock", mitigation: ["Demand forecasting AI", "Small batch production", "Real-time inventory optimization"] },
      { name: "Consumer Data Regulations", severity: "MEDIUM", probability: 0.7, impact: "GDPR-style laws limiting personalization capabilities", mitigation: ["First-party data strategy", "Consent management platforms", "Contextual advertising shift"] },
    ],
    opportunities: [
      { name: "AI Shopping Assistant", potential: "HIGH", timeframe: "6-12 months", requirements: ["Product catalog integration", "NLP capabilities", "Recommendation engine"], expectedReturn: "15-30% conversion rate improvement" },
      { name: "Visual Commerce Platform", potential: "MEDIUM", timeframe: "12-18 months", requirements: ["Computer vision models", "UGC infrastructure", "AR try-on"], expectedReturn: "SaaS licensing to brands, $5K-50K/month" },
      { name: "Sustainable Product Marketplace", potential: "MEDIUM", timeframe: "12-24 months", requirements: ["Supply chain verification", "Carbon tracking", "Brand partnerships"], expectedReturn: "Commission-based, premium positioning" },
    ],
    forecasts: (industry, tf) => [
      { metric: "E-commerce Share", current: "22%", predicted: 40, confidence: 0.9 },
      { metric: "Cart Abandonment Rate", current: "70%", predicted: 25, confidence: 0.7 },
      { metric: "Return Rate", current: "20%", predicted: 30, confidence: 0.65 },
      { metric: "Customer Lifetime Value", current: "100", predicted: 35, confidence: 0.75 },
    ],
  },
  "Manufacturing": {
    growthRate: 5,
    trends: [
      { name: "Industry 4.0 Full Stack", direction: "UP", impact: 9, probability: 0.85, timeframe: "2024-2028", description: "IoT sensors, digital twins, and AI optimization across entire production lifecycle.", sources: [{ title: "McKinsey Manufacturing", source: "mckinsey" }] },
      { name: "Reshoring Wave", direction: "UP", impact: 8, probability: 0.75, timeframe: "2024-2030", description: "Supply chain disruptions driving manufacturing back to domestic and regional facilities.", sources: [] },
      { name: "Sustainable Manufacturing", direction: "UP", impact: 8, probability: 0.85, timeframe: "2024-2030", description: "Circular economy, zero-waste production, and carbon-neutral factories becoming competitive necessities.", sources: [] },
      { name: "Cobots and Human-Robot Collaboration", direction: "UP", impact: 7, probability: 0.8, timeframe: "2025-2030", description: "Collaborative robots handling dangerous tasks while humans focus on quality and creativity.", sources: [] },
    ],
    risks: [
      { name: "Supply Chain Disruptions", severity: "HIGH", probability: 0.7, impact: "Geopolitical tensions, natural disasters, and pandemic-related shutdowns", mitigation: ["Multi-source suppliers", "Safety stock buffers", "Nearshoring strategy"] },
      { name: "Skilled Labor Gap", severity: "HIGH", probability: 0.8, impact: "Aging workforce with 2.1M unfilled manufacturing jobs by 2030", mitigation: ["Automation investment", "Training apprenticeships", "Competitive wages"] },
      { name: "Cybersecurity for OT Systems", severity: "CRITICAL", probability: 0.5, impact: "Ransomware attacks on production lines, safety system compromise", mitigation: ["Network segmentation", "OT-specific security", "Incident response plans"] },
    ],
    opportunities: [
      { name: "Predictive Maintenance SaaS", potential: "HIGH", timeframe: "6-18 months", requirements: ["IoT sensor integration", "ML models", "Dashboard UX"], expectedReturn: "Per-machine subscription, $500-2000/month" },
      { name: "Digital Twin Platform", potential: "HIGH", timeframe: "12-24 months", requirements: ["3D modeling", "Real-time data feeds", "Simulation engine"], expectedReturn: "Enterprise licensing, $50K-500K/year" },
      { name: "Reshoring Advisory Services", potential: "MEDIUM", timeframe: "12-18 months", requirements: ["Supply chain expertise", "Policy knowledge", "Network"], expectedReturn: "Consulting fees + SaaS tools" },
    ],
    forecasts: (industry, tf) => [
      { metric: "Automation Rate", current: "30%", predicted: 55, confidence: 0.85 },
      { metric: "Defect Rate", current: "2.5%", predicted: 40, confidence: 0.8 },
      { metric: "OEE (Overall Equipment Effectiveness)", current: "65%", predicted: 30, confidence: 0.75 },
      { metric: "Energy Efficiency", current: "100", predicted: 25, confidence: 0.7 },
    ],
  },
  "Agriculture": {
    growthRate: 7,
    trends: [
      { name: "Precision Agriculture AI", direction: "UP", impact: 9, probability: 0.9, timeframe: "2024-2028", description: "Drone monitoring, soil sensors, and AI-driven crop management reducing waste by 30%.", sources: [{ title: "FAO Report", source: "fao" }] },
      { name: "Vertical Farming Scale-Up", direction: "UP", impact: 8, probability: 0.8, timeframe: "2025-2030", description: "Indoor farming reaching cost parity for leafy greens, herbs, and berries.", sources: [] },
      { name: "Regenerative Agriculture", direction: "UP", impact: 7, probability: 0.85, timeframe: "2024-2030", description: "Carbon credits and premium pricing incentivizing soil health practices.", sources: [{ title: "Rodale Institute", source: "rodale" }] },
      { name: "Agricultural Robotics", direction: "UP", impact: 8, probability: 0.75, timeframe: "2025-2032", description: "Autonomous harvesting, weeding, and planting robots addressing farm labor shortages.", sources: [] },
    ],
    risks: [
      { name: "Climate Volatility", severity: "CRITICAL", probability: 0.8, impact: "Unpredictable weather patterns, droughts, floods destroying crops", mitigation: ["Crop diversification", "Insurance programs", "Climate-resilient varieties"] },
      { name: "Water Scarcity", severity: "CRITICAL", probability: 0.7, impact: "Aquifer depletion and competition for limited water resources", mitigation: ["Drip irrigation", "Drought-resistant crops", "Water recycling"] },
      { name: "Input Cost Inflation", severity: "HIGH", probability: 0.7, impact: "Fertilizer, fuel, and seed costs squeezing farm margins", mitigation: ["Precision application", "Organic alternatives", "Cooperative purchasing"] },
    ],
    opportunities: [
      { name: "Farm Management Platform", potential: "HIGH", timeframe: "6-18 months", requirements: ["Satellite/drone data", "Weather APIs", "Mobile-first design"], expectedReturn: "Per-acre subscription, $5-15/acre" },
      { name: "Carbon Credit Marketplace", potential: "HIGH", timeframe: "12-24 months", requirements: ["Soil measurement", "Verification protocols", "Buyer network"], expectedReturn: "Commission on credit sales, $20-50/ton" },
      { name: "Agricultural Drone Services", potential: "MEDIUM", timeframe: "6-12 months", requirements: ["Drone fleet", "Pilot certification", "Software platform"], expectedReturn: "Per-flight pricing, $10-30/hectare" },
    ],
    forecasts: (industry, tf) => [
      { metric: "Yield per Acre", current: "100", predicted: 30, confidence: 0.8 },
      { metric: "Water Usage Efficiency", current: "100", predicted: 40, confidence: 0.75 },
      { metric: "Food Waste Reduction", current: "30%", predicted: 50, confidence: 0.7 },
      { metric: "Farm Income", current: "100", predicted: 20, confidence: 0.65 },
    ],
  },
  "Real Estate": {
    growthRate: 4,
    trends: [
      { name: "PropTech AI Valuations", direction: "UP", impact: 8, probability: 0.85, timeframe: "2024-2027", description: "AI property valuations becoming more accurate than human appraisers for 80% of transactions.", sources: [] },
      { name: "Smart Building Management", direction: "UP", impact: 8, probability: 0.9, timeframe: "2024-2028", description: "IoT and AI reducing building operating costs by 20-30% through predictive maintenance.", sources: [] },
      { name: "Remote Work Impact on Commercial", direction: "DOWN", impact: 7, probability: 0.85, timeframe: "2024-2028", description: "Office space demand declining 20-30% with hybrid work normalization.", sources: [{ title: "JLL Research", source: "jll" }] },
      { name: "Sustainable Building Mandates", direction: "UP", impact: 8, probability: 0.9, timeframe: "2024-2030", description: "Net-zero building codes becoming mandatory in major cities globally.", sources: [] },
    ],
    risks: [
      { name: "Interest Rate Sensitivity", severity: "HIGH", probability: 0.6, impact: "Higher rates reducing buyer affordability and property valuations", mitigation: ["Rate lock programs", "Adjustable structures", "Cash reserve building"] },
      { name: "Commercial Vacancy Crisis", severity: "HIGH", probability: 0.7, impact: "Office and retail vacancies reaching 15-20% in major markets", mitigation: ["Mixed-use conversion", "Coworking integration", "Experiential retail"] },
      { name: "Regulatory Rent Controls", severity: "MEDIUM", probability: 0.5, impact: "Government rent caps reducing investment returns in residential", mitigation: ["Value-add improvements", "Operational efficiency", "Market-rate positioning"] },
    ],
    opportunities: [
      { name: "AI Property Management", potential: "HIGH", timeframe: "6-18 months", requirements: ["Building IoT integration", "Tenant management system", "Maintenance prediction"], expectedReturn: "Per-unit monthly fee, $50-200/unit" },
      { name: "Real Estate Tokenization", potential: "MEDIUM", timeframe: "18-36 months", requirements: ["SEC compliance", "Blockchain platform", "Investor network"], expectedReturn: "Transaction fees, 1-2% of AUM" },
      { name: "Conversion Design Services", potential: "MEDIUM", timeframe: "12-18 months", requirements: ["Architecture expertise", "Zoning knowledge", "Construction partnerships"], expectedReturn: "Project fees, 8-15% of construction cost" },
    ],
    forecasts: (industry, tf) => [
      { metric: "Home Price Appreciation", current: "4%/yr", predicted: 30, confidence: 0.65 },
      { metric: "Office Vacancy Rate", current: "12%", predicted: 40, confidence: 0.75 },
      { metric: "Smart Building Adoption", current: "15%", predicted: 60, confidence: 0.85 },
      { metric: "PropTech Investment", current: "$20B", predicted: 50, confidence: 0.8 },
    ],
  },
  "Energy": {
    growthRate: 8,
    trends: [
      { name: "Renewable Energy Dominance", direction: "UP", impact: 10, probability: 0.9, timeframe: "2024-2030", description: "Solar and wind becoming cheapest energy sources globally, outcompeting fossil fuels.", sources: [{ title: "IRENA Report", source: "irena" }] },
      { name: "Grid-Scale Battery Storage", direction: "UP", impact: 9, probability: 0.85, timeframe: "2025-2030", description: "Lithium and solid-state batteries enabling 24/7 renewable energy reliability.", sources: [] },
      { name: "Green Hydrogen Economy", direction: "UP", impact: 8, probability: 0.75, timeframe: "2026-2035", description: "Green hydrogen reaching cost parity for heavy industry, shipping, and aviation.", sources: [{ title: "Hydrogen Council", source: "hydrogen" }] },
      { name: "AI-Optimized Grid Management", direction: "UP", impact: 8, probability: 0.85, timeframe: "2024-2028", description: "AI balancing renewable intermittency with demand response and storage.", sources: [] },
    ],
    risks: [
      { name: "Grid Infrastructure Bottleneck", severity: "HIGH", probability: 0.7, impact: "Transmission capacity unable to keep up with renewable generation growth", mitigation: ["Distributed generation", "Microgrids", "Grid modernization investment"] },
      { name: "Critical Mineral Supply", severity: "HIGH", probability: 0.6, impact: "Lithium, cobalt, and rare earth supply constraints for batteries and panels", mitigation: ["Recycling programs", "Alternative chemistries", "Diversified sourcing"] },
      { name: "Policy Reversal Risk", severity: "MEDIUM", probability: 0.4, impact: "Government subsidy changes disrupting renewable project economics", mitigation: ["PPA contracts", "Revenue diversification", "Policy advocacy"] },
    ],
    opportunities: [
      { name: "Virtual Power Plant", potential: "HIGH", timeframe: "12-24 months", requirements: ["Smart meter data", "Aggregation platform", "Utility partnerships"], expectedReturn: "Revenue sharing on grid services" },
      { name: "Energy Storage as a Service", potential: "HIGH", timeframe: "12-18 months", requirements: ["Battery procurement", "Installation network", "Monitoring software"], expectedReturn: "Monthly subscription, $500-5000/commercial customer" },
      { name: "Carbon Offset Platform", potential: "MEDIUM", timeframe: "12-24 months", requirements: ["Verification protocols", "Project network", "Marketplace"], expectedReturn: "Transaction fees on offset sales" },
    ],
    forecasts: (industry, tf) => [
      { metric: "Renewable Energy Share", current: "30%", predicted: 55, confidence: 0.9 },
      { metric: "Battery Cost per kWh", current: "$140", predicted: 45, confidence: 0.85 },
      { metric: "Grid Storage Capacity", current: "45GW", predicted: 80, confidence: 0.8 },
      { metric: "Carbon Emissions Reduction", current: "100", predicted: 30, confidence: 0.75 },
    ],
  },
  "Automotive": {
    growthRate: 5,
    trends: [
      { name: "Level 4 Autonomous Driving", direction: "UP", impact: 10, probability: 0.75, timeframe: "2025-2030", description: "Fully autonomous taxis operating in 50+ cities, reshaping urban transportation.", sources: [{ title: "McKinsey Auto", source: "mckinsey" }] },
      { name: "EV Market Dominance", direction: "UP", impact: 9, probability: 0.9, timeframe: "2024-2030", description: "Electric vehicles reaching 50%+ of new car sales globally by 2030.", sources: [] },
      { name: "Software-Defined Vehicles", direction: "UP", impact: 8, probability: 0.85, timeframe: "2024-2028", description: "OTA updates and subscription features generating recurring revenue per vehicle.", sources: [] },
      { name: "Mobility-as-a-Service", direction: "UP", impact: 8, probability: 0.8, timeframe: "2025-2030", description: "Car ownership declining as ride-sharing and subscription models grow.", sources: [] },
    ],
    risks: [
      { name: "EV Charging Infrastructure Gap", severity: "HIGH", probability: 0.6, impact: "Insufficient charging stations slowing EV adoption in rural areas", mitigation: ["Charging partnerships", "Home charger installation", "Range improvement"] },
      { name: "Autonomous Vehicle Liability", severity: "HIGH", probability: 0.5, impact: "Unclear accident responsibility between manufacturers, software, and owners", mitigation: ["Insurance innovation", "Regulatory engagement", "Safety data collection"] },
      { name: "Legacy Automaker Distress", severity: "HIGH", probability: 0.7, impact: "Traditional OEMs struggling with EV transition, potential bankruptcies", mitigation: ["Supplier diversification", "Contract flexibility", "Financial monitoring"] },
    ],
    opportunities: [
      { name: "EV Charging Network", potential: "HIGH", timeframe: "12-24 months", requirements: ["Real estate partnerships", "Grid connections", "Payment integration"], expectedReturn: "Per-kWh fees, $50K-200K per station/year" },
      { name: "Fleet Management AI", potential: "HIGH", timeframe: "6-18 months", requirements: ["Telematics integration", "Route optimization", "Predictive maintenance"], expectedReturn: "Per-vehicle monthly fee, $100-500/vehicle" },
      { name: "Automotive Cybersecurity", potential: "MEDIUM", timeframe: "12-24 months", requirements: ["V2X expertise", "Penetration testing", "OTA security"], expectedReturn: "Per-model licensing fees" },
    ],
    forecasts: (industry, tf) => [
      { metric: "EV Market Share", current: "18%", predicted: 55, confidence: 0.85 },
      { metric: "Autonomous Miles Driven", current: "1M", predicted: 100, confidence: 0.6 },
      { metric: "Software Revenue per Vehicle", current: "$500", predicted: 80, confidence: 0.75 },
      { metric: "Average Vehicle Price", current: "$48K", predicted: 20, confidence: 0.7 },
    ],
  },
  "Food & Beverage": {
    growthRate: 5,
    trends: [
      { name: "Plant-Based Protein Evolution", direction: "UP", impact: 8, probability: 0.85, timeframe: "2024-2028", description: "Second-generation plant-based and cultivated meat reaching taste and price parity.", sources: [{ title: "Good Food Institute", source: "gfi" }] },
      { name: "Ghost Kitchen Proliferation", direction: "UP", impact: 7, probability: 0.8, timeframe: "2024-2028", description: "Delivery-only restaurants capturing 40% of food delivery revenue.", sources: [] },
      { name: "Functional Foods Boom", direction: "UP", impact: 8, probability: 0.9, timeframe: "2024-2028", description: "Foods with added health benefits (probiotics, adaptogens, nootropics) growing 15% annually.", sources: [] },
      { name: "AI-Powered Food Safety", direction: "UP", impact: 8, probability: 0.85, timeframe: "2024-2028", description: "Computer vision and IoT sensors preventing contamination across supply chains.", sources: [] },
    ],
    risks: [
      { name: "Supply Chain Volatility", severity: "HIGH", probability: 0.7, impact: "Climate events and geopolitical tensions disrupting ingredient supply", mitigation: ["Multi-source suppliers", "Local sourcing", "Strategic inventory"] },
      { name: "Food Safety Recalls", severity: "CRITICAL", probability: 0.3, impact: "Recalls costing $10M+ per incident and lasting brand damage", mitigation: ["Blockchain traceability", "IoT monitoring", "Rapid response protocols"] },
      { name: "Regulatory Labeling Changes", severity: "MEDIUM", probability: 0.6, impact: "Stricter labeling requirements increasing compliance costs", mitigation: ["Proactive compliance", "Clean label reformulation", "Testing partnerships"] },
    ],
    opportunities: [
      { name: "Meal Kit Personalization AI", potential: "HIGH", timeframe: "6-18 months", requirements: ["Nutritional databases", "Preference learning", "Supply chain integration"], expectedReturn: "Per-subscription revenue, $60-120/week" },
      { name: "Food Waste Reduction Platform", potential: "HIGH", timeframe: "12-18 months", requirements: ["Demand forecasting", "Dynamic pricing", "Retailer partnerships"], expectedReturn: "Commission on waste reduction savings" },
      { name: "Cultivated Meat Production", potential: "MEDIUM", timeframe: "36-60 months", requirements: ["Bioreactor technology", "FDA approval", "Scale-up expertise"], expectedReturn: "Premium pricing, 50%+ margins at scale" },
    ],
    forecasts: (industry, tf) => [
      { metric: "Plant-Based Market Share", current: "8%", predicted: 50, confidence: 0.8 },
      { metric: "Food Waste Reduction", current: "30%", predicted: 40, confidence: 0.7 },
      { metric: "Ghost Kitchen Revenue", current: "$40B", predicted: 60, confidence: 0.8 },
      { metric: "E-commerce Food Sales", current: "12%", predicted: 45, confidence: 0.85 },
    ],
  },
  "Telecommunications": {
    growthRate: 4,
    trends: [
      { name: "5G Enterprise Applications", direction: "UP", impact: 9, probability: 0.85, timeframe: "2024-2028", description: "Private 5G networks enabling smart factories, autonomous vehicles, and remote surgery.", sources: [{ title: "GSMA Report", source: "gsma" }] },
      { name: "Network Slicing Monetization", direction: "UP", impact: 8, probability: 0.8, timeframe: "2025-2030", description: "Telcos selling guaranteed QoS slices to enterprises for critical applications.", sources: [] },
      { name: "Edge Computing Revenue", direction: "UP", impact: 8, probability: 0.85, timeframe: "2024-2028", description: "Telcos monetizing edge infrastructure for AI inference and low-latency apps.", sources: [] },
      { name: "AI Network Optimization", direction: "UP", impact: 7, probability: 0.9, timeframe: "2024-2027", description: "AI reducing network operations costs by 20-30% through automated management.", sources: [] },
    ],
    risks: [
      { name: "OTT Competition", severity: "HIGH", probability: 0.9, impact: "Messaging and video apps cannibalizing traditional voice and SMS revenue", mitigation: ["Bundle services", "Content partnerships", "B2B pivot"] },
      { name: "Spectrum Cost Inflation", severity: "HIGH", probability: 0.6, impact: "Auction costs for 5G spectrum straining balance sheets", mitigation: ["Spectrum sharing", "Refarming legacy bands", "Advocacy for fair pricing"] },
      { name: "Cybersecurity Threats", severity: "HIGH", probability: 0.7, impact: "Network attacks, DDoS, and subscriber data breaches", mitigation: ["Zero-trust architecture", "AI threat detection", "Regular penetration testing"] },
    ],
    opportunities: [
      { name: "Private 5G Networks", potential: "HIGH", timeframe: "12-24 months", requirements: ["Spectrum allocation", "Enterprise sales", "Integration partners"], expectedReturn: "Enterprise contracts, $50K-500K/year per customer" },
      { name: "IoT Connectivity Platform", potential: "HIGH", timeframe: "6-18 months", requirements: ["Low-power network support", "Device management", "API platform"], expectedReturn: "Per-device monthly fee, $1-10/device" },
      { name: "Digital Identity Services", potential: "MEDIUM", timeframe: "12-24 months", requirements: ["eKYC compliance", "Biometric capabilities", "Bank partnerships"], expectedReturn: "Per-verification fee" },
    ],
    forecasts: (industry, tf) => [
      { metric: "5G Coverage", current: "25%", predicted: 55, confidence: 0.85 },
      { metric: "ARPU Growth", current: "$25", predicted: 20, confidence: 0.65 },
      { metric: "IoT Connections", current: "15B", predicted: 60, confidence: 0.8 },
      { metric: "Network Opex Savings", current: "100", predicted: 25, confidence: 0.75 },
    ],
  },
  "Media & Entertainment": {
    growthRate: 7,
    trends: [
      { name: "AI-Generated Content", direction: "UP", impact: 9, probability: 0.9, timeframe: "2024-2028", description: "AI creating music, art, video, and text at scale, disrupting traditional content creation.", sources: [] },
      { name: "Streaming wars intensify", direction: "UP", impact: 8, probability: 0.9, timeframe: "2024-2027", description: "Platform consolidation, ad-supported tiers, and bundling becoming survival strategies.", sources: [{ title: "Deloitte Media", source: "deloitte" }] },
      { name: "Immersive Media (XR)", direction: "UP", impact: 7, probability: 0.7, timeframe: "2026-2032", description: "AR/VR content becoming mainstream with Apple Vision Pro and Meta Quest.", sources: [] },
      { name: "Creator Economy Maturation", direction: "UP", impact: 8, probability: 0.85, timeframe: "2024-2028", description: "Individual creators building $10M+ businesses through platforms and direct monetization.", sources: [] },
    ],
    risks: [
      { name: "Content Saturation", severity: "HIGH", probability: 0.9, impact: "Audience attention fragmented across infinite content, declining per-title ROI", mitigation: ["Niche targeting", "Community building", "Premium positioning"] },
      { name: "Copyright & AI Training", severity: "HIGH", probability: 0.8, impact: "Legal battles over AI training on copyrighted works, potential licensing requirements", mitigation: ["Licensed training data", "Fair use advocacy", "Original content focus"] },
      { name: "Platform Dependency", severity: "HIGH", probability: 0.7, impact: "Algorithm changes and policy shifts destroying creator and publisher revenue", mitigation: ["Multi-platform distribution", "Direct audience ownership", "Email lists"] },
    ],
    opportunities: [
      { name: "AI Content Studio", potential: "HIGH", timeframe: "6-12 months", requirements: ["AI tools expertise", "Creative direction", "Distribution channels"], expectedReturn: "Content licensing, $10K-100K per project" },
      { name: "Interactive Storytelling Platform", potential: "MEDIUM", timeframe: "12-24 months", requirements: ["Game engine", "AI narrative engine", "Community features"], expectedReturn: "Subscription + microtransactions" },
      { name: "Creator Monetization Tools", potential: "HIGH", timeframe: "6-18 months", requirements: ["Payment infrastructure", "Analytics platform", "Community features"], expectedReturn: "Transaction fees, 5-15% of creator revenue" },
    ],
    forecasts: (industry, tf) => [
      { metric: "Streaming Subscribers", current: "1.5B", predicted: 30, confidence: 0.8 },
      { metric: "AI Content Share", current: "5%", predicted: 70, confidence: 0.7 },
      { metric: "Creator Economy Size", current: "$100B", predicted: 45, confidence: 0.8 },
      { metric: "Ad Revenue per User", current: "$15", predicted: 20, confidence: 0.65 },
    ],
  },
  "Logistics & Supply Chain": {
    growthRate: 6,
    trends: [
      { name: "Autonomous Freight", direction: "UP", impact: 9, probability: 0.8, timeframe: "2025-2030", description: "Self-driving trucks handling long-haul routes, addressing driver shortages.", sources: [] },
      { name: "AI Demand Forecasting", direction: "UP", impact: 8, probability: 0.9, timeframe: "2024-2027", description: "AI predicting demand with 95%+ accuracy, reducing inventory costs by 30%.", sources: [{ title: "Gartner SCM", source: "gartner" }] },
      { name: "Blockchain Traceability", direction: "UP", impact: 7, probability: 0.75, timeframe: "2025-2030", description: "End-to-end supply chain visibility from raw materials to consumer.", sources: [] },
      { name: "Warehouse Robotics", direction: "UP", impact: 8, probability: 0.9, timeframe: "2024-2028", description: "AMR and picking robots becoming standard in fulfillment centers.", sources: [] },
    ],
    risks: [
      { name: "Geopolitical Disruptions", severity: "CRITICAL", probability: 0.6, impact: "Trade wars, sanctions, and conflicts disrupting established routes", mitigation: ["Route diversification", "Nearshoring", "Strategic inventory"] },
      { name: "Labor Union Pressure", severity: "HIGH", probability: 0.7, impact: "Strikes and wage demands increasing operational costs", mitigation: ["Automation investment", "Competitive wages", "Labor relations programs"] },
      { name: "Fuel Price Volatility", severity: "HIGH", probability: 0.7, impact: "Energy costs directly impacting transportation margins", mitigation: ["Fleet electrification", "Route optimization", "Fuel hedging"] },
    ],
    opportunities: [
      { name: "Visibility Platform", potential: "HIGH", timeframe: "6-18 months", requirements: ["API integrations", "Real-time tracking", "Predictive analytics"], expectedReturn: "Per-shipment fee, $5-20/shipment" },
      { name: "Last-Mile Optimization", potential: "HIGH", timeframe: "12-18 months", requirements: ["Route optimization AI", "Driver network", "Customer UX"], expectedReturn: "Cost savings sharing, 10-20% efficiency gains" },
      { name: "Cold Chain Monitoring", potential: "MEDIUM", timeframe: "6-12 months", requirements: ["IoT sensors", "Compliance automation", "Alert systems"], expectedReturn: "Per-sensor subscription, $100-500/month" },
    ],
    forecasts: (industry, tf) => [
      { metric: "E-commerce Delivery Speed", current: "2 days", predicted: 40, confidence: 0.8 },
      { metric: "Warehouse Automation", current: "25%", predicted: 55, confidence: 0.85 },
      { metric: "Supply Chain Visibility", current: "40%", predicted: 45, confidence: 0.75 },
      { metric: "Carbon per Shipment", current: "100", predicted: 30, confidence: 0.7 },
    ],
  },
  "Aerospace & Defense": {
    growthRate: 5,
    trends: [
      { name: "Reusable Launch Systems", direction: "UP", impact: 9, probability: 0.9, timeframe: "2024-2028", description: "SpaceX and competitors reducing launch costs by 90%, enabling satellite mega-constellations.", sources: [] },
      { name: "AI-Powered Defense Systems", direction: "UP", impact: 10, probability: 0.85, timeframe: "2024-2030", description: "Autonomous drones, AI surveillance, and predictive threat intelligence.", sources: [] },
      { name: "Urban Air Mobility", direction: "UP", impact: 8, probability: 0.7, timeframe: "2026-2032", description: "eVTOL air taxis beginning commercial operations in major cities.", sources: [] },
      { name: "Space Economy Expansion", direction: "UP", impact: 9, probability: 0.8, timeframe: "2025-2035", description: "In-space manufacturing, mining, and tourism creating trillion-dollar economy.", sources: [{ title: "Morgan Stanley Space", source: "morgan" }] },
    ],
    risks: [
      { name: "Regulatory Approval Delays", severity: "HIGH", probability: 0.7, impact: "FAA and international certification bottlenecks slowing deployment", mitigation: ["Early engagement", "Modular certification", "International harmonization"] },
      { name: "Cybersecurity for Connected Aircraft", severity: "CRITICAL", probability: 0.4, impact: "Hackable flight systems, communication interception, GPS spoofing", mitigation: ["Air-gapped systems", "Encryption standards", "Red team testing"] },
      { name: "Supply Chain Constraints", severity: "HIGH", probability: 0.6, impact: "Specialized materials and components with long lead times", mitigation: ["Dual sourcing", "Vertical integration", "Strategic stockpiles"] },
    ],
    opportunities: [
      { name: "Satellite Data Analytics", potential: "HIGH", timeframe: "6-18 months", requirements: ["Satellite imagery access", "ML models", "Industry expertise"], expectedReturn: "Per-image licensing, $10K-100K/year per customer" },
      { name: "Drone Inspection Services", potential: "HIGH", timeframe: "6-12 months", requirements: ["Drone fleet", "Certified pilots", "AI analysis software"], expectedReturn: "Per-inspection fee, $5K-50K per project" },
      { name: "Defense AI Solutions", potential: "HIGH", timeframe: "12-24 months", requirements: ["Security clearance", "Government contracts", "AI/ML expertise"], expectedReturn: "Multi-year contracts, $1M-100M" },
    ],
    forecasts: (industry, tf) => [
      { metric: "Launch Cost per kg", current: "$2,700", predicted: 50, confidence: 0.85 },
      { metric: "Satellite Market Size", current: "$130B", predicted: 55, confidence: 0.8 },
      { metric: "eVTOL Commercial Ops", current: "0", predicted: 40, confidence: 0.6 },
      { metric: "Defense AI Spending", current: "$15B", predicted: 70, confidence: 0.8 },
    ],
  },
  "Pharmaceuticals": {
    growthRate: 7,
    trends: [
      { name: "AI Drug Discovery", direction: "UP", impact: 10, probability: 0.9, timeframe: "2024-2028", description: "AI reducing drug discovery timelines from 10 years to 2-3 years for novel compounds.", sources: [{ title: "McKinsey Pharma", source: "mckinsey" }] },
      { name: "mRNA Platform Expansion", direction: "UP", impact: 9, probability: 0.85, timeframe: "2025-2030", description: "mRNA technology beyond vaccines: cancer, rare diseases, and autoimmune conditions.", sources: [] },
      { name: "Real-World Evidence Integration", direction: "UP", impact: 8, probability: 0.85, timeframe: "2024-2028", description: "Post-market data and EHR insights accelerating approvals and label expansions.", sources: [] },
      { name: "Biologics Manufacturing Revolution", direction: "UP", impact: 8, probability: 0.8, timeframe: "2025-2030", description: "Continuous manufacturing and single-use systems reducing biologics costs 50%.", sources: [] },
    ],
    risks: [
      { name: "Patent Cliff", severity: "HIGH", probability: 0.7, impact: "Major drugs losing exclusivity, $200B+ in revenue at risk by 2030", mitigation: ["Pipeline diversification", "Biosimilar strategies", "Lifecycle management"] },
      { name: "Regulatory Complexity", severity: "HIGH", probability: 0.6, impact: "Divergent global regulatory requirements slowing market access", mitigation: ["Regulatory harmonization", "Local partnerships", "Adaptive trial designs"] },
      { name: "Drug Pricing Pressure", severity: "HIGH", probability: 0.8, impact: "Government negotiations and payer pushback reducing margins", mitigation: ["Value-based contracts", "Outcomes-based pricing", "Patient assistance programs"] },
    ],
    opportunities: [
      { name: "AI Clinical Trial Optimization", potential: "HIGH", timeframe: "6-18 months", requirements: ["Patient data access", "ML models", "CRO partnerships"], expectedReturn: "Per-trial savings of $10-50M" },
      { name: "Rare Disease Therapeutics", potential: "HIGH", timeframe: "24-48 months", requirements: ["Genomic data", "Orphan drug designation", "Patient advocacy"], expectedReturn: "Premium pricing, $200K-500K/patient/year" },
      { name: "Personalized Medicine Platform", potential: "MEDIUM", timeframe: "18-36 months", requirements: ["Companion diagnostics", "Genomic testing", "Treatment algorithms"], expectedReturn: "Per-test + per-treatment revenue" },
    ],
    forecasts: (industry, tf) => [
      { metric: "AI Drug Candidates", current: "50", predicted: 80, confidence: 0.8 },
      { metric: "Clinical Trial Duration", current: "6 years", predicted: 35, confidence: 0.7 },
      { metric: "mRNA Therapeutics Market", current: "$50B", predicted: 60, confidence: 0.85 },
      { metric: "Biosimilar Adoption", current: "15%", predicted: 45, confidence: 0.75 },
    ],
  },
  "Insurance": {
    growthRate: 5,
    trends: [
      { name: "Parametric Insurance", direction: "UP", impact: 8, probability: 0.85, timeframe: "2024-2028", description: "Automatic payouts based on data triggers (weather, flight delays) bypassing claims.", sources: [] },
      { name: "Embedded Insurance", direction: "UP", impact: 9, probability: 0.9, timeframe: "2024-2027", description: "Insurance offered at point of sale for products, travel, and services.", sources: [{ title: "Insurtech Report", source: "insurtech" }] },
      { name: "AI Claims Processing", direction: "UP", impact: 8, probability: 0.85, timeframe: "2024-2027", description: "Computer vision and NLP automating 80% of claims assessment and settlement.", sources: [] },
      { name: "Climate Risk Modeling", direction: "UP", impact: 9, probability: 0.85, timeframe: "2024-2030", description: "AI predicting climate risks at property-level granularity for accurate pricing.", sources: [] },
    ],
    risks: [
      { name: "Climate Catastrophe Losses", severity: "CRITICAL", probability: 0.8, impact: "Increasing frequency and severity of natural disasters straining reserves", mitigation: ["Reinsurance optimization", "Risk modeling", "Product exclusions"] },
      { name: "Cyber Insurance Underpricing", severity: "HIGH", probability: 0.6, impact: "Ransomware claims exceeding premium income", mitigation: ["Accurate risk assessment", "Security requirement mandates", "Loss ratio monitoring"] },
      { name: "Regulatory Capital Requirements", severity: "MEDIUM", probability: 0.5, impact: "Higher capital reserves reducing underwriting capacity and returns", mitigation: ["Capital efficiency programs", "Risk transfer", "Product mix optimization"] },
    ],
    opportunities: [
      { name: "Micro-Insurance Platform", potential: "HIGH", timeframe: "6-18 months", requirements: ["Mobile distribution", "Simplified underwriting", "Instant claims"], expectedReturn: "Per-policy premium, high volume model" },
      { name: "Cyber Risk Assessment", potential: "HIGH", timeframe: "6-12 months", requirements: ["Security scanning", "Risk scoring models", "Enterprise sales"], expectedReturn: "Per-assessment fee, recurring monitoring" },
      { name: "Climate Risk Analytics", potential: "MEDIUM", timeframe: "12-24 months", requirements: ["Geospatial data", "Climate models", "Property data"], expectedReturn: "B2B licensing to insurers and REITs" },
    ],
    forecasts: (industry, tf) => [
      { metric: "Claims Processing Time", current: "14 days", predicted: 50, confidence: 0.8 },
      { metric: "Fraud Detection Rate", current: "60%", predicted: 40, confidence: 0.75 },
      { metric: "Parametric Premium Share", current: "3%", predicted: 60, confidence: 0.7 },
      { metric: "Customer Retention", current: "85%", predicted: 15, confidence: 0.7 },
    ],
  },
  "Consulting & Professional Services": {
    growthRate: 6,
    trends: [
      { name: "AI Augmented Consulting", direction: "UP", impact: 9, probability: 0.9, timeframe: "2024-2027", description: "AI handling research, analysis, and drafts, allowing consultants to focus on strategy.", sources: [] },
      { name: "Productized Services", direction: "UP", impact: 8, probability: 0.85, timeframe: "2024-2028", description: "Fixed-scope, technology-enabled services replacing traditional time-and-materials billing.", sources: [] },
      { name: "Fractional Executive Model", direction: "UP", impact: 7, probability: 0.8, timeframe: "2024-2028", description: "C-suite professionals serving multiple companies simultaneously on flexible terms.", sources: [] },
      { name: "ESG Advisory Surge", direction: "UP", impact: 8, probability: 0.85, timeframe: "2024-2030", description: "Sustainability strategy and reporting becoming core consulting service.", sources: [] },
    ],
    risks: [
      { name: "AI Disintermediation", severity: "HIGH", probability: 0.7, impact: "Clients using AI directly for research, analysis, and strategy formulation", mitigation: ["Relationship value", "Industry expertise", "Implementation capability"] },
      { name: "Talent Retention Crisis", severity: "HIGH", probability: 0.8, impact: "Top talent leaving for tech companies and startups offering equity", mitigation: ["Flexible work", "Equity participation", "Career development"] },
      { name: "Rate Compression", severity: "MEDIUM", probability: 0.6, impact: "Competitive pressure from offshore firms and AI tools reducing billing rates", mitigation: ["Value-based pricing", "Niche specialization", "Productized offerings"] },
    ],
    opportunities: [
      { name: "AI Consulting Practice", potential: "HIGH", timeframe: "6-12 months", requirements: ["AI expertise", "Change management", "Enterprise relationships"], expectedReturn: "Premium rates, $300-500/hour" },
      { name: "SMB Advisory Platform", potential: "HIGH", timeframe: "12-18 months", requirements: ["Scalable frameworks", "Technology platform", "Network of advisors"], expectedReturn: "Subscription + per-engagement fees" },
      { name: "Industry Benchmarking SaaS", potential: "MEDIUM", timeframe: "12-24 months", requirements: ["Data collection", "Analytics platform", "Industry expertise"], expectedReturn: "Per-seat subscription, $500-2000/month" },
    ],
    forecasts: (industry, tf) => [
      { metric: "AI Augmentation Rate", current: "15%", predicted: 60, confidence: 0.85 },
      { metric: "Productized Revenue Share", current: "10%", predicted: 45, confidence: 0.75 },
      { metric: "Average Billing Rate", current: "$300/hr", predicted: 15, confidence: 0.65 },
      { metric: "Client Retention", current: "80%", predicted: 15, confidence: 0.7 },
    ],
  },
  "Hospitality & Tourism": {
    growthRate: 6,
    trends: [
      { name: "AI Concierge Services", direction: "UP", impact: 8, probability: 0.85, timeframe: "2024-2027", description: "Chatbots and voice assistants handling guest requests, bookings, and recommendations.", sources: [] },
      { name: "Bleisure Travel Growth", direction: "UP", impact: 7, probability: 0.85, timeframe: "2024-2028", description: "Blended business-leisure trips becoming 40% of hotel bookings.", sources: [] },
      { name: "Sustainable Tourism Mandate", direction: "UP", impact: 8, probability: 0.9, timeframe: "2024-2030", description: "Carbon-neutral certifications becoming table stakes for premium hospitality.", sources: [] },
      { name: "Experiential Travel Premium", direction: "UP", impact: 8, probability: 0.85, timeframe: "2024-2028", description: "Guests paying 30-50% premium for unique, authentic local experiences.", sources: [{ title: "Booking.com Trends", source: "booking" }] },
    ],
    risks: [
      { name: "Over-Tourism Backlash", severity: "HIGH", probability: 0.7, impact: "Local regulations limiting tourist numbers in popular destinations", mitigation: ["Off-peak pricing", "Diversified destinations", "Community partnerships"] },
      { name: "OTA Commission Pressure", severity: "HIGH", probability: 0.9, impact: "Booking.com and Expedia taking 15-25% commission on bookings", mitigation: ["Direct booking incentives", "Loyalty programs", "Metasearch presence"] },
      { name: "Staff Shortages", severity: "HIGH", probability: 0.8, impact: "Labor shortages reducing service quality and increasing costs", mitigation: ["Automation investment", "Competitive wages", "Training programs"] },
    ],
    opportunities: [
      { name: "Dynamic Pricing Engine", potential: "HIGH", timeframe: "6-12 months", requirements: ["Revenue management AI", "Market data", "Channel management"], expectedReturn: "5-15% RevPAR improvement" },
      { name: "Local Experience Marketplace", potential: "HIGH", timeframe: "6-18 months", requirements: ["Local host network", "Booking platform", "Quality assurance"], expectedReturn: "Commission on experience bookings, 20-30%" },
      { name: "Hotel Operations AI", potential: "MEDIUM", timeframe: "12-18 months", requirements: ["PMS integration", "Predictive analytics", "Staff optimization"], expectedReturn: "Per-room monthly fee, $20-50/room" },
    ],
    forecasts: (industry, tf) => [
      { metric: "Direct Booking Share", current: "45%", predicted: 25, confidence: 0.75 },
      { metric: "Guest Satisfaction", current: "82%", predicted: 20, confidence: 0.7 },
      { metric: "Revenue per Available Room", current: "$120", predicted: 25, confidence: 0.7 },
      { metric: "Sustainability Certified", current: "20%", predicted: 50, confidence: 0.8 },
    ],
  },
  "Mining & Metals": {
    growthRate: 4,
    trends: [
      { name: "Autonomous Mining Operations", direction: "UP", impact: 9, probability: 0.8, timeframe: "2025-2030", description: "Fully autonomous mines with remote operation centers and AI optimization.", sources: [] },
      { name: "Critical Minerals Rush", direction: "UP", impact: 10, probability: 0.9, timeframe: "2024-2030", description: "Lithium, cobalt, nickel, and rare earths becoming strategic national resources.", sources: [] },
      { name: "Green Steel Production", direction: "UP", impact: 8, probability: 0.75, timeframe: "2026-2035", description: "Hydrogen-based steelmaking replacing carbon-intensive blast furnaces.", sources: [] },
      { name: "Digital Twin Mining", direction: "UP", impact: 8, probability: 0.85, timeframe: "2024-2028", description: "Virtual mine replicas optimizing extraction, safety, and environmental impact.", sources: [] },
    ],
    risks: [
      { name: "Commodity Price Volatility", severity: "HIGH", probability: 0.8, impact: "Boom-bust cycles straining capital budgets and investor confidence", mitigation: ["Hedging programs", "Cost discipline", "Diversified portfolios"] },
      { name: "Environmental Liability", severity: "CRITICAL", probability: 0.6, impact: "Legacy contamination cleanup costs, ESG investor pressure", mitigation: ["Remediation reserves", "Clean technology", "Transparent reporting"] },
      { name: "Community Relations", severity: "HIGH", probability: 0.6, impact: "Social license to operate threatened by local opposition", mitigation: ["Community investment", "Employment programs", "Free prior consent"] },
    ],
    opportunities: [
      { name: "Mining Analytics Platform", potential: "HIGH", timeframe: "12-24 months", requirements: ["IoT sensor integration", "ML models", "Mine planning expertise"], expectedReturn: "Per-mine licensing, $500K-5M/year" },
      { name: "Recycled Metals Trading", potential: "HIGH", timeframe: "6-18 months", requirements: ["Supply network", "Quality verification", "Marketplace platform"], expectedReturn: "Transaction fees, 3-5% of trade value" },
      { name: "Carbon Capture for Mining", potential: "MEDIUM", timeframe: "24-48 months", requirements: ["CCS technology", "Geological storage", "Carbon credit verification"], expectedReturn: "Carbon credit revenue, $50-100/ton" },
    ],
    forecasts: (industry, tf) => [
      { metric: "Autonomous Fleet Share", current: "10%", predicted: 55, confidence: 0.8 },
      { metric: "Critical Mineral Demand", current: "100", predicted: 70, confidence: 0.9 },
      { metric: "Mine Productivity", current: "100", predicted: 30, confidence: 0.75 },
      { metric: "Carbon Intensity", current: "100", predicted: 35, confidence: 0.7 },
    ],
  },
  "Sports & Fitness": {
    growthRate: 8,
    trends: [
      { name: "AI Performance Analytics", direction: "UP", impact: 8, probability: 0.9, timeframe: "2024-2027", description: "Wearable sensors and AI providing real-time athletic performance optimization.", sources: [] },
      { name: "Connected Fitness", direction: "UP", impact: 8, probability: 0.85, timeframe: "2024-2028", description: "Peloton-style connected equipment with live and on-demand classes growing 20% annually.", sources: [] },
      { name: "Sports Betting Integration", direction: "UP", impact: 9, probability: 0.9, timeframe: "2024-2028", description: "In-game betting becoming integrated into streaming and stadium experiences.", sources: [] },
      { name: "Esports Mainstream", direction: "UP", impact: 8, probability: 0.85, timeframe: "2024-2028", description: "Professional gaming leagues rivaling traditional sports in viewership and revenue.", sources: [] },
    ],
    risks: [
      { name: "Athlete Data Privacy", severity: "HIGH", probability: 0.6, impact: "Wearable data being exploited by teams, insurers, or unauthorized parties", mitigation: ["Data ownership frameworks", "Encryption", "Consent management"] },
      { name: "Gambling Addiction Concerns", severity: "HIGH", probability: 0.7, impact: "Regulatory crackdown on sports betting advertising and accessibility", mitigation: ["Responsible gambling tools", "Self-exclusion programs", "Age verification"] },
      { name: "Equipment Recall Liability", severity: "MEDIUM", probability: 0.4, impact: "Connected fitness equipment defects causing injuries and class actions", mitigation: ["Rigorous testing", "Insurance coverage", "Rapid response protocols"] },
    ],
    opportunities: [
      { name: "Personalized Training AI", potential: "HIGH", timeframe: "6-12 months", requirements: ["Wearable integration", "ML models", "Content library"], expectedReturn: "Per-user subscription, $20-50/month" },
      { name: "Sports Analytics Platform", potential: "HIGH", timeframe: "12-18 months", requirements: ["Video analysis", "Player tracking", "Team partnerships"], expectedReturn: "B2B licensing to teams, $100K-1M/year" },
      { name: "Wellness Corporate Platform", potential: "MEDIUM", timeframe: "6-18 months", requirements: ["Wellness challenges", "Health tracking", "HR integration"], expectedReturn: "Per-employee annual fee, $100-300/employee" },
    ],
    forecasts: (industry, tf) => [
      { metric: "Wearable Adoption", current: "30%", predicted: 45, confidence: 0.85 },
      { metric: "Esports Viewers", current: "500M", predicted: 40, confidence: 0.8 },
      { metric: "Connected Fitness Revenue", current: "$20B", predicted: 35, confidence: 0.75 },
      { metric: "Sports Betting Handle", current: "$200B", predicted: 50, confidence: 0.8 },
    ],
  },
  "Legal Services": {
    growthRate: 5,
    trends: [
      { name: "AI Contract Analysis", direction: "UP", impact: 9, probability: 0.9, timeframe: "2024-2027", description: "AI reviewing contracts 100x faster than associates, identifying risks and opportunities.", sources: [] },
      { name: "Legal Process Automation", direction: "UP", impact: 8, probability: 0.85, timeframe: "2024-2028", description: "Document generation, filing, and compliance tracking fully automated.", sources: [] },
      { name: "Alternative Legal Services", direction: "UP", impact: 8, probability: 0.85, timeframe: "2024-2028", description: "ALSPs and legal tech capturing $30B from traditional law firm revenue.", sources: [{ title: "Thomson Reuters", source: "thomson" }] },
      { name: "Data Privacy Law Explosion", direction: "UP", impact: 8, probability: 0.9, timeframe: "2024-2030", description: "GDPR-like regulations in 100+ countries driving compliance demand.", sources: [] },
    ],
    risks: [
      { name: "Unauthorized Practice of Law", severity: "HIGH", probability: 0.5, impact: "AI tools crossing the line into legal advice, triggering regulatory action", mitigation: ["Clear disclaimers", "Human oversight", "Regulatory engagement"] },
      { name: "Billable Hour Model Disruption", severity: "HIGH", probability: 0.7, impact: "AI efficiency reducing hours billed, threatening traditional compensation models", mitigation: ["Value-based pricing", "Fixed-fee offerings", "Efficiency sharing"] },
      { name: "Cybersecurity for Client Data", severity: "CRITICAL", probability: 0.6, impact: "Law firm data breaches exposing privileged information", mitigation: ["Zero-trust security", "Encryption", "Incident response plans"] },
    ],
    opportunities: [
      { name: "AI Legal Research Platform", potential: "HIGH", timeframe: "6-18 months", requirements: ["Legal database", "NLP models", "Citation verification"], expectedReturn: "Per-user subscription, $100-500/month" },
      { name: "Compliance Automation SaaS", potential: "HIGH", timeframe: "6-12 months", requirements: ["Regulatory database", "Workflow automation", "Reporting tools"], expectedReturn: "Per-entity subscription, $500-5000/month" },
      { name: "Dispute Resolution Platform", potential: "MEDIUM", timeframe: "12-24 months", requirements: ["Arbitration framework", "AI case analysis", "Settlement algorithms"], expectedReturn: "Per-case fees, 5-10% of dispute value" },
    ],
    forecasts: (industry, tf) => [
      { metric: "AI Adoption by Firms", current: "20%", predicted: 55, confidence: 0.8 },
      { metric: "Document Review Time", current: "100", predicted: 60, confidence: 0.85 },
      { metric: "Fixed-Fee Revenue Share", current: "25%", predicted: 40, confidence: 0.7 },
      { metric: "Client Satisfaction", current: "75%", predicted: 25, confidence: 0.75 },
    ],
  },
  "Construction": {
    growthRate: 4,
    trends: [
      { name: "Modular & Prefab Construction", direction: "UP", impact: 8, probability: 0.85, timeframe: "2024-2028", description: "Off-site construction reducing build times 50% and waste 80%.", sources: [] },
      { name: "BIM & Digital Twins", direction: "UP", impact: 8, probability: 0.9, timeframe: "2024-2027", description: "Building Information Modeling becoming mandatory for large projects.", sources: [] },
      { name: "Construction Robotics", direction: "UP", impact: 7, probability: 0.75, timeframe: "2025-2032", description: "Bricklaying, welding, and inspection robots addressing skilled labor shortages.", sources: [] },
      { name: "Sustainable Building Materials", direction: "UP", impact: 8, probability: 0.85, timeframe: "2024-2030", description: "Mass timber, green concrete, and recycled materials replacing traditional inputs.", sources: [] },
    ],
    risks: [
      { name: "Skilled Labor Shortage", severity: "CRITICAL", probability: 0.85, impact: "400K+ unfilled construction jobs in US alone, project delays", mitigation: ["Training programs", "Automation", "Immigration advocacy"] },
      { name: "Project Cost Overruns", severity: "HIGH", probability: 0.8, impact: "Average 20% overruns straining contractor margins", mitigation: ["Better estimation tools", "Fixed-price contracts", "Contingency reserves"] },
      { name: "Safety Incidents", severity: "CRITICAL", probability: 0.5, impact: "Worker injuries, OSHA fines, and project shutdowns", mitigation: ["IoT safety monitoring", "Training programs", "Safety culture"] },
    ],
    opportunities: [
      { name: "Construction Management SaaS", potential: "HIGH", timeframe: "6-18 months", requirements: ["Project management features", "Mobile-first design", "Integration ecosystem"], expectedReturn: "Per-project subscription, $500-5000/month" },
      { name: "Material Marketplace", potential: "MEDIUM", timeframe: "6-12 months", requirements: ["Supplier network", "Price comparison", "Logistics integration"], expectedReturn: "Commission on purchases, 3-8%" },
      { name: "Safety Monitoring Platform", potential: "HIGH", timeframe: "6-12 months", requirements: ["IoT sensors", "AI video analysis", "Compliance reporting"], expectedReturn: "Per-site monthly fee, $1000-5000" },
    ],
    forecasts: (industry, tf) => [
      { metric: "Modular Construction Share", current: "5%", predicted: 50, confidence: 0.75 },
      { metric: "BIM Adoption", current: "40%", predicted: 40, confidence: 0.85 },
      { metric: "Safety Incident Rate", current: "3.5/100", predicted: 35, confidence: 0.7 },
      { metric: "Project Margin", current: "5%", predicted: 30, confidence: 0.65 },
    ],
  },
  "Water & Utilities": {
    growthRate: 5,
    trends: [
      { name: "Smart Water Grid", direction: "UP", impact: 9, probability: 0.85, timeframe: "2024-2028", description: "IoT sensors detecting leaks in real-time, reducing water loss by 30%.", sources: [] },
      { name: "AI Grid Management", direction: "UP", impact: 8, probability: 0.9, timeframe: "2024-2027", description: "AI balancing renewable intermittency with demand response.", sources: [] },
      { name: "Desalination Cost Decline", direction: "UP", impact: 8, probability: 0.8, timeframe: "2025-2030", description: "New membrane technologies reducing desalination costs 40%.", sources: [] },
      { name: "Microgrid Proliferation", direction: "UP", impact: 7, probability: 0.8, timeframe: "2025-2030", description: "Community microgrids providing resilience against grid failures.", sources: [] },
    ],
    risks: [
      { name: "Aging Infrastructure", severity: "CRITICAL", probability: 0.9, impact: "US water pipes need $600B investment, lead contamination risks", mitigation: ["Capital improvement programs", "Leak detection", "Phased replacement"] },
      { name: "Cybersecurity for Critical Infrastructure", severity: "CRITICAL", probability: 0.6, impact: "Attacks on water treatment and power generation facilities", mitigation: ["Air-gapped systems", "NERC CIP compliance", "Incident response"] },
      { name: "Drought and Climate Risk", severity: "HIGH", probability: 0.7, impact: "Water scarcity affecting supply and hydroelectric generation", mitigation: ["Demand management", "Alternative sources", "Storage investment"] },
    ],
    opportunities: [
      { name: "Water Quality Monitoring SaaS", potential: "HIGH", timeframe: "6-18 months", requirements: ["IoT sensors", "Analytics platform", "Compliance reporting"], expectedReturn: "Per-sensor subscription, $500-2000/month" },
      { name: "Energy Efficiency Platform", potential: "HIGH", timeframe: "6-12 months", requirements: ["Smart meter integration", "AI optimization", "Utility partnerships"], expectedReturn: "Savings sharing, 20-30% of efficiency gains" },
      { name: "Water Trading Platform", potential: "MEDIUM", timeframe: "18-36 months", requirements: ["Water rights database", "Trading platform", "Regulatory framework"], expectedReturn: "Transaction fees on water trades" },
    ],
    forecasts: (industry, tf) => [
      { metric: "Smart Meter Penetration", current: "50%", predicted: 40, confidence: 0.85 },
      { metric: "Water Loss Rate", current: "30%", predicted: 35, confidence: 0.75 },
      { metric: "Renewable Integration", current: "25%", predicted: 50, confidence: 0.8 },
      { metric: "Infrastructure Investment", current: "$150B", predicted: 40, confidence: 0.7 },
    ],
  },
};

const MACRO_TRENDS: Trend[] = [
  {
    name: "AI Integration Across Industries",
    direction: "UP",
    impact: 9,
    probability: 0.95,
    timeframe: "2024-2030",
    description: "Generative AI and automation reshaping every business function from customer service to product development.",
    sources: [{ title: "McKinsey Global AI Report 2024", source: "mckinsey" }],
  },
  {
    name: "Sustainability-First Business Models",
    direction: "UP",
    impact: 8,
    probability: 0.9,
    timeframe: "2024-2035",
    description: "ESG compliance and sustainable practices becoming mandatory for market access and investor relations.",
    sources: [{ title: "World Economic Forum 2024", source: "wef" }],
  },
  {
    name: "Decentralized Finance Growth",
    direction: "UP",
    impact: 7,
    probability: 0.75,
    timeframe: "2025-2030",
    description: "Traditional financial services increasingly competing with DeFi solutions for payments, lending, and investment.",
    sources: [{ title: "DeFi Pulse Report", source: "defipulse" }],
  },
  {
    name: "Remote-First Work Culture",
    direction: "STABLE",
    impact: 6,
    probability: 0.85,
    timeframe: "2024-2030",
    description: "Hybrid and remote work models stabilizing as standard across knowledge industries globally.",
    sources: [{ title: "Gartner Future of Work", source: "gartner" }],
  },
  {
    name: "Supply Chain Regionalization",
    direction: "UP",
    impact: 8,
    probability: 0.8,
    timeframe: "2024-2028",
    description: "Companies diversifying supply chains away from single-source dependencies toward regional alternatives.",
    sources: [{ title: "Gartner Supply Chain Report", source: "gartner" }],
  },
];

function generateIndustryTrends(industry: string): Trend[] {
  const profile = INDUSTRY_DATA[industry];
  if (profile) return profile.trends;
  // Generic fallback for unknown industries
  return [
    { name: `${industry} Digital Transformation`, direction: "UP", impact: 7, probability: 0.8, timeframe: "2024-2028", description: `Accelerating digital adoption across ${industry} with focus on AI and automation.`, sources: [] },
    { name: `${industry} Market Consolidation`, direction: "UP", impact: 6, probability: 0.7, timeframe: "2025-2028", description: `Larger players acquiring innovative startups in the ${industry} sector.`, sources: [] },
    { name: `${industry} Sustainability Push`, direction: "UP", impact: 7, probability: 0.85, timeframe: "2024-2030", description: `ESG requirements and consumer demand driving sustainable practices in ${industry}.`, sources: [] },
  ];
}

function assessRegionalRisks(region: string, industry: string): Risk[] {
  const profile = INDUSTRY_DATA[industry];
  if (profile) return profile.risks;

  const baseRisks: Risk[] = [
    { name: "Regulatory Changes", severity: "MEDIUM", probability: 0.4, impact: "Potential compliance cost increases and operational adjustments", mitigation: ["Monitor regulatory developments", "Build flexible compliance framework", "Maintain regulatory counsel relationship"] },
    { name: "Economic Downturn", severity: "HIGH", probability: 0.3, impact: "Reduced consumer spending, tighter credit, slower growth", mitigation: ["Build cash reserves (6+ months)", "Diversify revenue streams", "Develop cost-reduction playbook"] },
    { name: "Talent Competition", severity: "MEDIUM", probability: 0.6, impact: "Difficulty attracting and retaining key talent, increased labor costs", mitigation: ["Competitive compensation packages", "Remote work flexibility", "Invest in training and development"] },
  ];

  if (region.toLowerCase().includes("india") || region.toLowerCase().includes("mumbai")) {
    baseRisks.push({ name: "Infrastructure Challenges", severity: "MEDIUM", probability: 0.5, impact: "Power outages, connectivity issues, logistics delays", mitigation: ["Invest in backup power systems", "Use cloud-based infrastructure", "Establish multiple logistics partners"] });
  }

  return baseRisks;
}

function identifyOpportunities(industry: string, region: string): Opportunity[] {
  const profile = INDUSTRY_DATA[industry];
  if (profile) return profile.opportunities;

  return [
    { name: "Emerging Market Expansion", potential: "HIGH", timeframe: "12-24 months", requirements: ["Market research", "Local partnerships", "Adapted pricing"], expectedReturn: "2-5x revenue growth in target segments" },
    { name: "Technology Partnership", potential: "MEDIUM", timeframe: "6-12 months", requirements: ["Technical integration capability", "API infrastructure"], expectedReturn: "30-50% efficiency improvement" },
  ];
}

function generateForecasts(industry: string, region: string, timeframe: number): Forecast[] {
  const profile = INDUSTRY_DATA[industry];
  if (profile) return profile.forecasts(industry, timeframe);

  const growthRate = getIndustryGrowthRate(industry, region);
  return [
    { metric: "Market Size Growth", current: 100, predicted: 100 * Math.pow(1 + growthRate / 100, timeframe), confidence: 0.7 },
    { metric: "Customer Acquisition Cost", current: 100, predicted: 100 * Math.pow(0.95, timeframe), confidence: 0.6 },
    { metric: "Average Revenue Per User", current: 100, predicted: 100 * Math.pow(1 + (growthRate * 0.3) / 100, timeframe), confidence: 0.65 },
  ];
}

const FORESIGHT_SYSTEM_PROMPT = `You are a business foresight analyst specializing in trend analysis, risk assessment, and opportunity identification. Analyze the given industry and region to provide predictive insights. Return ONLY valid JSON:
{
  "trends": [{"name": "string", "direction": "UP"|"DOWN"|"STABLE"|"VOLATILE", "impact": 1-10, "probability": 0-1, "timeframe": "string", "description": "detailed analysis", "sources": [{"title": "string", "source": "string"}]}],
  "risks": [{"name": "string", "severity": "LOW"|"MEDIUM"|"HIGH"|"CRITICAL", "impact": "detailed impact description", "mitigation": ["strategy1", "strategy2"]}],
  "opportunities": [{"name": "string", "potential": "LOW"|"MEDIUM"|"HIGH", "timeframe": "string", "expectedReturn": "string", "requirements": ["req1", "req2"]}],
  "forecasts": [{"metric": "string", "current": "string", "predicted": number, "confidence": 0-1}]
}
Generate 5-6 trends, 3-4 risks, 3-4 opportunities, and 3-4 forecasts. Be specific to the industry and region.`;

export async function generateForesight(
  request: ForesightRequest
): Promise<ForesightResult> {
  const hasAI = await isAnyAI();

  if (hasAI) {
    try {
      const userPrompt = `Industry: ${request.industry}
Region: ${request.region}
Forecast Timeframe: ${request.timeframe} years
${request.focusAreas?.length ? `Focus Areas: ${request.focusAreas.join(", ")}` : ""}

Provide comprehensive foresight analysis for this industry in this region. Include real trends, risks, opportunities, and data-driven forecasts.`;

      const result = await aiChat(FORESIGHT_SYSTEM_PROMPT, userPrompt, {
        temperature: 0.7,
        maxTokens: 4096,
      });

      const jsonMatch = result.match(/```json\s*([\s\S]*?)```/) || result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0].replace(/```json\s*/g, "").replace(/```/g, "").trim());
        if (parsed.trends && parsed.risks && parsed.opportunities) {
          return {
            trends: (parsed.trends || []).map((t: any) => ({
              name: t.name || "Unknown Trend",
              direction: t.direction || "STABLE",
              impact: t.impact || 5,
              probability: t.probability || 0.5,
              timeframe: t.timeframe || "2024-2030",
              description: t.description || "",
              sources: t.sources || [],
            })),
            risks: (parsed.risks || []).map((r: any) => ({
              name: r.name || "Unknown Risk",
              severity: r.severity || "MEDIUM",
              impact: r.impact || "",
              mitigation: r.mitigation || [],
            })),
            opportunities: (parsed.opportunities || []).map((o: any) => ({
              name: o.name || "Unknown Opportunity",
              potential: o.potential || "MEDIUM",
              timeframe: o.timeframe || "1-3 years",
              expectedReturn: o.expectedReturn || "TBD",
              requirements: o.requirements || [],
            })),
            forecasts: (parsed.forecasts || []).map((f: any) => ({
              metric: f.metric || "Unknown",
              current: f.current || "N/A",
              predicted: f.predicted || 0,
              confidence: f.confidence || 0.5,
            })),
            confidence: parsed.confidence || 0.7,
          };
        }
      }
    } catch (err) {
      console.error("AI foresight generation failed, using fallback:", err);
    }
  }

  // Industry-specific fallback
  const trends = [...MACRO_TRENDS, ...generateIndustryTrends(request.industry)];
  const risks = assessRegionalRisks(request.region, request.industry);
  const opportunities = identifyOpportunities(request.industry, request.region);
  const forecasts = generateForecasts(request.industry, request.region, request.timeframe);

  return { trends, risks, opportunities, forecasts, confidence: 0.65 };
}
