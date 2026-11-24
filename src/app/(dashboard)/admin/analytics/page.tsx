"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Users, Award, Briefcase, Sparkles } from "lucide-react";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AdminAnalyticsPage() {
  const cohortGrowth: { cohort: string; enrolled: number; graduated: number; placed: number }[] = [];
  const domainDistribution: { name: string; value: number; color: string }[] = [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-20">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs text-[#8FA69B] hover:text-[#F0FDF4] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Console
      </Link>

      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">
            Platform Analytics & Placement Telemetry
          </h1>
          <Badge variant="emerald" dot>
            Real-Time
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-[#8FA69B] mt-1">
          Deep cohort performance, placement velocity, and benchmark distribution across platform learners.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cohort Graduation & Placement */}
        <Card className="lg:col-span-2 p-6 bg-[#0A1913] border-[#143326] space-y-4">
          <CardTitle>Cohort Completion & Placement Conversion</CardTitle>
          {cohortGrowth.length === 0 ? (
            <div className="h-72 w-full flex flex-col items-center justify-center text-center">
              <TrendingUp className="w-10 h-10 text-[#143326] mb-3" />
              <p className="text-sm font-semibold text-[#F0FDF4]">No cohort data recorded yet</p>
              <p className="text-xs text-[#8FA69B] mt-1">Cohort metrics will populate as classes complete curricula.</p>
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cohortGrowth}>
                  <XAxis dataKey="cohort" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#07130E",
                      borderColor: "#143326",
                      borderRadius: "0.75rem",
                      color: "#F0FDF4",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="enrolled" fill="#143326" name="Enrolled" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="graduated" fill="#10B981" name="Graduated" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="placed" fill="#00DC82" name="Direct Hires" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Domain Distribution Pie */}
        <Card className="p-6 bg-[#0A1913] border-[#143326] space-y-4 flex flex-col justify-between">
          <CardTitle>Specialization Domain Distribution</CardTitle>
          {domainDistribution.length === 0 ? (
            <div className="h-56 w-full flex flex-col items-center justify-center text-center">
              <Award className="w-10 h-10 text-[#143326] mb-3" />
              <p className="text-sm font-semibold text-[#F0FDF4]">No domain telemetry</p>
              <p className="text-xs text-[#8FA69B] mt-1">Domain breakdown will display as assessments are passed.</p>
            </div>
          ) : (
            <>
              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={domainDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {domainDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1 text-xs">
                {domainDistribution.map((d, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#8FA69B]">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      {d.name}
                    </span>
                    <span className="font-mono font-bold text-[#F0FDF4]">{d.value}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
