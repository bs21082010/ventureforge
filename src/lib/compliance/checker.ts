import type {
  ComplianceCheckRequest,
  ComplianceResult,
  ComplianceCheckItem,
  ComplianceCategory,
  Regulation,
} from "@/types/compliance";

const REGULATIONS_DB: Regulation[] = [
  {
    id: "reg_biz_reg_in",
    name: "Companies Act 2013",
    jurisdiction: "India",
    category: "BUSINESS_REGISTRATION",
    description: "All businesses must be registered under the Companies Act or relevant state legislation.",
    requirements: [
      "Register with Ministry of Corporate Affairs",
      "Obtain Director Identification Number (DIN)",
      "File Memorandum and Articles of Association",
      "Annual compliance filings with ROC",
    ],
    penalties: "Fine up to ₹5 lakhs and imprisonment up to 6 months",
    lastUpdated: new Date("2023-01-01"),
  },
  {
    id: "reg_gst_in",
    name: "GST Compliance",
    jurisdiction: "India",
    category: "TAX",
    description: "Businesses exceeding turnover thresholds must register for and comply with GST.",
    requirements: [
      "GST registration if turnover > ₹40 lakhs (₹20 lakhs for services)",
      "Monthly/quarterly GST returns",
      "Maintain proper invoicing with GST details",
      "Input tax credit reconciliation",
    ],
    penalties: "Late fee of ₹100/day per return, interest at 18% per annum",
    lastUpdated: new Date("2023-06-01"),
  },
  {
    id: "reg_labor_in",
    name: "Labour Laws Compliance",
    jurisdiction: "India",
    category: "LABOR",
    description: "Compliance with minimum wages, working conditions, and employee benefits.",
    requirements: [
      "Pay minimum wages as per state notification",
      "Provide statutory benefits (PF, ESI, gratuity)",
      "Maintain prescribed registers and records",
      "Issue appointment letters and employment terms",
    ],
    penalties: "Imprisonment up to 3 months and fine up to ₹5,000",
    lastUpdated: new Date("2023-01-01"),
  },
  {
    id: "reg_data_privacy_in",
    name: "Digital Personal Data Protection Act 2023",
    jurisdiction: "India",
    category: "DATA_PRIVACY",
    description: "Protection of personal data of Indian citizens.",
    requirements: [
      "Obtain consent before collecting personal data",
      "Implement reasonable security safeguards",
      "Appoint Data Protection Officer if processing large scale",
      "Enable data principal rights (access, correction, erasure)",
    ],
    penalties: "Up to ₹250 crore for significant breaches",
    lastUpdated: new Date("2023-08-01"),
  },
  {
    id: "reg_ip_in",
    name: "Intellectual Property Rights",
    jurisdiction: "India",
    category: "INTELLECTUAL_PROPERTY",
    description: "Protection of trademarks, patents, copyrights, and trade secrets.",
    requirements: [
      "Register trademarks for brand protection",
      "File patents for novel inventions",
      "Protect copyrights for original works",
      "Maintain trade secret agreements",
    ],
    penalties: "Damages and injunctions as per court",
    lastUpdated: new Date("2023-01-01"),
  },
  {
    id: "reg_aml_in",
    name: "Prevention of Money Laundering Act",
    jurisdiction: "India",
    category: "ANTI_MONEY_LAUNDERING",
    description: "KYC and AML compliance for financial transactions.",
    requirements: [
      "KYC verification for business relationships",
      "Suspicious transaction reporting",
      "Record maintenance for 5 years",
      "Appoint MLRO (Money Laundering Reporting Officer)",
    ],
    penalties: "Imprisonment 3-10 years and fine up to ₹5 lakhs",
    lastUpdated: new Date("2023-01-01"),
  },
  {
    id: "reg_biz_reg_us",
    name: "Business Entity Registration",
    jurisdiction: "USA",
    category: "BUSINESS_REGISTRATION",
    description: "Register business entity at state level (LLC, Corporation, etc.).",
    requirements: [
      "Choose and register business entity type",
      "Obtain EIN from IRS",
      "Register with Secretary of State",
      "Obtain necessary business licenses",
    ],
    penalties: "Loss of limited liability protection, fines",
    lastUpdated: new Date("2023-01-01"),
  },
  {
    id: "reg_tax_us",
    name: "Federal and State Tax Compliance",
    jurisdiction: "USA",
    category: "TAX",
    description: "Multi-level tax compliance including federal, state, and local taxes.",
    requirements: [
      "Federal corporate income tax filing",
      "State income/franchise tax filing",
      "Sales tax collection and remittance",
      "Quarterly estimated tax payments",
    ],
    penalties: "Penalties from 5% to 25% of unpaid tax, interest accrual",
    lastUpdated: new Date("2023-01-01"),
  },
  {
    id: "reg_data_privacy_us",
    name: "State Privacy Laws (CCPA/CPRA)",
    jurisdiction: "USA",
    category: "DATA_PRIVACY",
    description: "California privacy laws applicable to businesses collecting CA resident data.",
    requirements: [
      "Privacy policy disclosure",
      "Opt-out mechanisms for data sale",
      "Consumer rights (access, delete, opt-out)",
      "Data processing agreements with vendors",
    ],
    penalties: "$2,500 per unintentional violation, $7,500 per intentional",
    lastUpdated: new Date("2023-01-01"),
  },
  {
    id: "reg_labor_us",
    name: "Fair Labor Standards Act",
    jurisdiction: "USA",
    category: "LABOR",
    description: "Federal minimum wage, overtime, and child labor standards.",
    requirements: [
      "Pay federal minimum wage ($7.25/hr)",
      "Time-and-a-half for overtime (>40 hrs/week)",
      "Maintain accurate time records",
      "Child labor restrictions compliance",
    ],
    penalties: "Back pay, liquidated damages, fines up to $10,000",
    lastUpdated: new Date("2023-01-01"),
  },
  {
    id: "reg_biz_reg_uae",
    name: "Commercial Companies Law",
    jurisdiction: "UAE",
    category: "BUSINESS_REGISTRATION",
    description: "Business formation rules for mainland and free zone companies.",
    requirements: [
      "Choose license type (commercial/professional/industrial)",
      "Register with Department of Economic Development",
      "Obtain trade license",
      "Comply with Emiratisation requirements",
    ],
    penalties: "License revocation, fines from AED 5,000",
    lastUpdated: new Date("2023-01-01"),
  },
  {
    id: "reg_tax_uae",
    name: "Corporate Tax (UAE Federal)",
    jurisdiction: "UAE",
    category: "TAX",
    description: "9% corporate tax on taxable income above AED 375,000.",
    requirements: [
      "Register for corporate tax",
      "Maintain proper accounting records",
      "File corporate tax returns",
      "Transfer pricing compliance",
    ],
    penalties: "AED 1,000 for late registration, 1% monthly on unpaid tax",
    lastUpdated: new Date("2023-06-01"),
  },
];

