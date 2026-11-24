"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  Briefcase,
  TrendingUp,
  Award,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Search,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { INITIAL_JOBS, INITIAL_STUDENT_PROFILE } from "@/lib/data/mock-data";

export default function RecruiterDashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#143326]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">
              Recruiter Talent Hub
            </h1>
            <Badge variant="indigo" dot>
              Verified Hiring Partner
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#8FA69B] mt-1">
            Post job opportunities, review evaluated candidate portfolios, and manage your hiring pipeline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/recruiter/jobs/new">
            <Button variant="gradient" size="sm" className="gap-2 text-xs">
              <Plus className="w-3.5 h-3.5" />
              Post New Opportunity
            </Button>
          </Link>
          <Link href="/recruiter/candidates">
            <Button variant="secondary" size="sm" className="gap-2 text-xs">
              <Search className="w-3.5 h-3.5 text-[#10B981]" />
              Candidate Search
            </Button>
          </Link>
        </div>
      </div>

      {/* Recruiter Metrics Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8FA69B]">
              Active Postings
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-[#F0FDF4]">
                {INITIAL_JOBS.length}
              </span>
              <span className="text-xs text-[#00DC82]">live</span>
            </div>
            <span className="text-[11px] text-[#8FA69B]">0 applications received</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#059669]/10 border border-[#059669]/20 flex items-center justify-center text-[#10B981]">
            <Briefcase className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8FA69B]">
              Shortlisted
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-[#F0FDF4]">0</span>
              <span className="text-xs text-[#8FA69B]">candidates</span>
            </div>
            <span className="text-[11px] text-[#8FA69B]">Pipeline ready</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981]">
            <Users className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8FA69B]">
              Avg Readiness Score
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-[#F0FDF4]">—</span>
            </div>
            <span className="text-[11px] text-[#8FA69B]">Evaluated candidates</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#00DC82]/10 border border-[#00DC82]/20 flex items-center justify-center text-[#00DC82]">
            <Award className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8FA69B]">
              Offers Extended
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-[#F0FDF4]">0</span>
              <span className="text-xs text-[#8FA69B]">offers</span>
            </div>
            <span className="text-[11px] text-[#8FA69B]">Active cycles</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#FBBF24]/10 border border-[#FBBF24]/20 flex items-center justify-center text-[#FBBF24]">
            <TrendingUp className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* 2-Column: Active Roles & Incoming Candidate Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Job Postings */}
        <Card className="p-6 bg-[#0A1913] border-[#143326] space-y-4">
          <div className="flex items-center justify-between border-b border-[#143326] pb-3">
            <CardTitle>Your Active Requisitions</CardTitle>
            <Link href="/recruiter/jobs/new">
              <Button size="sm" variant="ghost" className="text-xs text-[#10B981]">
                + New Requisition
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {INITIAL_JOBS.length === 0 ? (
              <div className="py-12 text-center">
                <Briefcase className="w-10 h-10 text-[#143326] mx-auto mb-3" />
                <p className="text-sm font-semibold text-[#F0FDF4]">No active job postings yet</p>
                <p className="text-xs text-[#8FA69B] mt-1">Post a requisition to begin receiving verified applications.</p>
                <Link href="/recruiter/jobs/new" className="inline-block mt-4">
                  <Button size="sm" variant="gradient">Post an Opportunity</Button>
                </Link>
              </div>
            ) : (
              INITIAL_JOBS.map((job) => (
                <div
                  key={job.id}
                  className="p-4 rounded-xl bg-[#07130E] border border-[#143326] flex items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="text-sm font-bold text-[#F0FDF4]">{job.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-[#8FA69B] mt-1">
                      <span>{job.job_type}</span>
                      <span>·</span>
                      <span>{job.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="emerald">{job.application_count} Applicants</Badge>
                    <Link href="/recruiter/applications">
                      <Button size="sm" variant="secondary" className="text-xs">
                        Review
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Top Pre-Screened Candidates */}
        <Card className="p-6 bg-[#0A1913] border-[#143326] space-y-4">
          <div className="flex items-center justify-between border-b border-[#143326] pb-3">
            <CardTitle>Top Pre-Screened Talent</CardTitle>
            <Link href="/recruiter/candidates">
              <Button size="sm" variant="ghost" className="text-xs text-[#10B981]">
                Search All
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            <div className="py-12 text-center">
              <Users className="w-10 h-10 text-[#143326] mx-auto mb-3" />
              <p className="text-sm font-semibold text-[#F0FDF4]">No candidates evaluated yet</p>
              <p className="text-xs text-[#8FA69B] mt-1">Learners completing benchmark assessments will appear here.</p>
              <Link href="/recruiter/candidates" className="inline-block mt-4">
                <Button size="sm" variant="secondary">Search Talent Pool</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
