"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Integration {
  type: string;
  name: string;
  description: string;
  capabilities: string[];
  authType: string;
}

const MOCK_INTEGRATIONS: Integration[] = [
  { type: "CRM_SALESFORCE", name: "Salesforce CRM", description: "Sync business plans with Salesforce opportunities, accounts, and contacts.", capabilities: ["contacts", "accounts", "opportunities", "campaigns"], authType: "oauth2" },
  { type: "CRM_HUBSPOT", name: "HubSpot CRM", description: "Connect with HubSpot for marketing automation and contact management.", capabilities: ["contacts", "companies", "deals", "marketing_events"], authType: "oauth2" },
  { type: "ERP_SAP", name: "SAP Business One", description: "Integrate with SAP for financial data, inventory, and operations.", capabilities: ["financials", "inventory", "orders", "production"], authType: "api_key" },
  { type: "ERP_ORACLE", name: "Oracle NetSuite", description: "Connect to NetSuite ERP for comprehensive business management.", capabilities: ["financials", "crm", "inventory", "hr"], authType: "oauth2" },
  { type: "ACCOUNTING_QUICKBOOKS", name: "QuickBooks", description: "Sync financial projections with QuickBooks accounting data.", capabilities: ["invoices", "expenses", "reports", "payroll"], authType: "oauth2" },
  { type: "ACCOUNTING_XERO", name: "Xero", description: "Connect with Xero for real-time financial data and reporting.", capabilities: ["invoices", "bank_feeds", "reports", "contacts"], authType: "oauth2" },
  { type: "CLOUD_GOOGLE_DRIVE", name: "Google Drive", description: "Store and sync business plans with Google Drive.", capabilities: ["files", "folders", "sharing", "version_history"], authType: "oauth2" },
  { type: "CLOUD_ONEDRIVE", name: "Microsoft OneDrive", description: "Integrate with OneDrive for document storage and collaboration.", capabilities: ["files", "folders", "sharing", "version_history"], authType: "oauth2" },
  { type: "CLOUD_DROPBOX", name: "Dropbox", description: "Sync business plan documents with Dropbox.", capabilities: ["files", "folders", "sharing", "version_history"], authType: "oauth2" },
];

const TYPE_ICONS: Record<string, string> = {
  CRM: "bg-blue-500",
  ERP: "bg-green-500",
  ACCOUNTING: "bg-yellow-500",
  CLOUD: "bg-purple-500",
};

function getTypeCategory(type: string): string {
  if (type.startsWith("CRM")) return "CRM";
  if (type.startsWith("ERP")) return "ERP";
  if (type.startsWith("ACCOUNTING")) return "ACCOUNTING";
  return "CLOUD";
}

export default function IntegrationsPage() {
  const [integrations] = useState<Integration[]>(MOCK_INTEGRATIONS);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed right-4 top-4 z-50 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg">{toast}</div>
      )}
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Enterprise Integrations</h1>
        <p className="text-sm text-gray-400">Native connectors for CRMs, ERPs, accounting software, and cloud storage</p>
      </div>

      {["CRM", "ERP", "ACCOUNTING", "CLOUD"].map((category) => {
        const items = integrations.filter((i) => getTypeCategory(i.type) === category);
        if (items.length === 0) return null;

        return (
          <div key={category}>
            <h2 className="mb-3 text-lg font-semibold text-gray-200">{category} Integrations</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((integration) => (
                <Card key={integration.type} variant="bordered" className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-white text-xs font-bold ${TYPE_ICONS[category]}`}>
                        {category[0]}
                      </div>
                      <div>
                        <CardTitle className="text-base">{integration.name}</CardTitle>
                        <Badge variant="default" size="sm">{integration.authType.toUpperCase()}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="mb-3 text-sm text-gray-400">{integration.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {integration.capabilities.map((cap) => (
                        <Badge key={cap} variant="default" size="sm">{cap}</Badge>
                      ))}
                    </div>
                  </CardContent>
                  <div className="mt-4 flex gap-2">
                    <Button variant="primary" size="sm" className="flex-1" onClick={() => showToast(`${integration.name} connection initiated`)}>Connect</Button>
                    <Button variant="ghost" size="sm" onClick={() => showToast(`Opening ${integration.name} docs...`, )}>Docs</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
