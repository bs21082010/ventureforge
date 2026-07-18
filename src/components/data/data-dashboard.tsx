"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface DataDashboardProps {
  sources: Array<{
    id: string;
    name: string;
    type: string;
    isActive: boolean;
    lastFetched?: Date | string;
  }>;
  onRefresh: (id: string) => void;
}

const typeColors: Record<string, string> = {
  GOVERNMENT_ECONOMIC: "info",
  INDUSTRY_REPORT: "purple",
  MARKET_DATA: "success",
  GEOGRAPHIC: "warning",
  DEMOGRAPHIC: "info",
  REGULATORY: "danger",
  BLOCKCHAIN_VERIFIED: "success",
};

export function DataDashboard({ sources, onRefresh }: DataDashboardProps) {
  const activeCount = sources.filter((s) => s.isActive).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-100">{sources.length}</p>
            <p className="text-sm text-gray-400">Total Sources</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-400">{activeCount}</p>
            <p className="text-sm text-gray-400">Active Sources</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-400">
              {sources.filter((s) => s.type === "BLOCKCHAIN_VERIFIED").length}
            </p>
            <p className="text-sm text-gray-400">Blockchain Verified</p>
          </div>
        </Card>
      </div>

      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Connected Data Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sources.map((source) => (
              <div
                key={source.id}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-black/30 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${source.isActive ? "bg-green-500" : "bg-gray-600"}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-200">{source.name}</p>
                    <p className="text-xs text-gray-400">
                      {source.type.replace(/_/g, " ")}
                      {source.lastFetched && ` - Last sync: ${new Date(source.lastFetched).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={(typeColors[source.type] || "default") as "info" | "success" | "warning" | "danger" | "purple"}>
                    {source.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => onRefresh(source.id)}>
                    Refresh
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
