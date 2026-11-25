"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Award } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface OverviewResponse {
  kpis: {
    totalUsers: number;
    totalEnrollments: number;
    benchmarksTaken: number;
    benchmarkPassRate: number;
    avgAssessmentScore: number;
    activeJobs: number;
    totalApplications: number;
  };
  activityTimeline: Array<{
    date: string;
    users: number;
    enrollments: number;
    applications: number;
  }>;
  domainDistribution: Array<{ name: string; value: number; color: string }>;
}

export default function AdminAnalyticsPage() {
  const [daysRange, setDaysRange] = useState(30);
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(`/api/admin/overview?days=${daysRange}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (active && json) setData(json);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [daysRange]);

  const timeline = data?.activityTimeline || [];
  const domains = data?.domainDistribution || [];

  return (
    <div className="space-y-8 pb-20">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs text-[#8FA69B] hover:text-[#F0FDF4]"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Console
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">
              Platform Analytics
            </h1>
            <Badge variant="emerald" dot>Database Telemetry</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#8FA69B] mt-1">
            Live database-backed registrations, enrollments, benchmark pass rates, and applications.
          </p>
        </div>

        <select
          value={daysRange}
          onChange={(e) => {
            setLoading(true);
            setDaysRange(Number(e.target.value));
          }}
          className="h-9 rounded-lg border border-[#143326] bg-[#0A1913] px-3 text-xs text-[#F0FDF4]"
        >
          <option value={7}>Last 7 Days</option>
          <option value={30}>Last 30 Days</option>
          <option value={90}>Last 90 Days</option>
          <option value={365}>Last 365 Days</option>
        </select>
      </div>

      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <Card className="p-4">
            <span className="text-[#8FA69B]">Course Enrollments</span>
            <p className="text-2xl font-bold text-[#F0FDF4] mt-1">{data.kpis.totalEnrollments}</p>
          </Card>
          <Card className="p-4">
            <span className="text-[#8FA69B]">Avg Benchmark Score</span>
            <p className="text-2xl font-bold text-[#00DC82] mt-1">
              {data.kpis.benchmarksTaken > 0 ? `${data.kpis.avgAssessmentScore}%` : "—"}
            </p>
          </Card>
          <Card className="p-4">
            <span className="text-[#8FA69B]">Benchmark Pass Rate</span>
            <p className="text-2xl font-bold text-[#22D3EE] mt-1">
              {data.kpis.benchmarksTaken > 0 ? `${data.kpis.benchmarkPassRate}%` : "—"}
            </p>
          </Card>
          <Card className="p-4">
            <span className="text-[#8FA69B]">Active Job Requisitions</span>
            <p className="text-2xl font-bold text-[#F0FDF4] mt-1">{data.kpis.activeJobs}</p>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 space-y-4">
          <CardTitle>Registration, Enrollment & Application Activity</CardTitle>
          {loading ? (
            <div className="h-72 rounded-xl bg-[#07130E] animate-pulse" />
          ) : timeline.length === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center text-center">
              <TrendingUp className="w-10 h-10 text-[#143326] mb-3" />
              <p className="text-sm font-semibold text-[#F0FDF4]">No activity events in selected window</p>
              <p className="text-xs text-[#8FA69B] mt-1">
                Real database events will chart here as learners and recruiters use the platform.
              </p>
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeline}>
                  <XAxis dataKey="date" stroke="#5D7A6E" fontSize={11} />
                  <YAxis allowDecimals={false} stroke="#5D7A6E" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#07130E",
                      borderColor: "#143326",
                      borderRadius: "0.75rem",
                      color: "#F0FDF4",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="users" fill="#22D3EE" name="New Users" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="enrollments" fill="#10B981" name="Enrollments" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="applications" fill="#00DC82" name="Applications" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="p-6 space-y-4 flex flex-col justify-between">
          <CardTitle>Enrollment by Track Category</CardTitle>
          {loading ? (
            <div className="h-56 rounded-xl bg-[#07130E] animate-pulse" />
          ) : domains.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-center">
              <Award className="w-10 h-10 text-[#143326] mb-3" />
              <p className="text-sm font-semibold text-[#F0FDF4]">No enrollments recorded yet</p>
            </div>
          ) : (
            <>
              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={domains}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={78}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {domains.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1 text-xs">
                {domains.map((d, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#8FA69B]">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      {d.name}
                    </span>
                    <span className="font-mono font-bold text-[#F0FDF4]">{d.value}</span>
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
