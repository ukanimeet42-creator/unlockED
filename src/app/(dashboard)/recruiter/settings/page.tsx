"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Save, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function RecruiterSettingsPage() {
  const { user, refreshWorkspace } = useAuth();
  return (
    <RecruiterSettingsForm
      key={`${user?.id || "guest"}-${user?.updated_at || ""}`}
      user={user}
      refreshWorkspace={refreshWorkspace}
    />
  );
}

function RecruiterSettingsForm({
  user,
  refreshWorkspace,
}: {
  user: ReturnType<typeof useAuth>["user"];
  refreshWorkspace: () => Promise<void>;
}) {
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [location, setLocation] = useState(user?.location || "");
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedin_url || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwMsg, setPwMsg] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        location: location.trim() || null,
        linkedin_url: linkedinUrl.trim() || null,
        bio: bio.trim() || null,
      }),
    });
    if (res.ok) {
      await refreshWorkspace();
      setSavedMsg("Profile settings updated.");
      setTimeout(() => setSavedMsg(null), 2500);
    } else {
      const json = await res.json();
      setErrorMsg(json.error || "Update failed");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (newPassword.length < 8 || newPassword !== confirmPassword) {
      setErrorMsg("Passwords must match and be at least 8 characters.");
      return;
    }
    const res = await fetch("/api/profile/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    if (res.ok) {
      setNewPassword("");
      setConfirmPassword("");
      setPwMsg("Password updated securely.");
      setTimeout(() => setPwMsg(null), 3000);
    }
  };

  return (
    <div className="max-w-3xl space-y-6 pb-20">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">Recruiter Settings</h1>
        <p className="text-xs sm:text-sm text-[#8FA69B] mt-1">
          Manage your recruiter contact details and security credentials.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile}>
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-bold text-[#F0FDF4] border-b border-[#143326] pb-3">
            Personal Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#E6F4EA] block mb-1">Full Name</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div>
              <label className="text-xs text-[#E6F4EA] block mb-1">Account Email</label>
              <Input value={user?.email || ""} disabled className="opacity-70" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#E6F4EA] block mb-1">Phone</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-[#E6F4EA] block mb-1">Location</label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs text-[#E6F4EA] block mb-1">LinkedIn URL</label>
            <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-[#E6F4EA] block mb-1">Recruiter Bio</label>
            <Textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-[#143326]">
            <span className="text-xs text-[#00DC82] flex items-center gap-1">
              {savedMsg && (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> {savedMsg}
                </>
              )}
            </span>
            <Button type="submit" variant="gradient" size="sm" className="gap-1.5 text-xs">
              <Save className="w-3.5 h-3.5" /> Save Changes
            </Button>
          </div>
        </Card>
      </form>

      <form onSubmit={handlePasswordChange}>
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-bold text-[#F0FDF4] border-b border-[#143326] pb-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#10B981]" /> Password Management
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="password"
              placeholder="New password (min 8 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#00DC82]">{pwMsg}</span>
            <Button type="submit" variant="secondary" size="sm" className="text-xs">
              Update Password
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
