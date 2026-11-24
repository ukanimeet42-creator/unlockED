"use client";

import React, { useState } from "react";
import { Building2, Save, ShieldCheck, Globe, MapPin, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { INITIAL_COMPANIES } from "@/lib/data/mock-data";

export default function RecruiterCompanyPage() {
  const company = INITIAL_COMPANIES[0] || null;
  const [name, setName] = useState(company?.name || "");
  const [industry, setIndustry] = useState(company?.industry || "");
  const [location, setLocation] = useState(company?.location || "");
  const [size, setSize] = useState(company?.size || "");
  const [website, setWebsite] = useState(company?.website || "");
  const [description, setDescription] = useState(company?.description || "");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl space-y-8 animate-in fade-in duration-300 pb-20">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F3FF]">
            Company Profile & Branding
          </h1>
          <Badge variant="emerald" dot>
            Verified Hiring Partner
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
          Candidate-facing organizational branding, engineering culture, and verification tier.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6 sm:p-8 bg-[#151520] border-[#232336] shadow-xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#E4E1EC] block mb-1">
                Company Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#E4E1EC] block mb-1">
                Industry
              </label>
              <Input
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#E4E1EC] block mb-1">
                HQ Location
              </label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#E4E1EC] block mb-1">
                Company Size
              </label>
              <Input
                value={size}
                onChange={(e) => setSize(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#E4E1EC] block mb-1">
                Official Website
              </label>
              <Input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#E4E1EC] block mb-1">
              About the Company & Engineering Culture
            </label>
            <Textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-[#232336]">
            <Button type="submit" variant="gradient" size="sm" className="gap-2 text-xs">
              <Save className="w-3.5 h-3.5" />
              {isSaved ? "Profile Saved!" : "Save Company Changes"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
