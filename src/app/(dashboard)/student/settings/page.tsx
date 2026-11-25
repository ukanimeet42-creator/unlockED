"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Save, Lock, Shield, Bell, CheckCircle2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function StudentSettingsPage() {
  const { user, refreshWorkspace, logout } = useAuth();
  return (
    <StudentSettingsForm
      key={`${user?.id || "guest"}-${user?.updated_at || ""}`}
      user={user}
      refreshWorkspace={refreshWorkspace}
      logout={logout}
    />
  );
}

function StudentSettingsForm({
  user,
  refreshWorkspace,
  logout,
}: {
  user: ReturnType<typeof useAuth>["user"];
  refreshWorkspace: () => Promise<void>;
  logout: () => Promise<void>;
}) {
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [location, setLocation] = useState(user?.location || "");
  const [githubUrl, setGithubUrl] = useState(user?.github_url || "");
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedin_url || "");

  const [emailUpdates, setEmailUpdates] = useState(
    user?.notification_preferences?.email_updates ?? true
  );
  const [jobAlerts, setJobAlerts] = useState(
    user?.notification_preferences?.job_alerts ?? true
  );
  const [courseReminders, setCourseReminders] = useState(
    user?.notification_preferences?.course_reminders ?? true
  );
  const [publicPortfolio, setPublicPortfolio] = useState(
    user?.privacy_settings?.public_portfolio ?? true
  );
  const [showEmailToRecruiters, setShowEmailToRecruiters] = useState(
    user?.privacy_settings?.show_email_to_recruiters ?? false
  );

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          bio: bio.trim() || null,
          phone: phone.trim() || null,
          location: location.trim() || null,
          github_url: githubUrl.trim() || null,
          linkedin_url: linkedinUrl.trim() || null,
          notification_preferences: {
            email_updates: emailUpdates,
            job_alerts: jobAlerts,
            course_reminders: courseReminders,
          },
          privacy_settings: {
            public_portfolio: publicPortfolio,
            show_email_to_recruiters: showEmailToRecruiters,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error || "Failed to save settings");
      } else {
        await refreshWorkspace();
        setStatusMsg("Profile and preferences saved to database.");
        setTimeout(() => setStatusMsg(null), 2500);
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (newPassword.length < 8 || newPassword !== confirmPassword) {
      setErrorMsg("New passwords must match and be at least 8 characters.");
      return;
    }
    const res = await fetch("/api/profile/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    const json = await res.json();
    if (!res.ok) {
      setErrorMsg(json.error || "Failed to change password");
    } else {
      setNewPassword("");
      setConfirmPassword("");
      setStatusMsg("Password updated successfully.");
      setTimeout(() => setStatusMsg(null), 2500);
    }
  };

  return (
    <div className="max-w-3xl space-y-8 pb-20">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">
          Account, Privacy & Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#8FA69B] mt-1">
          Manage your profile details, notification alerts, portfolio visibility, and credentials.
        </p>
      </div>

      {statusMsg && (
        <div className="p-3 rounded-xl bg-[#0F271D] border border-[#10B981] text-xs text-[#00DC82] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#F0FDF4] border-b border-[#143326] pb-3">
            Profile Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#E6F4EA] block mb-1">Full Name</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-medium text-[#E6F4EA] block mb-1">Email Address</label>
              <Input disabled value={user?.email || ""} className="opacity-70 cursor-not-allowed" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#E6F4EA] block mb-1">Professional Bio</label>
            <Textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#E6F4EA] block mb-1">Phone Number</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-[#E6F4EA] block mb-1">Location</label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-medium text-[#E6F4EA] block mb-1">GitHub URL</label>
              <Input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-[#E6F4EA] block mb-1">LinkedIn URL</label>
              <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#F0FDF4] border-b border-[#143326] pb-3 flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#10B981]" /> Notifications & Privacy
          </h3>
          <div className="space-y-3 text-xs text-[#E6F4EA]">
            <label className="flex items-center justify-between cursor-pointer">
              <span>Receive application status & interview alerts</span>
              <input type="checkbox" checked={emailUpdates} onChange={(e) => setEmailUpdates(e.target.checked)} />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span>New matched job opportunity notifications</span>
              <input type="checkbox" checked={jobAlerts} onChange={(e) => setJobAlerts(e.target.checked)} />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span>Learning streak & module reminders</span>
              <input type="checkbox" checked={courseReminders} onChange={(e) => setCourseReminders(e.target.checked)} />
            </label>
            <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-[#143326]">
              <span>Allow public access to my shareable portfolio page</span>
              <input type="checkbox" checked={publicPortfolio} onChange={(e) => setPublicPortfolio(e.target.checked)} />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span>Allow hiring recruiters to view my email address</span>
              <input type="checkbox" checked={showEmailToRecruiters} onChange={(e) => setShowEmailToRecruiters(e.target.checked)} />
            </label>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#143326]">
            <Button type="submit" variant="gradient" size="sm" disabled={saving} className="gap-2 text-xs">
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving..." : "Save All Settings"}
            </Button>
          </div>
        </Card>
      </form>

      <form onSubmit={handlePasswordChange}>
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#F0FDF4] border-b border-[#143326] pb-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#10B981]" /> Password & Active Session
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          <div className="flex items-center justify-between pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => logout()} className="text-xs text-rose-300 border-rose-500/40">
              <Shield className="w-3.5 h-3.5" /> Sign Out Session
            </Button>
            <Button type="submit" variant="secondary" size="sm" className="text-xs">
              Update Password
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
