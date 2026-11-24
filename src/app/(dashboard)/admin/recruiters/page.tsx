"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Building2, ArrowLeft, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { INITIAL_COMPANIES } from "@/lib/data/mock-data";

export default function AdminRecruitersPage() {
  const [companies, setCompanies] = useState(INITIAL_COMPANIES);

  const toggleVerify = (id: string) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, verified: !c.verified } : c))
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#F5F3FF] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Console
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F3FF]">
          Hiring Partner & Recruiter Verification
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
          Validate corporate legitimacy, employer compliance, and grant access to candidate pipelines.
        </p>
      </div>

      <div className="space-y-4">
        {companies.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-[#0A1913] border border-[#143326] p-8">
            <Building2 className="w-12 h-12 text-[#143326] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#F0FDF4]">No hiring partners registered yet</h3>
            <p className="text-sm text-[#8FA69B] mt-1">Employer organizations applying for platform verification will appear here.</p>
          </div>
        ) : (
          companies.map((company) => (
            <Card key={company.id} className="p-5 bg-[#0A1913] border-[#143326] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {company.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt={company.name}
                    className="w-12 h-12 rounded-xl object-cover border border-[#143326]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[#0F271D] border border-[#16382C] flex items-center justify-center text-[#10B981] font-bold">
                    {company.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-base font-bold text-[#F0FDF4]">{company.name}</h3>
                    <Badge variant={company.verified ? "emerald" : "secondary"}>
                      {company.verified ? "Verified Partner" : "Pending Vetting"}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#8FA69B]">
                    {company.industry} · {company.location} · {company.size}
                  </p>
                </div>
              </div>

              <Button
                variant={company.verified ? "secondary" : "gradient"}
                size="sm"
                onClick={() => toggleVerify(company.id)}
                className="text-xs shrink-0"
              >
                {company.verified ? "Revoke Verification" : "Verify Organization"}
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