export async function runComplianceChecks(
  request: ComplianceCheckRequest
): Promise<ComplianceResult> {
  const applicableRegulations = REGULATIONS_DB.filter(
    (reg) =>
      reg.jurisdiction.toLowerCase() === request.jurisdiction.toLowerCase() ||
      reg.jurisdiction.toLowerCase() === "global"
  );

  const checks: ComplianceCheckItem[] = [];

  for (const regulation of applicableRegulations) {
    for (const requirement of regulation.requirements) {
      const check = evaluateRequirement(
        regulation,
        requirement,
        request.sections
      );
      checks.push(check);
    }
  }

  const overallStatus = determineOverallStatus(checks);
  const score = calculateComplianceScore(checks);
  const summary = generateComplianceSummary(checks, overallStatus, score);

  return {
    checks,
    overallStatus,
    score,
    summary,
  };
}

function evaluateRequirement(
  regulation: Regulation,
  requirement: string,
  sections: string[]
): ComplianceCheckItem {
  const sectionMatch = sections.some((section) => {
    const sectionLower = section.toLowerCase();
    const categoryLower = regulation.category.toLowerCase().replace(/_/g, " ");
    return (
      sectionLower.includes(categoryLower) ||
      categoryLower.includes(sectionLower.replace(/_/g, " "))
    );
  });

  let status: ComplianceCheckItem["status"] = "NEEDS_REVIEW";
  let severity: ComplianceCheckItem["severity"] = "MEDIUM";

  if (sectionMatch) {
    status = "WARNING";
    severity = "LOW";
  }

  if (regulation.category === "TAX" || regulation.category === "DATA_PRIVACY") {
    severity = "HIGH";
  }

  if (regulation.category === "ANTI_MONEY_LAUNDERING") {
    severity = "CRITICAL";
  }

  return {
    id: `check_${regulation.id}_${requirement.slice(0, 30).replace(/\s+/g, "_")}`,
    regulation: regulation.name,
    jurisdiction: regulation.jurisdiction,
    category: regulation.category,
    status,
    severity,
    title: requirement,
    description: `Ensure compliance with: ${requirement}`,
    suggestion: `Review ${regulation.name} requirements for ${requirement.toLowerCase()}`,
    reference: regulation.name,
  };
}

