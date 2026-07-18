"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CollabUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "online" | "offline" | "away";
  lastActive: string;
}

const MOCK_USERS: CollabUser[] = [
  { id: "u1", name: "Amit Sharma", email: "amit@example.com", role: "Owner", status: "online", lastActive: "Just now" },
  { id: "u2", name: "Priya Patel", email: "priya@example.com", role: "Editor", status: "online", lastActive: "2 min ago" },
  { id: "u3", name: "Raj Kumar", email: "raj@example.com", role: "Viewer", status: "away", lastActive: "15 min ago" },
  { id: "u4", name: "Sarah Chen", email: "sarah@example.com", role: "Editor", status: "offline", lastActive: "2 hours ago" },
];

const STATUS_COLORS: Record<string, "success" | "warning" | "default"> = {
  online: "success",
  away: "warning",
  offline: "default",
};

const ACTIVITY_LOG = [
  { user: "Priya Patel", action: "edited Financial Plan section", time: "2 min ago" },
  { user: "Amit Sharma", action: "added new assumption: Revenue Growth", time: "5 min ago" },
  { user: "Priya Patel", action: "accepted AI suggestion: Marketing Strategy", time: "12 min ago" },
  { user: "Raj Kumar", action: "viewed the plan", time: "15 min ago" },
  { user: "Amit Sharma", action: "ran compliance check (Score: 87)", time: "1 hour ago" },
  { user: "Sarah Chen", action: "uploaded supplementary document", time: "2 hours ago" },
];

export default function CollaborativePage() {
  const [users] = useState<CollabUser[]>(MOCK_USERS);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed right-4 top-4 z-50 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg">{toast}</div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Collaborative Dashboard</h1>
          <p className="text-sm text-gray-400">Multi-user editing and real-time collaboration</p>
        </div>
        <Button variant="primary" onClick={() => showToast("Invitation link copied to clipboard")}>Invite Collaborator</Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/30 p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-900/40 text-sm font-medium text-blue-300">
                          {user.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0b1120] ${
                          user.status === "online" ? "bg-green-500" :
                          user.status === "away" ? "bg-yellow-500" : "bg-gray-600"
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-200">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={STATUS_COLORS[user.status]}>{user.status}</Badge>
                      <Badge variant="default">{user.role}</Badge>
                      <span className="text-xs text-gray-400">{user.lastActive}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Blockchain Certification</CardTitle>
              <p className="text-sm text-gray-500">Immutable verification of your business plan</p>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-black/30 border border-white/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.95 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-200">Plan Verification</span>
                  <Badge variant="success">Verified</Badge>
                </div>
                <p className="text-xs text-gray-400">Hash: 0x7f8a3b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a</p>
                <p className="text-xs text-gray-400">Block: #1,247,892 | Chain: VentureForge</p>
                <p className="text-xs text-gray-400">Certified: 2025-03-10 14:32 UTC</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Activity Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ACTIVITY_LOG.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                    <div>
                      <p className="text-sm text-gray-300">
                        <span className="font-medium">{item.user}</span>{" "}
                        {item.action}
                      </p>
                      <p className="text-xs text-gray-400">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardHeader>
              <CardTitle>AI Workflow Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["AI Draft", "Human Review", "Human Refine", "System Validate", "Approve"].map((step, i) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      i < 3 ? "bg-green-900/40 text-green-300" :
                      i === 3 ? "bg-blue-900/40 text-blue-300" :
                      "bg-gray-800 text-gray-400"
                    }`}>
                      {i < 3 ? "✓" : i + 1}
                    </div>
                    <span className={`text-sm ${i <= 3 ? "text-gray-200" : "text-gray-400"}`}>{step}</span>
                    {i === 3 && <Badge variant="info" size="sm">In Progress</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
