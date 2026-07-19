"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CreativityRequest, CreativityResult, CreativeIdea } from "@/types/ai";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  type: string;
  ideas?: CreativeIdea[];
  taglines?: string[];
  nameSuggestions?: string[];
  visualSuggestions?: string[];
}

const TYPES = ["MARKETING", "BRANDING", "CUSTOMER_ENGAGEMENT", "CONTENT", "NAMING"] as const;

const TYPE_PLACEHOLDERS: Record<string, string> = {
  MARKETING: "e.g., Organic food delivery startup in Mumbai",
  BRANDING: "e.g., Premium fitness app targeting millennials",
  CUSTOMER_ENGAGEMENT: "e.g., SaaS platform with 10K users",
  CONTENT: "e.g., EdTech platform for coding courses",
  NAMING: "e.g., AI-powered legal tech startup",
};

function getStorageKey(context: string) {
  return `ai_sandbox_chat_${context.replace(/\s+/g, "_").toLowerCase()}`;
}

export function CreativityWorkspace() {
  const [request, setRequest] = useState<CreativityRequest>({
    planId: "",
    type: "MARKETING",
    context: "",
    targetAudience: "",
    tone: "professional",
  });
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followUp, setFollowUp] = useState("");
  const [activeView, setActiveView] = useState<string>("ideas");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // Load saved chat when context changes
  useEffect(() => {
    if (request.context) {
      try {
        const saved = localStorage.getItem(getStorageKey(request.context));
        if (saved) {
          const parsed = JSON.parse(saved);
          setChat(parsed);
          if (parsed.length > 0) {
            const lastType = parsed[parsed.length - 1].type;
            setActiveView(lastType === "NAMING" ? "names" : lastType === "BRANDING" ? "visual" : "ideas");
          }
        } else {
          setChat([]);
        }
      } catch { setChat([]); }
    }
  }, [request.context]);

  // Save chat to localStorage whenever it changes
  useEffect(() => {
    if (request.context && chat.length > 0) {
      try { localStorage.setItem(getStorageKey(request.context), JSON.stringify(chat)); } catch {}
    }
  }, [chat, request.context]);

  const handleTypeChange = (type: CreativityRequest["type"]) => {
    setRequest((prev) => ({ ...prev, type }));
    if (type === "NAMING") setActiveView("names");
    else if (type === "BRANDING") setActiveView("visual");
    else setActiveView("ideas");
  };

  const handleNewProject = () => {
    if (request.context) {
      try { localStorage.removeItem(getStorageKey(request.context)); } catch {}
    }
    setRequest({ planId: "", type: "MARKETING", context: "", targetAudience: "", tone: "professional" });
    setChat([]);
    setError(null);
    setActiveView("ideas");
  };

  const handleGenerate = async () => {
    if (!request.context) return;
    setLoading(true);
    setError(null);

    const userMsg: ChatMessage = { role: "user", content: request.context, type: request.type };
    setChat((prev) => [...prev, userMsg]);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "creativity", ...request }),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        setError(data.error || "Generation failed.");
        setChat((prev) => prev.slice(0, -1));
        return;
      }
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: `Here are ${request.type.replace(/_/g, " ").toLowerCase()} ideas for your business:`,
        type: request.type,
        ideas: data.ideas || [],
        taglines: data.taglines || [],
        nameSuggestions: data.nameSuggestions || [],
        visualSuggestions: data.visualSuggestions || [],
      };
      setChat((prev) => [...prev, assistantMsg]);
    } catch {
      setError("Network error.");
      setChat((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUp = async () => {
    if (!followUp.trim() || chat.length === 0) return;
    const question = followUp.trim();
    setFollowUp("");
    setLoading(true);

    const userMsg: ChatMessage = { role: "user", content: question, type: request.type };
    setChat((prev) => [...prev, userMsg]);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "creativity",
          ...request,
          context: `${request.context}\n\nPrevious response included: ${chat.filter(m => m.role === "assistant").map(m => m.ideas?.map(i => i.title).join(", ")).join("; ")}\n\nUser follow-up: ${question}\n\nGenerate DIFFERENT ideas that specifically answer this follow-up. Do NOT repeat previous ideas. Return 3-4 new targeted ideas.`,
        }),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        setChat((prev) => [...prev, { role: "assistant", content: data.error || "Failed.", type: request.type }]);
      } else {
        setChat((prev) => [...prev, {
          role: "assistant",
          content: `Here's my response to: "${question}"`,
          type: request.type,
          ideas: data.ideas || [],
          taglines: data.taglines || [],
          nameSuggestions: data.nameSuggestions || [],
          visualSuggestions: data.visualSuggestions || [],
        }]);
      }
    } catch {
      setChat((prev) => [...prev, { role: "assistant", content: "Network error.", type: request.type }]);
    } finally {
      setLoading(false);
    }
  };

  const latestAssistant = [...chat].reverse().find((m) => m.role === "assistant");

  const viewTabs = [
    { key: "ideas", label: "Ideas", show: latestAssistant?.ideas && latestAssistant.ideas.length > 0 },
    { key: "taglines", label: "Taglines", show: latestAssistant?.taglines && latestAssistant.taglines.length > 0 },
    { key: "names", label: "Names", show: latestAssistant?.nameSuggestions && latestAssistant.nameSuggestions.length > 0 },
    { key: "visual", label: "Visual", show: latestAssistant?.visualSuggestions && latestAssistant.visualSuggestions.length > 0 },
  ].filter((v) => v.show);

  return (
    <div className="space-y-6">
      {/* Input Panel */}
      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>AI Creativity Sandbox</CardTitle>
              <p className="text-sm text-gray-500">Select a type, describe your business, get AI strategies. Chat persists across sessions.</p>
            </div>
            {chat.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleNewProject}>New Project</Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {TYPES.map((type) => (
                <Button
                  key={type}
                  variant={request.type === type ? "primary" : "outline"}
                  size="sm"
                  onClick={() => handleTypeChange(type)}
                >
                  {type.replace(/_/g, " ")}
                </Button>
              ))}
            </div>

            <Input
              label="Business Context"
              placeholder={TYPE_PLACEHOLDERS[request.type] || "Describe your business..."}
              value={request.context}
              onChange={(e) => setRequest({ ...request, context: e.target.value })}
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="Target Audience"
                placeholder="e.g., Health-conscious urban professionals"
                value={request.targetAudience || ""}
                onChange={(e) => setRequest({ ...request, targetAudience: e.target.value })}
              />
              <Input
                label="Tone"
                placeholder="e.g., Professional, playful, authoritative"
                value={request.tone || ""}
                onChange={(e) => setRequest({ ...request, tone: e.target.value })}
              />
            </div>

            <Button variant="primary" onClick={handleGenerate} disabled={loading || !request.context} className="w-full">
              {loading ? "Generating..." : `Generate ${request.type.replace(/_/g, " ")} Ideas`}
            </Button>

            {error && (
              <div className="rounded-lg border border-red-800/30 bg-red-900/20 p-3 text-sm text-red-300">{error}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chat History */}
      {chat.length > 0 && (
        <Card variant="bordered">
          <CardContent className="p-4">
            <div className="space-y-3 max-h-[500px] overflow-y-auto mb-4">
              {chat.map((msg, i) => (
                <div key={i} className={`rounded-lg p-3 ${msg.role === "user" ? "bg-blue-900/20 border border-blue-800/30 ml-8" : "bg-black/30 border border-white/10 mr-8"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="default" size="sm">{msg.type.replace(/_/g, " ")}</Badge>
                    <span className="text-[10px] text-gray-500">{msg.role === "user" ? "You" : "AI"}</span>
                  </div>
                  <p className="text-sm text-gray-300">{msg.content}</p>
                </div>
              ))}
              {loading && (
                <div className="bg-black/30 border border-white/10 rounded-lg p-3 mr-8">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    Generating...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Follow-up */}
            <div className="flex gap-2 border-t border-white/10 pt-4">
              <input
                type="text"
                placeholder="Ask a follow-up question..."
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFollowUp()}
                className="flex-1 rounded-lg border border-gray-300 bg-white text-black px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
              />
              <Button variant="primary" onClick={handleFollowUp} disabled={loading || !followUp.trim()}>
                {loading ? "..." : "Send"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabbed Results - Only shows active type */}
      {latestAssistant && viewTabs.length > 0 && (
        <Card variant="bordered">
          <CardContent className="p-4">
            <div className="flex gap-2 border-b border-white/10 pb-3 mb-4">
              {viewTabs.map((v) => (
                <Button
                  key={v.key}
                  variant={activeView === v.key ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setActiveView(v.key)}
                >
                  {v.label}
                </Button>
              ))}
            </div>

            {activeView === "ideas" && latestAssistant.ideas && latestAssistant.ideas.length > 0 && (
              <div className="space-y-3">
                {latestAssistant.ideas.map((idea, i) => (
                  <IdeaCard key={i} idea={idea} />
                ))}
              </div>
            )}

            {activeView === "taglines" && latestAssistant.taglines && latestAssistant.taglines.length > 0 && (
              <div className="space-y-2">
                {latestAssistant.taglines.map((t, i) => (
                  <div key={i} className="rounded-lg bg-purple-900/20 border border-purple-800/30 px-4 py-3 text-sm text-purple-300">
                    &ldquo;{t}&rdquo;
                  </div>
                ))}
              </div>
            )}

            {activeView === "names" && latestAssistant.nameSuggestions && latestAssistant.nameSuggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {latestAssistant.nameSuggestions.map((n, i) => (
                  <Badge key={i} variant="purple">{n}</Badge>
                ))}
              </div>
            )}

            {activeView === "visual" && latestAssistant.visualSuggestions && latestAssistant.visualSuggestions.length > 0 && (
              <div className="space-y-2">
                {latestAssistant.visualSuggestions.map((v, i) => (
                  <div key={i} className="rounded-lg bg-blue-900/20 border border-blue-800/20 px-4 py-3 text-sm text-blue-300">{v}</div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function IdeaCard({ idea }: { idea: CreativeIdea }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/40 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h5 className="text-sm font-medium text-gray-200">{idea.title}</h5>
        <div className="flex gap-1">
          <Badge variant={idea.estimatedImpact === "HIGH" ? "success" : idea.estimatedImpact === "MEDIUM" ? "warning" : "default"} size="sm">
            {idea.estimatedImpact} impact
          </Badge>
          <Badge variant={idea.estimatedCost === "HIGH" ? "danger" : idea.estimatedCost === "MEDIUM" ? "warning" : "success"} size="sm">
            {idea.estimatedCost} cost
          </Badge>
        </div>
      </div>
      <p className="mb-2 text-xs text-gray-400">{idea.description}</p>
      <div className="flex flex-wrap gap-1 mb-2">
        {idea.channels.map((ch, i) => (
          <Badge key={i} variant="default" size="sm">{ch}</Badge>
        ))}
      </div>
      {idea.implementationSteps.length > 0 && (
        <div className="border-t border-white/10 pt-2">
          <p className="mb-1 text-xs font-medium text-gray-400">Next Steps</p>
          <ol className="space-y-0.5">
            {idea.implementationSteps.map((step, i) => (
              <li key={i} className="text-xs text-gray-400">{i + 1}. {step}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
