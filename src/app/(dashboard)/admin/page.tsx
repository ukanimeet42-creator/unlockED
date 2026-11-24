"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Users,
  BookOpen,
  Briefcase,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

export default function AdminConsolePage() {
  const growthData: { month: string; students: number; placed: number }[] = [];
  const passRateData: { track: string; passRate: number }[] = [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#143326]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">
              Platform Admin Console
            </h1>
            <Badge variant="emerald" dot>
              System Operational
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#8FA69B] mt-1">
            Global governance, system telemetry, user role assignment, and curriculum moderation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/users">
            <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
              <Users className="w-3.5 h-3.5 text-[#10B981]" />
              Manage Users
            </Button>
          </Link>
          <Link href="/admin/analytics">
            <Button variant="gradient" size="sm" className="gap-1.5 text-xs">
              <BarChart3 className="w-3.5 h-3.5" />
              Full Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* Admin KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center justify-between bg-[#0A1913] border-[#143326]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8FA69B]">
              Total Users
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-[#F0FDF4]">0</span>
            </div>
            <span className="text-[11px] text-[#8FA69B]">Registered accounts</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981]">
            <Users className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between bg-[#0A1913] border-[#143326]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8FA69B]">
              Verified Partners
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-[#F0FDF4]">0</span>
            </div>
            <span className="text-[11px] text-[#8FA69B]">Active companies</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#00DC82]/10 border border-[#00DC82]/20 flex items-center justify-center text-[#00DC82]">
            <Briefcase className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between bg-[#0A1913] border-[#143326]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8FA69B]">
              Benchmarks Taken
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-[#F0FDF4]">0</span>
            </div>
            <span className="text-[11px] text-[#8FA69B]">Evaluated attempts</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#34D399]/10 border border-[#34D399]/20 flex items-center justify-center text-[#34D399]">
            <Award className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between bg-[#0A1913] border-[#143326]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8FA69B]">
              Total Placements
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-[#F0FDF4]">0</span>
            </div>
            <span className="text-[11px] text-[#8FA69B]">Hires completed</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#FBBF24]/10 border border-[#FBBF24]/20 flex items-center justify-center text-[#FBBF24]">
            <TrendingUp className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Action Table: Pending Moderation */}
      <Card className="p-6 bg-[#0A1913] border-[#143326] space-y-4">
        <div className="flex items-center justify-between border-b border-[#143326] pb-3">
          <CardTitle>Pending Moderation & Approvals</CardTitle>
          <span className="text-xs text-[#8FA69B]">Queue status</span>
        </div>

        <div className="py-12 text-center">
          <CheckCircle2 className="w-10 h-10 text-[#10B981] mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#F0FDF4]">All queues clear</p>
          <p className="text-xs text-[#8FA69B] mt-1">No pending requisitions or partner verifications awaiting moderation.</p>
        </div>
      </Card>
    </div>
  );
}
