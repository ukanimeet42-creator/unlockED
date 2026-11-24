"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  LayoutDashboard,
  BookOpen,
  Award,
  Sparkles,
  MapPin,
  FolderGit2,
  FileText,
  Briefcase,
  BadgeCheck,
  Settings,
  Users,
  Building2,
  BarChart3,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const studentLinks = [
    { href: "/student", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/courses", label: "Courses", icon: BookOpen },
    { href: "/student/assessments", label: "Skill Assessments", icon: Award },
    { href: "/student/ai-assistant", label: "AI Career Guidance", icon: Sparkles, highlight: true },
    { href: "/student/roadmap", label: "Career Roadmap", icon: MapPin },
    { href: "/student/portfolio", label: "Project Portfolio", icon: FolderGit2 },
    { href: "/student/resume", label: "AI Resume Builder", icon: FileText },
    { href: "/student/jobs", label: "Jobs & Internships", icon: Briefcase },
    { href: "/student/certificates", label: "Certificates", icon: BadgeCheck },
    { href: "/student/settings", label: "Settings", icon: Settings },
  ];

  const recruiterLinks = [
    { href: "/recruiter", label: "Talent Hub", icon: LayoutDashboard },
    { href: "/recruiter/company", label: "Company Profile", icon: Building2 },
    { href: "/recruiter/jobs", label: "Manage Jobs", icon: Briefcase },
    { href: "/recruiter/candidates", label: "Candidate Search", icon: Users, highlight: true },
    { href: "/recruiter/applications", label: "Applications", icon: FileText },
    { href: "/recruiter/settings", label: "Settings", icon: Settings },
  ];

  const adminLinks = [
    { href: "/admin", label: "Admin Console", icon: LayoutDashboard },
    { href: "/admin/analytics", label: "Platform Analytics", icon: BarChart3, highlight: true },
    { href: "/admin/users", label: "User Management", icon: Users },
    { href: "/admin/courses", label: "Course Management", icon: BookOpen },
    { href: "/admin/jobs", label: "Job Moderation", icon: Briefcase },
    { href: "/admin/recruiters", label: "Recruiter Verification", icon: ShieldAlert },
    { href: "/admin/projects", label: "Project Moderation", icon: FolderGit2 },
  ];

  const links =
    role === "admin"
      ? adminLinks
      : role === "recruiter"
      ? recruiterLinks
      : studentLinks;

  return (
    <aside
      className={`sticky top-16 h-[calc(100vh-4rem)] border-r border-slate-200 dark:border-[#232336] bg-slate-50 dark:bg-[#0E0E15] transition-all duration-200 flex flex-col justify-between select-none z-30 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="p-3 space-y-6 overflow-y-auto">
        {/* Role banner */}
        {!collapsed && (
          <div className="p-3 rounded-xl bg-[#151520] border border-[#232336] flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                role === "student"
                  ? "bg-[#8B5CF6]/20 text-[#D0BCFF]"
                  : role === "recruiter"
                  ? "bg-[#6366F1]/20 text-[#C0C1FF]"
                  : "bg-[#22C55E]/20 text-[#4AE176]"
              }`}
            >
              {role === "student" ? (
                <GraduationCap className="w-4 h-4" />
              ) : role === "recruiter" ? (
                <Building2 className="w-4 h-4" />
              ) : (
                <ShieldAlert className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#94A3B8]">
                Current Workspace
              </span>
              <p className="text-xs font-semibold text-[#F5F3FF] capitalize truncate">
                {role} Portal
              </p>
            </div>
          </div>
        )}

        {/* Navigation items */}
        <nav className="space-y-1">
          {links.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/student" &&
                item.href !== "/recruiter" &&
                item.href !== "/admin" &&
                pathname.startsWith(item.href));

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#1F1F26] text-[#F5F3FF] border border-[#2A2931] shadow-sm"
                    : "text-[#94A3B8] hover:text-[#F5F3FF] hover:bg-[#151520]"
                } ${collapsed ? "justify-center px-0" : ""}`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? "text-[#8B5CF6]"
                      : item.highlight
                      ? "text-[#A078FF]"
                      : "text-[#94A3B8]"
                  }`}
                />
                {!collapsed && (
                  <span className="truncate">{item.label}</span>
                )}
                {!collapsed && item.highlight && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-pulse shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Collapse button at bottom */}
      <div className="p-3 border-t border-[#232336]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`flex items-center gap-2 w-full py-2 px-3 rounded-lg text-xs text-[#94A3B8] hover:text-[#F5F3FF] hover:bg-[#151520] transition-colors ${
            collapsed ? "justify-center px-0" : ""
          }`}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
