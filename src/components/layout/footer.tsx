import React from "react";
import Link from "next/link";
import { Sparkles, Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#143326] bg-[#06100C] text-[#8FA69B] text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#059669] via-[#10B981] to-[#22D3EE] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-slate-950" />
              </div>
              <span className="font-bold text-base text-[#F0FDF4]">UnlockED</span>
            </Link>
            <p className="text-xs text-[#8FA69B] max-w-sm leading-relaxed">
              Learn skills. Build projects. Prove your potential. Unlock opportunities.
              The AI-powered education to employment platform bridging ambition with engineering teams.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0A1913] border border-[#143326] text-[11px] text-[#00DC82]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00DC82]" />
                Server-Validated Learning & Hiring
              </span>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-xs text-[#F0FDF4] uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/courses" className="hover:text-[#00DC82] transition-colors">
                  Course Catalog
                </Link>
              </li>
              <li>
                <Link href="/login?redirectTo=/student/assessments" className="hover:text-[#00DC82] transition-colors">
                  Skill Benchmarks
                </Link>
              </li>
              <li>
                <Link href="/login?redirectTo=/student/ai-assistant" className="hover:text-[#00DC82] transition-colors">
                  AI Career Advisor
                </Link>
              </li>
              <li>
                <Link href="/login?redirectTo=/student/roadmap" className="hover:text-[#00DC82] transition-colors">
                  Career Roadmaps
                </Link>
              </li>
            </ul>
          </div>

          {/* Hiring Partners */}
          <div className="space-y-3">
            <h4 className="font-semibold text-xs text-[#F0FDF4] uppercase tracking-wider">Employers</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/register?role=recruiter" className="hover:text-[#00DC82] transition-colors">
                  Recruiter Registration
                </Link>
              </li>
              <li>
                <Link href="/login?redirectTo=/recruiter/candidates" className="hover:text-[#00DC82] transition-colors">
                  Candidate Search
                </Link>
              </li>
              <li>
                <Link href="/login?redirectTo=/recruiter/jobs/new" className="hover:text-[#00DC82] transition-colors">
                  Post an Opportunity
                </Link>
              </li>
              <li>
                <Link href="/verify/lookup" className="hover:text-[#00DC82] transition-colors">
                  Verify Credentials
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Governance */}
          <div className="space-y-3">
            <h4 className="font-semibold text-xs text-[#F0FDF4] uppercase tracking-wider">Security</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/login?redirectTo=/admin" className="hover:text-[#00DC82] transition-colors inline-flex items-center gap-1">
                  <Shield className="w-3 h-3 text-[#10B981]" />
                  Authorized Admin Portal
                </Link>
              </li>
              <li>
                <span className="text-[#5D7A6E]">Supabase Auth & RBAC</span>
              </li>
              <li>
                <span className="text-[#5D7A6E]">Row Level Security (RLS)</span>
              </li>
              <li>
                <span className="text-[#5D7A6E]">Explainable Skill Matching</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#143326] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#5D7A6E]">
          <p>© {new Date().getFullYear()} UnlockED Platform. Team SARVAM · Rathinam Institute of Technology.</p>
          <div className="flex items-center gap-4">
            <Link href="/courses" className="hover:text-[#8FA69B] transition-colors">
              Explore Tracks
            </Link>
            <span>·</span>
            <Link href="/verify/lookup" className="hover:text-[#8FA69B] transition-colors">
              Credential Verification
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
