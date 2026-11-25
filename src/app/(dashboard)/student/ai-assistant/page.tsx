"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import {
  Sparkles,
  Send,
  Bot,
  User,
  ArrowRight,
  HelpCircle,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { CareerGuidanceResponse } from "@/lib/ai/career-assistant";
import type { InterviewQuestion, InterviewEvaluation } from "@/lib/ai/mock-interview";
import type { SkillGapAnalysis } from "@/lib/ai/skill-gap";

interface ChatMessage {
  role: "assistant" | "user";
  content: string;
  data?: CareerGuidanceResponse;
}

export default function AiAssistantPage() {
  const { user, userSkills } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Mock Interview State
  const [targetRole, setTargetRole] = useState("Full-Stack Software Engineer");
  const [experienceLevel, setExperienceLevel] = useState<"entry" | "mid" | "senior">("entry");
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [interviewError, setInterviewError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);

  // Skill Gap Diagnostics State
  const [gapTargetRole, setGapTargetRole] = useState("Full-Stack Cloud Engineer");
  const [gapRequirementsInput, setGapRequirementsInput] = useState("TypeScript, Next.js, PostgreSQL, Docker, CI/CD");
  const [gapAnalyzing, setGapAnalyzing] = useState(false);
  const [gapError, setGapError] = useState<string | null>(null);
  const [gapResult, setGapResult] = useState<SkillGapAnalysis | null>(null);

  const handleAnalyzeGap = async () => {
    setGapAnalyzing(true);
    setGapError(null);
    try {
      const skillNames = userSkills
        .map((us) => us.skill?.name)
        .filter((s): s is string => Boolean(s));

      const res = await fetch("/api/ai/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole: gapTargetRole.trim() || "Software Engineer",
          candidateSkills: skillNames,
          jobRequirements: gapRequirementsInput
            .split(",")
            .map((r) => r.trim())
            .filter(Boolean),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setGapError(json.error || "Skill gap analysis unavailable.");
      } else {
        setGapResult(json.data);
      }
    } catch {
      setGapError("Network error while analyzing skill gap.");
    } finally {
      setGapAnalyzing(false);
    }
  };

  useEffect(() => {
    const firstName = user?.full_name?.split(" ")[0] || "Learner";
    fetch("/api/ai/career-assistant")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const savedMsgs = json?.conversation?.messages;
        if (Array.isArray(savedMsgs) && savedMsgs.length > 0) {
          setMessages(
            savedMsgs.map((m: { role: "assistant" | "user"; content: string; metadata?: { guidance?: CareerGuidanceResponse } }) => ({
              role: m.role,
              content: m.content,
              data: m.metadata?.guidance,
            }))
          );
        } else {
          setMessages([
            {
              role: "assistant",
              content: `Hello ${firstName}! Ask me about engineering career paths, skill-gap strategy, or portfolio projects tailored to your profile.`,
            },
          ]);
        }
      })
      .catch(() => {
        setMessages([
          {
            role: "assistant",
            content: `Hello ${firstName}! Ask me about career paths or projects you would like to pursue.`,
          },
        ]);
      });
  }, [user?.full_name]);

  const handleSendMessage = async (customPrompt?: string) => {
    const text = (customPrompt || inputPrompt).trim();
    if (!text || isGenerating) return;

    setChatError(null);
    const newMsgs = [...messages, { role: "user" as const, content: text }];
    setMessages(newMsgs);
    setInputPrompt("");
    setIsGenerating(true);

    try {
      const skillNames = userSkills
        .map((s) => s.skill?.name)
        .filter((x): x is string => Boolean(x));

      const res = await fetch("/api/ai/career-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interests: text,
          background: user?.bio || "",
          skills: skillNames,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setChatError(json.error || "AI guidance service returned an error.");
        return;
      }

      const guidance: CareerGuidanceResponse = json.data;
      setMessages([
        ...newMsgs,
        {
          role: "assistant",
          content: guidance.summary,
          data: guidance,
        },
      ]);
    } catch {
      setChatError("Unable to reach AI Career Advisor endpoint. Please check your connection.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartInterview = async () => {
    if (!targetRole.trim()) return;
    setInterviewError(null);
    setIsEvaluating(true);
    try {
      const res = await fetch("/api/ai/mock-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          targetRole: targetRole.trim(),
          experienceLevel,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setInterviewError(json.error || "Failed to generate questions.");
      } else {
        setInterviewQuestions(json.data || []);
        setCurrentQIndex(0);
        setUserAnswer("");
        setEvaluation(null);
      }
    } catch {
      setInterviewError("Network error contacting AI interview engine.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleEvaluateAnswer = async () => {
    if (!userAnswer.trim() || isEvaluating) return;
    setInterviewError(null);
    setIsEvaluating(true);
    const q = interviewQuestions[currentQIndex];
    try {
      const res = await fetch("/api/ai/mock-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluate",
          targetRole: targetRole.trim(),
          experienceLevel,
          question: q.question,
          expectedConcepts: q.expectedKeyConcepts,
          candidateAnswer: userAnswer,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setInterviewError(json.error || "Failed to evaluate answer.");
      } else {
        setEvaluation(json.data);
      }
    } catch {
      setInterviewError("Network error while evaluating interview response.");
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">
            AI Career Advisor & Interview Studio
          </h1>
          <Badge variant="default">
            <Sparkles className="w-3 h-3" />
            Gemini Live
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-[#8FA69B] mt-1">
          Context-aware guidance using your saved profile, skills, and courses, plus AI technical interview practice.
        </p>
      </div>

      <Tabs defaultValue="guidance" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="guidance">Career Trajectory Chat</TabsTrigger>
          <TabsTrigger value="interview">AI Mock Interview Studio</TabsTrigger>
          <TabsTrigger value="skillgap">Skill Gap Diagnostics</TabsTrigger>
        </TabsList>

        <TabsContent value="guidance" className="space-y-4">
          {chatError && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{chatError}</span>
            </div>
          )}

          <Card className="flex flex-col h-[580px] overflow-hidden">
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${
                    m.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs ${
                      m.role === "user"
                        ? "bg-[#10B981] text-slate-950 font-bold"
                        : "bg-[#0F271D] text-[#00DC82] border border-[#16382C]"
                    }`}
                  >
                    {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`space-y-3 max-w-[85%] ${m.role === "user" ? "text-right" : "text-left"}`}>
                    <div
                      className={`inline-block p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        m.role === "user"
                          ? "bg-[#10B981] text-slate-950 font-medium rounded-tr-none text-left"
                          : "bg-[#07130E] text-[#E6F4EA] border border-[#143326] rounded-tl-none"
                      }`}
                    >
                      {m.content}
                    </div>

                    {m.data?.suggestedPaths && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-left">
                        {m.data.suggestedPaths.map((path, i) => (
                          <div
                            key={i}
                            className="p-4 rounded-xl bg-[#07130E] border border-[#16382C] space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-[#F0FDF4]">
                                {path.title}
                              </span>
                              <Badge variant="emerald">{path.matchScore}% Fit</Badge>
                            </div>
                            <p className="text-[11px] text-[#8FA69B] leading-relaxed">
                              {path.reasoning}
                            </p>
                            <div className="text-[11px] text-[#00DC82] font-mono">
                              Range: {path.salaryRange}
                            </div>
                            <div className="pt-2 border-t border-[#143326] text-[11px] text-[#E6F4EA]">
                              <strong>First Step:</strong> {path.recommendedFirstStep}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isGenerating && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#10B981]/20 text-[#00DC82] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 animate-spin" />
                  </div>
                  <span className="text-xs text-[#8FA69B] animate-pulse">
                    Generating AI career analysis...
                  </span>
                </div>
              )}
            </div>

            <div className="p-3 bg-[#07130E] border-t border-[#143326] flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-[#5D7A6E] text-[11px] uppercase tracking-wider shrink-0">
                Prompts:
              </span>
              <button
                onClick={() => handleSendMessage("Which backend or full-stack role fits my current skills?")}
                className="px-2.5 py-1 rounded-lg bg-[#0A1913] border border-[#143326] text-[#8FA69B] hover:text-[#F0FDF4] whitespace-nowrap cursor-pointer"
              >
                Role Recommendation
              </button>
              <button
                onClick={() => handleSendMessage("What capstone project should I build next for my portfolio?")}
                className="px-2.5 py-1 rounded-lg bg-[#0A1913] border border-[#143326] text-[#8FA69B] hover:text-[#F0FDF4] whitespace-nowrap cursor-pointer"
              >
                Portfolio Capstone Ideas
              </button>
              <button
                onClick={() => handleSendMessage("How can I bridge gaps toward AI Engineering roles?")}
                className="px-2.5 py-1 rounded-lg bg-[#0A1913] border border-[#143326] text-[#8FA69B] hover:text-[#F0FDF4] whitespace-nowrap cursor-pointer"
              >
                AI Engineering Path
              </button>
            </div>

            <div className="p-3 sm:p-4 bg-[#081510] border-t border-[#143326] flex items-center gap-2">
              <Input
                placeholder="Ask about target roles, skills, or portfolio projects..."
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 bg-[#06100C] border-[#143326] text-[#F0FDF4]"
              />
              <Button
                variant="gradient"
                size="sm"
                disabled={isGenerating || !inputPrompt.trim()}
                onClick={() => handleSendMessage()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="interview" className="space-y-4">
          {interviewError && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{interviewError}</span>
            </div>
          )}

          <Card className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-[#143326]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                <div>
                  <label className="text-[11px] font-semibold text-[#8FA69B] block mb-1">
                    Target Interview Role
                  </label>
                  <Input
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Full-Stack Engineer, Cloud SRE"
                    className="bg-[#06100C] border-[#143326] text-[#F0FDF4]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#8FA69B] block mb-1">
                    Experience Calibration
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value as "entry" | "mid" | "senior")}
                    className="w-full h-[42px] rounded-lg border border-[#143326] bg-[#06100C] px-3 text-xs text-[#F0FDF4]"
                  >
                    <option value="entry">Entry Level / Intern</option>
                    <option value="mid">Mid-Level</option>
                    <option value="senior">Senior Level</option>
                  </select>
                </div>
              </div>

              <Button
                variant="gradient"
                size="sm"
                onClick={handleStartInterview}
                disabled={isEvaluating}
                className="text-xs shrink-0"
              >
                {isEvaluating && interviewQuestions.length === 0
                  ? "Generating..."
                  : "Generate 3 Questions"}
              </Button>
            </div>

            {interviewQuestions.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#10B981]/10 border border-[#16382C] mx-auto flex items-center justify-center text-[#00DC82]">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-[#F0FDF4]">
                  Ready for realistic technical interview practice?
                </h4>
                <p className="text-xs text-[#8FA69B] max-w-sm mx-auto">
                  Select your target discipline above and click &lsquo;Generate 3 Questions&rsquo; to begin.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-[#07130E] border border-[#143326] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#00DC82] uppercase tracking-wider">
                      Question {currentQIndex + 1} of {interviewQuestions.length} ·{" "}
                      {interviewQuestions[currentQIndex].topic}
                    </span>
                    <Badge variant="secondary">
                      {interviewQuestions[currentQIndex].difficulty.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-[#F0FDF4] leading-relaxed">
                    {interviewQuestions[currentQIndex].question}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-[#E6F4EA] block mb-2">
                    Your Technical Response:
                  </label>
                  <textarea
                    rows={5}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Explain architecture choices, failure handling, trade-offs, and debugging steps..."
                    className="w-full rounded-xl border border-[#143326] bg-[#06100C] p-3 text-xs sm:text-sm text-[#F0FDF4] placeholder:text-[#5D7A6E] focus:border-[#10B981] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentQIndex === 0}
                    onClick={() => {
                      setCurrentQIndex((p) => p - 1);
                      setEvaluation(null);
                      setUserAnswer("");
                    }}
                    className="text-xs"
                  >
                    Previous Question
                  </Button>

                  <Button
                    variant="gradient"
                    size="sm"
                    disabled={isEvaluating || !userAnswer.trim()}
                    onClick={handleEvaluateAnswer}
                    className="text-xs"
                  >
                    {isEvaluating ? "Evaluating..." : "Submit Answer For Review"}
                  </Button>
                </div>

                {evaluation && (
                  <div className="p-5 rounded-2xl bg-[#07130E] border border-[#10B981]/40 space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={evaluation.passedCriteria ? "emerald" : "amber"}>
                        {evaluation.passedCriteria ? "CRITERIA MET" : "NEEDS DEPTH"}
                      </Badge>
                      <span className="text-xs text-[#8FA69B]">Score (AI Practice):</span>
                      <span className="text-base font-bold text-[#F0FDF4]">
                        {evaluation.score} / 100
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#E6F4EA] leading-relaxed">
                      {evaluation.detailedFeedback}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-[#0A1913] border border-[#143326]">
                        <span className="text-[#00DC82] font-semibold block mb-1">
                          Strengths Demonstrated
                        </span>
                        <ul className="space-y-1 text-[#8FA69B]">
                          {evaluation.strengths.map((s, i) => (
                            <li key={i}>• {s}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-3 rounded-xl bg-[#0A1913] border border-[#143326]">
                        <span className="text-[#F59E0B] font-semibold block mb-1">
                          Areas to Deepen
                        </span>
                        <ul className="space-y-1 text-[#8FA69B]">
                          {evaluation.areasForImprovement.map((a, i) => (
                            <li key={i}>• {a}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0A1913] border border-[#143326] text-xs space-y-1">
                      <span className="text-[#22D3EE] font-semibold block">
                        Model Response Reference:
                      </span>
                      <p className="text-[#8FA69B] italic leading-relaxed">
                        &ldquo;{evaluation.idealAnswerSample}&rdquo;
                      </p>
                    </div>

                    {currentQIndex < interviewQuestions.length - 1 && (
                      <div className="text-right pt-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setCurrentQIndex((p) => p + 1);
                            setUserAnswer("");
                            setEvaluation(null);
                          }}
                          className="text-xs"
                        >
                          Next Question <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="skillgap" className="space-y-4">
          {gapError && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{gapError}</span>
            </div>
          )}

          <Card className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#8FA69B] block">
                  Target Engineering Role
                </label>
                <Input
                  value={gapTargetRole}
                  onChange={(e) => setGapTargetRole(e.target.value)}
                  placeholder="e.g. Cloud SRE, AI Systems Engineer"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#8FA69B] block">
                  Job Requirements (comma-separated)
                </label>
                <Input
                  value={gapRequirementsInput}
                  onChange={(e) => setGapRequirementsInput(e.target.value)}
                  placeholder="TypeScript, Go, Kubernetes, PostgreSQL"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <span className="text-xs text-[#8FA69B]">
                Comparing against {userSkills.length} verified skills on your profile
              </span>
              <Button
                variant="gradient"
                disabled={gapAnalyzing}
                onClick={handleAnalyzeGap}
                className="gap-2 text-xs rounded-full"
              >
                <Sparkles className={`w-3.5 h-3.5 ${gapAnalyzing ? "animate-spin" : ""}`} />
                {gapAnalyzing ? "Analyzing Gaps..." : "Run Live Skill Gap Analysis"}
              </Button>
            </div>
          </Card>

          {gapResult && (
            <Card className="p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#143326]">
                <div>
                  <h3 className="text-lg font-bold text-[#F0FDF4]">
                    {gapResult.targetRole} Diagnostics
                  </h3>
                  <p className="text-xs text-[#8FA69B]">
                    Estimated {gapResult.estimatedWeeksToBridge} weeks to close critical skill gaps
                  </p>
                </div>
                <Badge variant={gapResult.coverageScore >= 70 ? "emerald" : "amber"}>
                  {gapResult.coverageScore}% Coverage
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[#07130E] border border-[#143326] space-y-2">
                  <span className="font-semibold text-[#00DC82] block">Matched Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {gapResult.matchedSkills.length === 0 ? (
                      <span className="text-[#8FA69B]">No matched prerequisites yet.</span>
                    ) : (
                      gapResult.matchedSkills.map((sk) => (
                        <Badge key={sk} variant="emerald" className="text-[10px]">{sk}</Badge>
                      ))
                    )}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#07130E] border border-[#143326] space-y-2">
                  <span className="font-semibold text-[#F59E0B] block">Missing Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {gapResult.missingSkills.map((sk) => (
                      <Badge key={sk} variant="amber" className="text-[10px]">{sk}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {gapResult.skillBreakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#07130E] border border-[#143326] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#F0FDF4]">{item.skill}</span>
                        <Badge
                          variant={
                            item.status === "matched"
                              ? "emerald"
                              : item.status === "partial"
                              ? "cyan"
                              : "amber"
                          }
                          className="text-[10px]"
                        >
                          {item.status} &middot; {item.importance}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-[#8FA69B] mt-1">{item.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