function determineOverallStatus(
  checks: ComplianceCheckItem[]
): ComplianceResult["overallStatus"] {
  if (checks.some((c) => c.status === "FAIL")) return "FAIL";
  if (checks.some((c) => c.status === "WARNING")) return "WARNING";
  if (checks.some((c) => c.status === "NEEDS_REVIEW")) return "NEEDS_REVIEW";
  return "PASS";
}

function calculateComplianceScore(checks: ComplianceCheckItem[]): number {
  if (checks.length === 0) return 100;

  const passWeight = 1;
  const warningWeight = 0.5;
  const needsReviewWeight = 0.3;
  const failWeight = 0;

  let totalWeight = 0;
  let achievedWeight = 0;

  for (const check of checks) {
    const severityMultiplier =
      check.severity === "CRITICAL"
        ? 3
        : check.severity === "HIGH"
        ? 2
        : check.severity === "MEDIUM"
        ? 1.5
        : 1;

    totalWeight += severityMultiplier;

    if (check.status === "PASS") achievedWeight += passWeight * severityMultiplier;
    else if (check.status === "WARNING")
      achievedWeight += warningWeight * severityMultiplier;
    else if (check.status === "NEEDS_REVIEW")
      achievedWeight += needsReviewWeight * severityMultiplier;
    else achievedWeight += failWeight * severityMultiplier;
  }

  return Math.round((achievedWeight / totalWeight) * 100);
}

function generateComplianceSummary(
  checks: ComplianceCheckItem[],
  status: ComplianceResult["overallStatus"],
  score: number
): string {
  const failing = checks.filter((c) => c.status === "FAIL").length;
  const warnings = checks.filter((c) => c.status === "WARNING").length;
  const reviews = checks.filter((c) => c.status === "NEEDS_REVIEW").length;
  const passing = checks.filter((c) => c.status === "PASS").length;

  let summary = `Compliance Score: ${score}/100. `;
  summary += `Status: ${status}. `;
  summary += `${passing} checks passing, ${warnings} with warnings, ${reviews} needing review, ${failing} failing. `;

  if (status === "FAIL") {
    summary += "Immediate action required to address failing compliance items.";
  } else if (status === "WARNING") {
    summary += "Some areas need attention before full compliance is achieved.";
  } else if (status === "NEEDS_REVIEW") {
    summary += "Several items require manual review and verification.";
  } else {
    summary += "Business plan meets current compliance requirements.";
  }

  return summary;
}

export function getRegulationsByJurisdiction(
  jurisdiction: string
): Regulation[] {
  return REGULATIONS_DB.filter(
    (reg) => reg.jurisdiction.toLowerCase() === jurisdiction.toLowerCase()
  );
}

export function getRegulationsByCategory(
  category: ComplianceCategory
): Regulation[] {
  return REGULATIONS_DB.filter((reg) => reg.category === category);
}
