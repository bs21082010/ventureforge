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

  const handleTypeChange = (type: CreativityRequest["type"]) => {
    setRequest((prev) => ({ ...prev, type }));
    setChat([]);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!request.context) return;
    setLoading(true);
    setError(null);

    const userMsg: ChatMessage = { role: "user", content: request.context };
    setChat((prev) => [...prev, userMsg]);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "creativity", ...request }),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        setError(data.error || "Generation failed. Please try again.");
        setChat((prev) => prev.slice(0, -1));
        return;
      }
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: `Here are ${request.type.replace(/_/g, " ").toLowerCase()} ideas for your business:`,
        ideas: data.ideas || [],
        taglines: data.taglines || [],
        nameSuggestions: data.nameSuggestions || [],
        visualSuggestions: data.visualSuggestions || [],
      };
      setChat((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError("Network error. Please try again.");
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

    const userMsg: ChatMessage = { role: "user", content: question };
    setChat((prev) => [...prev, userMsg]);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "creativity",
          ...request,
          context: `${request.context}\n\nFollow-up: ${question}\n\nProvide a focused, specific answer to this follow-up question. Return the same JSON format but with 3-4 targeted ideas.`,
        }),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        setChat((prev) => [...prev, { role: "assistant", content: data.error || "Failed to generate response." }]);
      } else {
        const assistantMsg: ChatMessage = {
          role: "assistant",
          content: `Here's my response to your follow-up:`,
          ideas: data.ideas || [],
          taglines: data.taglines || [],
          nameSuggestions: data.nameSuggestions || [],
          visualSuggestions: data.visualSuggestions || [],
        };
        setChat((prev) => [...prev, assistantMsg]);
      }
    } catch {
      setChat((prev) => [...prev, { role: "assistant", content: "Network error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Panel */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>AI Creativity Sandbox</CardTitle>
          <p className="text-sm text-gray-500">Select a type, describe your business, and get AI-powered creative strategies.</p>
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

      {/* Chat / Results */}
      {chat.length > 0 && (
        <Card variant="bordered">
          <CardContent className="p-4">
            <div className="space-y-4 max-h-[600px] overflow-y-auto mb-4">
              {chat.map((msg, i) => (
                <div key={i} className={`rounded-lg p-4 ${msg.role === "user" ? "bg-blue-900/20 border border-blue-800/30 ml-8" : "bg-black/30 border border-white/10 mr-8"}`}>
                  <p className="text-sm mb-2 text-gray-300">{msg.content}</p>

                  {msg.ideas && msg.ideas.length > 0 && (
                    <div className="space-y-3 mt-3">
                      {msg.ideas.map((idea, j) => (
                        <IdeaCard key={j} idea={idea} />
                      ))}
                    </div>
                  )}

                  {msg.taglines && msg.taglines.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-400 mb-1">Taglines:</p>
                      <div className="flex flex-wrap gap-1">
                        {msg.taglines.map((t, j) => (
                          <span key={j} className="text-xs bg-purple-900/30 border border-purple-800/30 text-purple-300 rounded px-2 py-1">"{t}"</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {msg.nameSuggestions && msg.nameSuggestions.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-400 mb-1">Names:</p>
                      <div className="flex flex-wrap gap-1">
                        {msg.nameSuggestions.map((n, j) => (
                          <Badge key={j} variant="purple" size="sm">{n}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {msg.visualSuggestions && msg.visualSuggestions.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-400 mb-1">Visual Direction:</p>
                      <div className="flex flex-wrap gap-1">
                        {msg.visualSuggestions.map((v, j) => (
                          <span key={j} className="text-xs bg-blue-900/20 border border-blue-800/20 text-blue-300 rounded px-2 py-1">{v}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {loading && chat[chat.length - 1]?.role !== "user" && (
                <div className="bg-black/30 border border-white/10 rounded-lg p-4 mr-8">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    Generating ideas...
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Follow-up Input */}
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
    </div>
  );
}

function IdeaCard({ idea }: { idea: CreativeIdea }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/40 p-3">
      <div className="mb-1 flex items-center justify-between">
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
      <div className="flex flex-wrap gap-1">
        {idea.channels.map((ch, i) => (
          <Badge key={i} variant="default" size="sm">{ch}</Badge>
        ))}
      </div>
      {idea.implementationSteps.length > 0 && (
        <div className="mt-2 border-t border-white/10 pt-2">
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
