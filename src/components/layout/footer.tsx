import React from "react";
import Link from "next/link";
import { Sparkles, Shield, Globe, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#143326] bg-[#06100C] text-[#8FA69B] text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#059669] to-[#10B981] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base text-[#F0FDF4]">UnlockED</span>
            </Link>
            <p className="text-xs text-[#8FA69B] max-w-sm leading-relaxed">
              Learn skills. Build projects. Prove your potential. Unlock opportunities.
              The AI-powered education to employment platform bridging non-traditional ambition with high-growth engineering teams.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0A1913] border border-[#143326] text-[11px] text-[#00DC82]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00DC82] animate-pulse" />
                Evaluation Engine 4.2 Online
              </span>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-xs text-[#F0FDF4] uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/student/courses" className="hover:text-[#34D399] transition-colors">
                  Course Catalog
                </Link>
              </li>
              <li>
                <Link href="/student/assessments" className="hover:text-[#34D399] transition-colors">
                  Skill Benchmark
                </Link>
              </li>
              <li>
                <Link href="/student/ai-assistant" className="hover:text-[#34D399] transition-colors">
                  AI Career Guidance
                </Link>
              </li>
              <li>
                <Link href="/student/roadmap" className="hover:text-[#34D399] transition-colors">
                  Personalized Roadmaps
                </Link>
              </li>
            </ul>
          </div>

          {/* Hiring Partners */}
          <div className="space-y-3">
            <h4 className="font-semibold text-xs text-[#F0FDF4] uppercase tracking-wider">Employers</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/recruiter" className="hover:text-[#34D399] transition-colors">
                  Recruiter Hub
                </Link>
              </li>
              <li>
                <Link href="/recruiter/candidates" className="hover:text-[#34D399] transition-colors">
                  Candidate Search
                </Link>
              </li>
              <li>
                <Link href="/recruiter/jobs/new" className="hover:text-[#34D399] transition-colors">
                  Post an Opportunity
                </Link>
              </li>
              <li>
                <Link href="/student/portfolio" className="hover:text-[#34D399] transition-colors">
                  Verified Portfolios
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Admin */}
          <div className="space-y-3">
            <h4 className="font-semibold text-xs text-[#F0FDF4] uppercase tracking-wider">Security & Governance</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/admin" className="hover:text-[#34D399] transition-colors flex items-center gap-1">
                  <Shield className="w-3 h-3 text-[#10B981]" />
                  Admin Console
                </Link>
              </li>
              <li>
                <span className="text-[#64748B]">PostgreSQL Row Level Security</span>
              </li>
              <li>
                <span className="text-[#64748B]">Gemini AI SDK Guardrails</span>
              </li>
              <li>
                <span className="text-[#64748B]">Non-Discriminatory Matching</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#143326] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#5D7A6E]">
          <p>© {new Date().getFullYear()} UnlockED Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-[#8FA69B] transition-colors cursor-pointer">Privacy Policy</span>
            <span>·</span>
            <span className="hover:text-[#8FA69B] transition-colors cursor-pointer">Terms of Service</span>
            <span>·</span>
            <span className="hover:text-[#8FA69B] transition-colors cursor-pointer">Security Attestation</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
