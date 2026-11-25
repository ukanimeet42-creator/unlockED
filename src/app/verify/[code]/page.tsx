"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Award, CheckCircle2, Search, XCircle, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface VerificationResult {
  verified: boolean;
  certificate?: {
    certificate_number: string;
    issued_at: string;
    status: string;
    recipient: { full_name: string; location: string | null } | null;
    course: { id: string; title: string; category: string; difficulty: string; duration_weeks: number } | null;
  };
  error?: string;
}

export default function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const router = useRouter();
  const decoded = decodeURIComponent(code || "");
  const isLookupLanding = decoded.toLowerCase() === "lookup";

  const [lookupInput, setLookupInput] = useState(isLookupLanding ? "" : decoded);
  const [fetchedCode, setFetchedCode] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);

  useEffect(() => {
    if (isLookupLanding) return;
    let active = true;
    fetch(`/api/verify/${encodeURIComponent(decoded)}`)
      .then((res) => res.json())
      .then((json) => {
        if (!active) return;
        setResult(json);
        setFetchedCode(decoded);
      })
      .catch(() => {
        if (!active) return;
        setResult({ verified: false, error: "Lookup request failed." });
        setFetchedCode(decoded);
      });
    return () => {
      active = false;
    };
  }, [decoded, isLookupLanding]);

  const loading = !isLookupLanding && fetchedCode !== decoded;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupInput.trim()) return;
    router.push(`/verify/${encodeURIComponent(lookupInput.trim().toUpperCase())}`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#06100C] py-14 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-[#8FA69B] hover:text-[#00DC82]">
          <ArrowLeft className="w-4 h-4" /> Back to UnlockED
        </Link>

        <Card className="p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#10B981]/15 border border-[#16382C] text-[#00DC82] mx-auto flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-[#F0FDF4]">Certificate Verification</h1>
            <p className="text-xs text-[#8FA69B]">
              Verify an official UnlockED completion credential ID against platform records.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#5D7A6E] absolute left-3 top-3.5" />
              <Input
                value={lookupInput}
                onChange={(e) => setLookupInput(e.target.value)}
                placeholder="Enter credential code (e.g. UED-2026-A1B2C3D4)"
                className="pl-9 bg-[#06100C] border-[#143326] text-[#F0FDF4] font-mono uppercase"
              />
            </div>
            <Button type="submit" variant="gradient" className="text-xs">
              Verify
            </Button>
          </form>

          {loading ? (
            <div className="py-10 text-center text-xs text-[#8FA69B]">
              Checking certificate registry...
            </div>
          ) : !isLookupLanding && result ? (
            result.verified && result.certificate ? (
              <div className="p-6 rounded-2xl bg-[#07130E] border border-[#10B981]/50 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="emerald" dot>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Valid Record Found
                  </Badge>
                  <span className="font-mono text-xs text-[#00DC82]">
                    {result.certificate.certificate_number}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#8FA69B] uppercase tracking-wider block">
                    Awarded To
                  </span>
                  <h2 className="text-xl font-bold text-[#F0FDF4]">
                    {result.certificate.recipient?.full_name || "Registered Learner"}
                  </h2>
                </div>
                <div>
                  <span className="text-[11px] text-[#8FA69B] uppercase tracking-wider block">
                    Track Completed
                  </span>
                  <p className="text-sm font-semibold text-[#E6F4EA]">
                    {result.certificate.course?.title}
                  </p>
                  <p className="text-xs text-[#8FA69B] mt-0.5">
                    {result.certificate.course?.category} · Issued{" "}
                    {formatDate(result.certificate.issued_at)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-center space-y-2">
                <XCircle className="w-8 h-8 text-rose-400 mx-auto" />
                <p className="text-sm font-semibold text-[#F0FDF4]">Credential Not Found</p>
                <p className="text-xs text-[#8FA69B]">
                  No certificate matching <span className="font-mono">{decoded}</span> exists in the platform database.
                </p>
              </div>
            )
          ) : null}
        </Card>
      </div>
    </div>
  );
}
