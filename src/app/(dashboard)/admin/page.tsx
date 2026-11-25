"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Users,
  Briefcase,
  TrendingUp,
  Award,
  CheckCircle2,
  BarChart3,
  Clock,
  Shield,
  ArrowRight,
  Search,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatRelativeTime } from "@/lib/utils";
import type { GovernanceDomainNode } from "@/components/3d/admin-telemetry-scene";

const LazyAdminTelemetry = dynamic(
  () => import("@/components/3d/admin-telemetry-scene").then((mod) => mod.AdminTelemetryView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[320px] sm:h-[360px] rounded-2xl border border-[#143326] bg-[#07130E] flex items-center justify-center text-xs text-[#8FA69B]">
        Loading Governance Telemetry...
      </div>
    ),
  }
);

interface AdminOverviewData {
  kpis: {
    totalUsers: number;
    studentsCount: number;
    recruitersCount: number;
    verifiedPartners: number;
    pendingPartners: number;
    publishedCourses: number;
    totalEnrollments: number;
    benchmarksTaken: number;
    activeJobs: number;
    totalApplications: number;
    offersExtended: number;
    certificatesIssued: number;
    publishedProjects?: number;
  };
  auditLogs: Array<{
    id: string;
    action: string;
    target_type: string;
    target_id: string | null;
    created_at: string;
  }>;
}

