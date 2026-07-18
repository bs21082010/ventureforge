export interface ComplianceCheckRequest {
  planId: string;
  jurisdiction: string;
  industry: string;
  sections: string[];
}

export interface ComplianceResult {
  checks: ComplianceCheckItem[];
  overallStatus: "PASS" | "FAIL" | "WARNING" | "NEEDS_REVIEW";
  score: number; // 0-100
  summary: string;
}

export interface ComplianceCheckItem {
  id: string;
  regulation: string;
  jurisdiction: string;
  category: ComplianceCategory;
  status: "PASS" | "FAIL" | "WARNING" | "NEEDS_REVIEW";
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  title: string;
  description: string;
  details?: string;
  suggestion?: string;
  reference?: string;
}

export type ComplianceCategory =
  | "BUSINESS_REGISTRATION"
  | "TAX"
  | "LABOR"
  | "ENVIRONMENTAL"
  | "DATA_PRIVACY"
  | "FINANCIAL"
  | "INTELLECTUAL_PROPERTY"
  | "EXPORT_IMPORT"
  | "HEALTH_SAFETY"
  | "ANTI_MONEY_LAUNDERING";

export interface Regulation {
  id: string;
  name: string;
  jurisdiction: string;
  category: ComplianceCategory;
  description: string;
  requirements: string[];
  penalties?: string;
  lastUpdated: Date;
}

export interface IntegrationConfig {
  id: string;
  type: IntegrationType;
  name: string;
  isActive: boolean;
  lastSync?: Date;
  metadata: Record<string, unknown>;
}

export type IntegrationType =
  | "CRM_SALESFORCE"
  | "CRM_HUBSPOT"
  | "ERP_SAP"
  | "ERP_ORACLE"
  | "ACCOUNTING_QUICKBOOKS"
  | "ACCOUNTING_XERO"
  | "CLOUD_GOOGLE_DRIVE"
  | "CLOUD_ONEDRIVE"
  | "CLOUD_DROPBOX";
