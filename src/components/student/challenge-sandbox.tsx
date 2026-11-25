"use client";

import React, { useEffect, useState } from "react";
import { Check, Copy, Eye, EyeOff, Play, RotateCcw, Terminal, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { LessonChallenge } from "@/types";

interface ChallengeSandboxProps {
  challenge: LessonChallenge;
  courseCategory?: string;
}

const JS_RUNNABLE_LANGS = new Set(["js", "javascript", "ts", "typescript", "jsx", "tsx"]);

function detectSandboxMode(starterCode: string, solutionCode: string): "js" | "reference" {
  const sample = `${starterCode}\n${solutionCode}`.toLowerCase();
  if (
    sample.includes("package main") ||
    sample.includes("func ") ||
    sample.includes("apiversion:") ||
    sample.includes("histogram_quantile") ||
    sample.includes("docker ") ||
    sample.includes("kind: deployment")
  ) {
    return "reference";
  }
  if (
    sample.includes("function ") ||
    sample.includes("const ") ||
    sample.includes("async function") ||
    sample.includes("export ") ||
    sample.includes("return ")
  ) {
    return "js";
  }
  return "reference";
}

function stripBasicTypeScript(source: string): string {
  return source
    .replace(/^export\s+/gm, "")
    .replace(/^import\s+.*?;?\s*$/gm, "")
    .replace(/:\s*(string|number|boolean|void|unknown|any)(\[\])?/g, "");
}

/**
 * Interactive Lesson Challenge Editor + Sandboxed JS Runner (uses origin-isolated iframe sandbox).
 */
export function ChallengeSandbox({ challenge, courseCategory }: ChallengeSandboxProps) {
  const [code, setCode] = useState(challenge.starter_code || "");
  const [showSolution, setShowSolution] = useState(false);
  const [copied, setCopied] = useState(false);
  const [logs, setLogs] = useState<Array<{ type: "log" | "error" | "info"; text: string }>>([]);
  const [running, setRunning] = useState(false);
  const [runCounter, setRunCounter] = useState(0);

  const mode = detectSandboxMode(challenge.starter_code || "", challenge.solution_code || "");
  const isJsRunnable = mode === "js" && (!courseCategory || JS_RUNNABLE_LANGS.has("js"));

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const payload = event.data as {
        source?: string;
        runId?: number;
        logs?: Array<{ type: "log" | "error" | "info"; text: string }>;
      };
      if (payload?.source !== "unlocked-sandbox") return;
      setLogs(payload.logs || []);
      setRunning(false);
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleRun = () => {
    if (!isJsRunnable) {
      const targetLines = (challenge.solution_code || "")
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("#") && !l.startsWith("//"));
      const userLines = code
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("#") && !l.startsWith("//"));
      const keyTokens = targetLines
        .flatMap((l) => l.split(/[\s(){}:;,=]+/))
        .filter((t) => t.length >= 4)
        .slice(0, 12);
      const matched = keyTokens.filter((t) => code.includes(t));
      setLogs([
        {
          type: "info",
          text: `Non-JS configuration/service code check (${userLines.length} lines edited). Matched ${matched.length}/${keyTokens.length} core architectural tokens vs reference specification.`,
        },
        ...(matched.length >= Math.max(2, Math.floor(keyTokens.length * 0.4))
          ? [{ type: "log" as const, text: "Structural tokens look solid! Compare carefully with the Reference Solution below." }]
          : [{ type: "error" as const, text: "Keep building out the module structure or toggle Reveal Solution to compare patterns." }]),
      ]);
      return;
    }

    setRunning(true);
    setLogs([{ type: "info", text: "Executing inside isolated iframe sandbox..." }]);
    const id = runCounter + 1;
    setRunCounter(id);

    const prepared = stripBasicTypeScript(code);
    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-scripts");
    iframe.style.display = "none";

    const doc = `<!doctype html><html><body><script>
      const out = [];
      const fmt = (v) => typeof v === 'object' ? JSON.stringify(v) : String(v);
      const console = {
        log: (...args) => out.push({ type: 'log', text: args.map(fmt).join(' ') }),
        error: (...args) => out.push({ type: 'error', text: args.map(fmt).join(' ') }),
        warn: (...args) => out.push({ type: 'info', text: args.map(fmt).join(' ') }),
      };
      try {
        const fn = new Function('console', ${JSON.stringify(prepared + "\n; out.push({ type: 'info', text: 'Syntax parsed & executed without uncaught runtime exceptions.' });")});
        fn(console);
      } catch (err) {
        out.push({ type: 'error', text: err && err.message ? err.message : String(err) });
      }
      parent.postMessage({ source: 'unlocked-sandbox', runId: ${id}, logs: out }, '*');
    <\/script></body></html>`;

    iframe.srcdoc = doc;
    document.body.appendChild(iframe);
    window.setTimeout(() => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      setRunning(false);
    }, 1500);
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F271D] border border-[#16382C] text-[#00DC82] text-xs font-mono">
            <Terminal className="w-3.5 h-3.5" />
            <span>Interactive Engineering Sandbox</span>
          </div>
          <Badge variant={isJsRunnable ? "emerald" : "cyan"} className="text-[10px]">
            {isJsRunnable ? "Live JS Sandbox Execution" : "Architecture & Config Verifier"}
          </Badge>
        </div>

        <h2 className="text-xl font-bold text-[#F0FDF4]">Exercise Prompt</h2>
        <p className="text-xs sm:text-sm text-[#F0FDF4] leading-relaxed p-4 rounded-xl bg-[#07130E] border border-[#143326]">
          {challenge.prompt}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#8FA69B]">
          <span className="font-mono text-[#00DC82]">Workspace Editor</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setCode(challenge.starter_code || "");
                setLogs([]);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0A1913] border border-[#143326] hover:text-[#F0FDF4] cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
            <button
              type="button"
              onClick={() => handleCopy(code)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0A1913] border border-[#143326] hover:text-[#F0FDF4] cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-[#00DC82]" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <Button
              type="button"
              size="sm"
              variant="gradient"
              disabled={running}
              onClick={handleRun}
              className="gap-1.5 text-xs h-7 px-3"
            >
              <Play className="w-3 h-3" />
              {running ? "Running..." : isJsRunnable ? "Run in Sandbox" : "Check Structure"}
            </Button>
          </div>
        </div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          aria-label="Challenge workspace editor"
          rows={11}
          className="w-full rounded-xl border border-[#143326] bg-[#06100C] p-4 font-mono text-xs text-[#F0FDF4] leading-relaxed focus:outline-none focus:border-[#10B981]"
        />

        {logs.length > 0 && (
          <div className="rounded-xl border border-[#143326] bg-[#040B08] p-3.5 space-y-1.5 font-mono text-xs">
            <span className="text-[10px] uppercase tracking-wider text-[#5D7A6E] block">
              Sandbox Output
            </span>
            {logs.map((entry, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 ${
                  entry.type === "error"
                    ? "text-[#F87171]"
                    : entry.type === "log"
                    ? "text-[#00DC82]"
                    : "text-[#A7F3D0]"
                }`}
              >
                {entry.type === "error" && <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
                <span>{entry.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-[#143326] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-[#F0FDF4]">Reference Solution</h4>
            <p className="text-xs text-[#8FA69B]">
              Test your implementation above before comparing against the reference pattern.
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowSolution(!showSolution)}
            className="gap-2 text-xs"
          >
            {showSolution ? (
              <>
                <EyeOff className="w-3.5 h-3.5" /> Hide Solution
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" /> Reveal Solution
              </>
            )}
          </Button>
        </div>

        {showSolution && (
          <div className="space-y-4">
            <pre className="rounded-xl border border-[#10B981]/40 bg-[#06100C] p-4 font-mono text-xs text-[#00DC82] overflow-x-auto">
              <code>{challenge.solution_code}</code>
            </pre>
            {challenge.explanation && (
              <div className="p-4 rounded-xl bg-[#07130E] border border-[#143326]">
                <span className="text-[11px] uppercase tracking-wider text-[#00DC82] font-mono font-bold block mb-1">
                  Implementation Rationale:
                </span>
                <p className="text-xs text-[#F0FDF4] leading-relaxed">{challenge.explanation}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
