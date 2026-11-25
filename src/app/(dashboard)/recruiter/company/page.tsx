"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Save, CheckCircle2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function RecruiterCompanyPage() {
  const { refreshWorkspace } = useAuth();
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [size, setSize] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [verified, setVerified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/company", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.company) {
          setName(json.company.name || "");
          setIndustry(json.company.industry || "");
          setLocation(json.company.location || "");
          setSize(json.company.size || "");
          setWebsite(json.company.website || "");
          setDescription(json.company.description || "");
          setVerified(Boolean(json.company.verified));
        }
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSaving(true);
    try {
      const res = await fetch("/api/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          industry: industry.trim() || null,
          location: location.trim() || null,
          size: size.trim() || null,
          website: website.trim() || null,
          description: description.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error || "Failed to save company profile");
      } else {
        await refreshWorkspace();
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2500);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8 pb-20">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">
            Company Profile & Branding
          </h1>
          <Badge variant={verified ? "emerald" : "amber"} dot>
            {verified ? "Admin Verified Partner" : "Verification Pending"}
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-[#8FA69B] mt-1">
          Organization details shown alongside your published job postings.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave}>
        <Card className="p-6 sm:p-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#E6F4EA] block mb-1">
                Company Name
              </label>
              <Input required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#E6F4EA] block mb-1">
                Industry
              </label>
              <Input value={industry} onChange={(e) => setIndustry(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#E6F4EA] block mb-1">
                HQ Location
              </label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#E6F4EA] block mb-1">
                Company Size
              </label>
              <Input placeholder="e.g. 50-200" value={size} onChange={(e) => setSize(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#E6F4EA] block mb-1">
                Website URL
              </label>
              <Input placeholder="https://..." value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#E6F4EA] block mb-1">
              About Company & Engineering Culture
            </label>
            <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#143326]">
            <span className="text-xs text-[#00DC82] flex items-center gap-1">
              {isSaved && (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saved to database!
                </>
              )}
            </span>
            <Button type="submit" variant="gradient" size="sm" disabled={isSaving} className="gap-2 text-xs">
              <Save className="w-3.5 h-3.5" />
              {isSaving ? "Saving..." : "Save Company Profile"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