export default function AdminConsolePage() {
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<GovernanceDomainNode["id"]>("identity");
  const [auditQuery, setAuditQuery] = useState("");

  useEffect(() => {
    const loadOverview = () => {
      fetch("/api/admin/overview", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json) setData(json);
        })
        .finally(() => setLoading(false));
    };
    loadOverview();
    window.addEventListener("unlocked:sync", loadOverview);
    return () => window.removeEventListener("unlocked:sync", loadOverview);
  }, []);

  const kpis = data?.kpis;

  const governanceDomains: GovernanceDomainNode[] = useMemo(
    () => [
      {
        id: "identity",
        label: "Identity & RBAC",
        metricLabel: `${kpis?.studentsCount ?? 0} students · ${kpis?.recruitersCount ?? 0} recruiters`,
        count: kpis?.totalUsers ?? 0,
        alert: false,
        color: "#10B981",
        position: [-2.4, 1.05, 0.5],
        href: "/admin/users",
        description: "Inspect registered accounts, elevate/review status, or suspend abusive users.",
      },
      {
        id: "curriculum",
        label: "Curriculum & Certs",
        metricLabel: `${kpis?.publishedCourses ?? 0} published tracks · ${kpis?.certificatesIssued ?? 0} certs`,
        count: kpis?.benchmarksTaken ?? 0,
        alert: false,
        color: "#22D3EE",
        position: [2.4, 1.05, -0.4],
        href: "/admin/courses",
        description: "Manage published course availability and review benchmark completion metrics.",
      },
      {
        id: "hiring",
        label: "Hiring Compliance",
        metricLabel: `${kpis?.pendingPartners ?? 0} pending partners · ${kpis?.activeJobs ?? 0} active jobs`,
        count: (kpis?.verifiedPartners ?? 0) + (kpis?.pendingPartners ?? 0),
        alert: (kpis?.pendingPartners ?? 0) > 0,
        color: "#00DC82",
        position: [-2.25, -1.15, -0.35],
        href: "/admin/recruiters",
        description: "Verify hiring organizations and moderate public employer job postings.",
      },
      {
        id: "moderation",
        label: "Portfolio & Audit",
        metricLabel: `${kpis?.publishedProjects ?? 0} public projects · ${data?.auditLogs?.length ?? 0} logs`,
        count: data?.auditLogs?.length ?? 0,
        alert: false,
        color: "#F59E0B",
        position: [2.35, -1.1, 0.45],
        href: "/admin/projects",
        description: "Feature standout learner portfolios or archive policy-violating submissions.",
      },
    ],
    [kpis, data?.auditLogs?.length]
  );

  const activeCluster =
    governanceDomains.find((d) => d.id === selectedDomain) || governanceDomains[0];

  const filteredLogs = useMemo(() => {
    const q = auditQuery.trim().toLowerCase();
    const list = data?.auditLogs || [];
    if (!q) return list;
    return list.filter(
      (l) =>
        l.action.toLowerCase().includes(q) ||
        l.target_type.toLowerCase().includes(q) ||
        (l.target_id || "").toLowerCase().includes(q)
    );
  }, [data?.auditLogs, auditQuery]);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#143326]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">
              Admin Control Room
            </h1>
            <Badge variant="emerald" dot>RBAC Verified</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#8FA69B] mt-1">
            Platform governance, real-time counts, partner vetting, and immutable audit events.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/users">
            <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
              <Users className="w-3.5 h-3.5 text-[#10B981]" /> Manage Users
            </Button>
          </Link>
          <Link href="/admin/analytics">
            <Button variant="gradient" size="sm" className="gap-1.5 text-xs rounded-full">
              <BarChart3 className="w-3.5 h-3.5" /> Live Analytics
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 relative">
          <LazyAdminTelemetry
            domains={governanceDomains}
            selectedDomainId={selectedDomain}
            onSelectDomain={setSelectedDomain}
          />
          <div className="pointer-events-none absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#06100C]/85 border border-[#143326] text-[10px] text-[#F59E0B]">
            Interactive 3D Governance Topology &middot; Select cluster
          </div>
        </div>

        <Card className="lg:col-span-5 p-6 glass-panel-elevated flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant={activeCluster.alert ? "amber" : "emerald"} dot>
                {activeCluster.alert ? "Attention Needed" : "Healthy Cluster"}
              </Badge>
              <span className="text-xs font-mono text-[#F59E0B]">
                {activeCluster.count} Records
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F0FDF4]">{activeCluster.label}</h2>
              <p className="text-xs text-[#00DC82] font-mono mt-0.5">
                {activeCluster.metricLabel}
              </p>
              <p className="text-xs text-[#8FA69B] mt-2 leading-relaxed">
                {activeCluster.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {governanceDomains.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDomain(d.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] border cursor-pointer transition-colors ${
                    d.id === selectedDomain
                      ? "bg-[#0F271D] text-[#F59E0B] border-[#F59E0B]"
                      : "bg-[#06110C] text-[#8FA69B] border-[#143326] hover:text-[#F0FDF4]"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <Link href={activeCluster.href}>
            <Button variant="gradient" size="sm" className="w-full gap-1.5 text-xs">
              Open {activeCluster.label} Module <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8FA69B]">
              Total Users
            </span>
            <div className="text-3xl font-bold text-[#F0FDF4] mt-1">
              {loading ? "…" : kpis?.totalUsers ?? 0}
            </div>
            <span className="text-[11px] text-[#8FA69B]">
              {kpis?.studentsCount ?? 0} learners · {kpis?.recruitersCount ?? 0} recruiters
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981]">
            <Users className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8FA69B]">
              Hiring Partners
            </span>
            <div className="text-3xl font-bold text-[#F0FDF4] mt-1">
              {loading ? "…" : kpis?.verifiedPartners ?? 0}
            </div>
            <span className="text-[11px] text-[#8FA69B]">
              {kpis?.pendingPartners ?? 0} awaiting review · {kpis?.activeJobs ?? 0} active jobs
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#00DC82]/10 border border-[#00DC82]/20 flex items-center justify-center text-[#00DC82]">
            <Briefcase className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8FA69B]">
              Benchmarks & Certs
            </span>
            <div className="text-3xl font-bold text-[#F0FDF4] mt-1">
              {loading ? "…" : kpis?.benchmarksTaken ?? 0}
            </div>
            <span className="text-[11px] text-[#8FA69B]">
              {kpis?.certificatesIssued ?? 0} certificates issued
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#22D3EE]/10 border border-[#22D3EE]/20 flex items-center justify-center text-[#22D3EE]">
            <Award className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8FA69B]">
              Applications & Offers
            </span>
            <div className="text-3xl font-bold text-[#F0FDF4] mt-1">
              {loading ? "…" : kpis?.totalApplications ?? 0}
            </div>
            <span className="text-[11px] text-[#8FA69B]">
              {kpis?.offersExtended ?? 0} offers extended
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center text-[#FBBF24]">
            <TrendingUp className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Pending Quick Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#143326] pb-3">
            <CardTitle>Partner Verification Queue</CardTitle>
            <Link href="/admin/recruiters" className="text-xs text-[#10B981] hover:underline">
              Open Queue
            </Link>
          </div>
          {kpis && kpis.pendingPartners > 0 ? (
            <div className="p-4 rounded-xl bg-[#07130E] border border-[#F59E0B]/40 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#F0FDF4]">
                  {kpis.pendingPartners} Organization(s) Pending Review
                </p>
                <p className="text-xs text-[#8FA69B]">Verify company legitimacy to activate trusted badge.</p>
              </div>
              <Link href="/admin/recruiters">
                <Button size="sm" variant="gradient" className="text-xs">Review</Button>
              </Link>
            </div>
          ) : (
            <div className="py-10 text-center">
              <CheckCircle2 className="w-9 h-9 text-[#10B981] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#F0FDF4]">Partner queue clear</p>
            </div>
          )}
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#143326] pb-3">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#10B981]" /> Recent Audit Logs
            </CardTitle>
            <div className="relative w-44">
              <Search className="w-3.5 h-3.5 text-[#5D7A6E] absolute left-2.5 top-2.5" />
              <Input
                value={auditQuery}
                onChange={(e) => setAuditQuery(e.target.value)}
                placeholder="Filter actions..."
                className="h-8 pl-8 text-xs"
              />
            </div>
          </div>

          {!data || filteredLogs.length === 0 ? (
            <p className="py-10 text-center text-xs text-[#5D7A6E]">
              {data?.auditLogs?.length ? "No audit logs match filter." : "No administrative governance events logged yet."}
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-[#07130E] border border-[#143326] flex items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <span className="font-mono font-semibold text-[#00DC82]">{log.action}</span>
                    <span className="text-[#8FA69B] ml-2">
                      {log.target_type} {log.target_id ? `#${log.target_id.slice(0, 8)}` : ""}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#5D7A6E] flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" /> {formatRelativeTime(log.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
