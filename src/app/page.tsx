"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  PlayCircle,
  Sparkles,
  Terminal,
  Users,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/footer";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#06100C]">
      {/* Top Ambient Glow Field */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-[#10B981]/25 via-[#059669]/15 to-transparent blur-3xl pointer-events-none rounded-full" />

        {/* HERO SECTION */}
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0C1E17] border border-[#16382C] shadow-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-xs font-semibold text-[#6EE7B7] tracking-wide">
                AI-Powered Education to Employment Platform
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#F0FDF4] leading-[1.1]">
              Your potential deserves an{" "}
              <span className="bg-gradient-to-r from-[#34D399] via-[#10B981] to-[#FBBF24] bg-clip-text text-transparent">
                opportunity.
              </span>
            </h1>

            {/* Subheading */}
            <p className="mt-6 text-base sm:text-lg text-[#8FA69B] max-w-2xl leading-relaxed">
              UnlockED helps underserved learners master in-demand technical
              skills, build production-grade projects, prove abilities through
              AI-evaluated assessments, and connect directly with hiring
              partners.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="rounded-full px-8 bg-gradient-to-r from-[#00DC82] to-[#10B981] text-slate-950 font-bold shadow-[0_0_25px_rgba(16,185,129,0.45)] hover:shadow-[0_0_35px_rgba(16,185,129,0.65)] hover:scale-105 transition-all text-sm sm:text-base gap-2"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/student/courses">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-7 border-[#16382C] bg-[#0A1913] text-[#ECFDF5] hover:bg-[#0E241B] hover:border-[#10B981] text-sm sm:text-base gap-2"
                >
                  <PlayCircle className="w-4 h-4 text-[#10B981]" />
                  <span>Explore Courses</span>
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* FEATURES SECTION */}
      <section className="py-20 bg-[#081510] border-y border-[#143326]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#10B981]">
              The Platform
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#F0FDF4] mt-1">
              Everything you need to launch your career.
            </h2>
            <p className="text-sm text-[#8FA69B] mt-3 leading-relaxed">
              A systematic framework designed to take you from learning to
              employment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Learn */}
            <div className="p-8 rounded-2xl bg-[#0A1913] border border-[#143326] flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-[#0F271D] border border-[#16382C] flex items-center justify-center mb-5">
                <BookOpen className="w-6 h-6 text-[#10B981]" />
              </div>
              <h3 className="text-lg font-semibold text-[#F0FDF4]">Learn</h3>
              <p className="text-xs text-[#8FA69B] mt-2 leading-relaxed max-w-xs">
                AI-powered curriculum aligned to real-world job requirements and
                continuously updated with industry trends.
              </p>
            </div>

            {/* Build */}
            <div className="p-8 rounded-2xl bg-[#0A1913] border border-[#143326] flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-[#0F271D] border border-[#16382C] flex items-center justify-center mb-5">
                <Terminal className="w-6 h-6 text-[#00DC82]" />
              </div>
              <h3 className="text-lg font-semibold text-[#F0FDF4]">Build</h3>
              <p className="text-xs text-[#8FA69B] mt-2 leading-relaxed max-w-xs">
                Production-grade projects in real development environments with
                automated code reviews and feedback.
              </p>
            </div>

            {/* Connect */}
            <div className="p-8 rounded-2xl bg-[#0A1913] border border-[#143326] flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-[#0F271D] border border-[#16382C] flex items-center justify-center mb-5">
                <Users className="w-6 h-6 text-[#34D399]" />
              </div>
              <h3 className="text-lg font-semibold text-[#F0FDF4]">Connect</h3>
              <p className="text-xs text-[#8FA69B] mt-2 leading-relaxed max-w-xs">
                Direct access to hiring partners who review your verified
                project work and skill assessments.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
