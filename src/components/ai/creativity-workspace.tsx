"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CreativityRequest, CreativeIdea } from "@/types/ai";

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
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  useEffect(() => {
    if (request.context) {
      try {
        const saved = localStorage.getItem(getStorageKey(request.context));
        if (saved) {
          setChat(JSON.parse(saved));
        } else {
          setChat([]);
        }
      } catch { setChat([]); }
    }
  }, [request.context]);

  useEffect(() => {
    if (request.context && chat.length > 0) {
      try { localStorage.setItem(getStorageKey(request.context), JSON.stringify(chat)); } catch {}
    }
  }, [chat, request.context]);

  const handleTypeChange = (type: CreativityRequest["type"]) => {
    setRequest((prev) => ({ ...prev, type }));
  };

  const handleNewProject = () => {
    if (request.context) {
      try { localStorage.removeItem(getStorageKey(request.context)); } catch {}
    }
    setRequest({ planId: "", type: "MARKETING", context: "", targetAudience: "", tone: "professional" });
    setChat([]);
    setError(null);
    setFollowUp("");
  };

  const callAI = async (question: string, isFollowUp: boolean) => {
    const body: Record<string, unknown> = {
      action: "creativity",
      type: request.type,
      context: request.context,
      targetAudience: request.targetAudience,
      tone: request.tone,
    };
    if (isFollowUp) body.followUp = question;

    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || "Generation failed");
    return data;
  };

  const handleGenerate = async () => {
    if (!request.context) return;
    setLoading(true);
    setError(null);
    setChat((prev) => [...prev, { role: "user", content: request.context, type: request.type }]);

    try {
      const data = await callAI(request.context, false);
      setChat((prev) => [...prev, {
        role: "assistant", content: "", type: request.type,
        ideas: data.ideas || [], taglines: data.taglines || [],
        nameSuggestions: data.nameSuggestions || [], visualSuggestions: data.visualSuggestions || [],
      }]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed";
      setError(msg);
      setChat((prev) => prev.slice(0, -1));
    } finally { setLoading(false); }
  };

  const handleFollowUp = async () => {
    if (!followUp.trim() || chat.length === 0) return;
    const question = followUp.trim();
    setFollowUp("");
    setLoading(true);
    setChat((prev) => [...prev, { role: "user", content: question, type: request.type }]);

    try {
      const data = await callAI(question, true);
      setChat((prev) => [...prev, {
        role: "assistant", content: "", type: request.type,
        ideas: data.ideas || [], taglines: data.taglines || [],
        nameSuggestions: data.nameSuggestions || [], visualSuggestions: data.visualSuggestions || [],
      }]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed";
      setChat((prev) => [...prev, { role: "assistant", content: msg, type: request.type }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <Card variant="bordered">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-100">AI Creativity Sandbox</h2>
              <p className="text-sm text-gray-500">Pick a type, describe your business, get ideas. Chat saves until you start new project.</p>
            </div>
            {chat.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleNewProject}>New Project</Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {TYPES.map((type) => (
              <Button key={type} variant={request.type === type ? "primary" : "outline"} size="sm" onClick={() => handleTypeChange(type)}>
                {type.replace(/_/g, " ")}
              </Button>
            ))}
          </div>

          <Input
            placeholder={TYPE_PLACEHOLDERS[request.type] || "Describe your business..."}
            value={request.context}
            onChange={(e) => setRequest({ ...request, context: e.target.value })}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              placeholder="e.g., Health-conscious urban professionals"
              value={request.targetAudience || ""}
              onChange={(e) => setRequest({ ...request, targetAudience: e.target.value })}
            />
            <Input
              placeholder="e.g., Professional, playful, authoritative"
              value={request.tone || ""}
              onChange={(e) => setRequest({ ...request, tone: e.target.value })}
            />
          </div>

          <Button variant="primary" onClick={handleGenerate} disabled={loading || !request.context} className="w-full">
            {loading ? "Generating..." : `Generate ${request.type.replace(/_/g, " ")} Ideas`}
          </Button>
          {error && <div className="rounded-lg border border-red-800/30 bg-red-900/20 p-3 text-sm text-red-300">{error}</div>}
        </CardContent>
      </Card>

      {chat.length > 0 && (
        <Card variant="bordered">
          <CardContent className="p-4">
            <div className="space-y-4 max-h-[600px] overflow-y-auto mb-4">
              {chat.map((msg, i) => (
                <div key={i} className={`rounded-lg p-3 ${msg.role === "user" ? "bg-blue-900/20 border border-blue-800/30 ml-8" : "bg-black/30 border border-white/10 mr-8"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="default" size="sm">{msg.type.replace(/_/g, " ")}</Badge>
                    <span className="text-[10px] text-gray-500">{msg.role === "user" ? "You" : "AI"}</span>
                  </div>
                  {msg.content && <p className="text-sm text-gray-300 mb-2">{msg.content}</p>}

                  {msg.type === "MARKETING" && msg.ideas && msg.ideas.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {msg.ideas.map((idea, j) => (
                        <div key={j} className="rounded bg-white/5 border border-white/10 p-3">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="text-sm font-medium text-gray-200">{idea.title}</h5>
                            <div className="flex gap-1">
                              <Badge variant={idea.estimatedImpact === "HIGH" ? "success" : idea.estimatedImpact === "MEDIUM" ? "warning" : "default"} size="sm">{idea.estimatedImpact}</Badge>
                              <Badge variant={idea.estimatedCost === "HIGH" ? "danger" : idea.estimatedCost === "MEDIUM" ? "warning" : "success"} size="sm">{idea.estimatedCost}</Badge>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 mb-1">{idea.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {idea.channels.map((ch, k) => (
                              <Badge key={k} variant="default" size="sm">{ch}</Badge>
                            ))}
                          </div>
                          {idea.implementationSteps.length > 0 && (
                            <div className="mt-2 border-t border-white/10 pt-2">
                              <p className="text-[10px] font-medium text-gray-500 mb-1">Steps</p>
                              <ol className="space-y-0.5">
                                {idea.implementationSteps.map((step, k) => (
                                  <li key={k} className="text-[11px] text-gray-400">{k + 1}. {step}</li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.type === "BRANDING" && msg.visualSuggestions && msg.visualSuggestions.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {msg.visualSuggestions.map((v, j) => (
                        <div key={j} className="rounded bg-blue-900/20 border border-blue-800/20 px-3 py-2 text-xs text-blue-300">{v}</div>
                      ))}
                    </div>
                  )}

                  {msg.type === "BRANDING" && msg.taglines && msg.taglines.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {msg.taglines.map((t, j) => (
                        <div key={j} className="rounded bg-purple-900/20 border border-purple-800/30 px-3 py-2 text-xs text-purple-300">
                          &ldquo;{t}&rdquo;
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.type === "NAMING" && msg.nameSuggestions && msg.nameSuggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {msg.nameSuggestions.map((n, j) => (
                        <Badge key={j} variant="purple">{n}</Badge>
                      ))}
                    </div>
                  )}

                  {msg.type === "NAMING" && msg.taglines && msg.taglines.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {msg.taglines.map((t, j) => (
                        <div key={j} className="rounded bg-purple-900/20 border border-purple-800/30 px-3 py-2 text-xs text-purple-300">
                          &ldquo;{t}&rdquo;
                        </div>
                      ))}
                    </div>
                  )}

                  {(msg.type === "CUSTOMER_ENGAGEMENT" || msg.type === "CONTENT") && msg.ideas && msg.ideas.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {msg.ideas.map((idea, j) => (
                        <div key={j} className="rounded bg-white/5 border border-white/10 p-3">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="text-sm font-medium text-gray-200">{idea.title}</h5>
                            <div className="flex gap-1">
                              <Badge variant={idea.estimatedImpact === "HIGH" ? "success" : idea.estimatedImpact === "MEDIUM" ? "warning" : "default"} size="sm">{idea.estimatedImpact}</Badge>
                              <Badge variant={idea.estimatedCost === "HIGH" ? "danger" : idea.estimatedCost === "MEDIUM" ? "warning" : "success"} size="sm">{idea.estimatedCost}</Badge>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 mb-1">{idea.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {idea.channels.map((ch, k) => (
                              <Badge key={k} variant="default" size="sm">{ch}</Badge>
                            ))}
                          </div>
                          {idea.implementationSteps.length > 0 && (
                            <div className="mt-2 border-t border-white/10 pt-2">
                              <p className="text-[10px] font-medium text-gray-500 mb-1">Steps</p>
                              <ol className="space-y-0.5">
                                {idea.implementationSteps.map((step, k) => (
                                  <li key={k} className="text-[11px] text-gray-400">{k + 1}. {step}</li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
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

            <div className="flex gap-2 border-t border-white/10 pt-4">
              <input
                type="text"
                placeholder="Ask a follow-up..."
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
    </div>
  );
}
