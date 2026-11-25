"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Award, Printer, Sparkles, ExternalLink, CheckCircle2, Download, Copy, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Certificate } from "@/types";

export default function CertificatesPage() {
  const { user, certificates } = useAuth();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyVerifyUrl = (certNumber: string) => {
    const url = `${window.location.origin}/verify/${encodeURIComponent(certNumber)}`;
    navigator.clipboard.writeText(url);
    setCopiedId(certNumber);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleDownloadPdf = async (cert: Certificate) => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    doc.setFillColor(6, 16, 12);
    doc.rect(0, 0, 842, 595, "F");
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(3);
    doc.rect(28, 28, 786, 539);
    doc.setTextColor(0, 220, 130);
    doc.setFontSize(14);
    doc.text("UNLOCKED PLATFORM · VERIFIED TRACK CREDENTIAL", 421, 95, { align: "center" });
    doc.setTextColor(240, 253, 244);
    doc.setFontSize(34);
    doc.text(user?.full_name || "Learner", 421, 210, { align: "center" });
    doc.setTextColor(167, 243, 208);
    doc.setFontSize(14);
    doc.text("has completed all required curriculum modules and benchmark evaluation for", 421, 260, {
      align: "center",
    });
    doc.setTextColor(34, 211, 238);
    doc.setFontSize(22);
    doc.text(cert.course?.title || "Engineering Curriculum", 421, 315, { align: "center" });
    doc.setTextColor(143, 166, 155);
    doc.setFontSize(11);
    doc.text(`Credential ID: ${cert.certificate_number}`, 80, 485);
    doc.text(`Issued: ${formatDate(cert.issued_at)}`, 80, 505);
    doc.text(`Verify online at /verify/${cert.certificate_number}`, 760, 505, { align: "right" });
    doc.save(`${cert.certificate_number}.pdf`);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#143326]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">
              Verified Completion Certificates
            </h1>
            <Badge variant="emerald" dot>
              Registry Tracked
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#8FA69B] mt-1">
            Earned strictly when all modules in a track and its linked benchmark assessment are passed.
          </p>
        </div>

        {certificates.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.print()}
            className="gap-2 text-xs print:hidden"
          >
            <Printer className="w-4 h-4" />
            Print Certificate
          </Button>
        )}
      </div>

      {certificates.length === 0 ? (
        <div className="max-w-xl mx-auto py-20 text-center rounded-2xl bg-[#0A1913] border border-[#143326] p-8 space-y-4">
          <Award className="w-12 h-12 text-[#143326] mx-auto" />
          <h3 className="text-lg font-semibold text-[#F0FDF4]">No certificates earned yet</h3>
          <p className="text-sm text-[#8FA69B]">
            Complete 100% of lessons in any track and pass its corresponding skill benchmark to receive an official credential ID.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/student/courses">
              <Button size="sm" variant="gradient">Explore Curriculum</Button>
            </Link>
            <Link href="/student/assessments">
              <Button size="sm" variant="secondary">Skill Benchmarks</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {certificates.map((cert) => (
            <Card
              key={cert.id}
              className="max-w-3xl mx-auto p-8 sm:p-12 border-2 border-[#10B981]/50 shadow-2xl relative overflow-hidden"
            >
              <div className="border border-[#143326] p-8 rounded-2xl relative z-10 text-center space-y-6">
                <div className="flex items-center justify-between border-b border-[#143326] pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#059669] to-[#10B981] flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-slate-950" />
                    </div>
                    <span className="font-bold text-sm text-[#F0FDF4]">UnlockED</span>
                  </div>
                  <Badge variant="emerald" dot>
                    <CheckCircle2 className="w-3 h-3" /> Active Credential
                  </Badge>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#10B981]">
                    Certificate of Track Completion
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-bold text-[#F0FDF4] mt-2">
                    {user?.full_name || "Learner"}
                  </h2>
                  <p className="text-sm font-semibold text-[#00DC82] mt-3">
                    {cert.course?.title || "Engineering Curriculum"}
                  </p>
                  <p className="text-xs text-[#8FA69B] mt-2 max-w-md mx-auto">
                    Completed all required curriculum modules and passed the server-scored skill evaluation benchmark.
                  </p>
                </div>

                <div className="pt-6 border-t border-[#143326] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8FA69B]">
                  <div className="text-left">
                    <p className="font-bold text-[#F0FDF4]">Credential ID</p>
                    <p className="font-mono text-[#00DC82]">{cert.certificate_number}</p>
                  </div>
                  <div className="text-center sm:text-right space-y-2">
                    <p className="font-bold text-[#F0FDF4]">Issued: {formatDate(cert.issued_at)}</p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 print:hidden">
                      <button
                        type="button"
                        onClick={() => handleCopyVerifyUrl(cert.certificate_number)}
                        className="inline-flex items-center gap-1 text-[#A7F3D0] hover:text-[#F0FDF4] cursor-pointer"
                      >
                        {copiedId === cert.certificate_number ? (
                          <Check className="w-3 h-3 text-[#00DC82]" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        {copiedId === cert.certificate_number ? "Copied URL" : "Copy Verify URL"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(cert)}
                        className="inline-flex items-center gap-1 text-[#00DC82] hover:underline cursor-pointer"
                      >
                        <Download className="w-3 h-3" /> PDF
                      </button>
                      <Link
                        href={`/verify/${cert.certificate_number}`}
                        className="inline-flex items-center gap-1 text-[#22D3EE] hover:underline"
                      >
                        Verify Page <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
