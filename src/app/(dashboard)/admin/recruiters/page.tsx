"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Building2, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Company } from "@/types";

type GovernedCompany = Company & {
  recruiter?: { id: string; full_name: string; email: string };
};

export default function AdminRecruitersPage() {
  const [companies, setCompanies] = useState<GovernedCompany[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCompanies = useCallback(async () => {
    const res = await fetch("/api/admin/recruiters", { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      setCompanies(json.companies || []);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/recruiters", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (active && json?.companies) setCompanies(json.companies);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const toggleVerify = async (company: GovernedCompany) => {
    const res = await fetch("/api/admin/recruiters", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId: company.id, verified: !company.verified }),
    });
    if (res.ok) loadCompanies();
  };

  return (
    <div className="space-y-6 pb-20">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-[#8FA69B] hover:text-[#F0FDF4]">
        <ArrowLeft className="w-4 h-4" /> Back to Console
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">
          Hiring Partner Verification
        </h1>
        <p className="text-xs sm:text-sm text-[#8FA69B] mt-1">
          Verify employer organizations and trigger real-time verification notifications.
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="h-32 rounded-2xl bg-[#0A1913] border border-[#143326] animate-pulse" />
        ) : companies.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-[#0A1913] border border-[#143326] p-8">
            <Building2 className="w-12 h-12 text-[#143326] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#F0FDF4]">No hiring partners registered yet</h3>
          </div>
        ) : (
          companies.map((company) => (
            <Card key={company.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#0F271D] border border-[#16382C] flex items-center justify-center text-[#00DC82] font-bold">
                  {company.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-base font-bold text-[#F0FDF4]">{company.name}</h3>
                    <Badge variant={company.verified ? "emerald" : "amber"}>
                      {company.verified ? "Verified Partner" : "Pending Vetting"}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#8FA69B]">
                    {company.industry || "Technology"} · {company.location || "Remote"} · Recruiter:{" "}
                    {company.recruiter?.full_name || "Registered User"}
                  </p>
                </div>
              </div>

              <Button
                variant={company.verified ? "secondary" : "gradient"}
                size="sm"
                onClick={() => toggleVerify(company)}
                className="text-xs shrink-0"
              >
                {company.verified ? "Revoke Verification" : "Verify Partner"}
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
