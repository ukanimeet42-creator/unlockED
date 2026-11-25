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
  Bell,
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
    { href: "/student/notifications", label: "Notifications", icon: Bell },
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
    { href: "/admin/notifications", label: "System Events", icon: Bell },
  ];

  const activeRole =
    role ||
    (pathname.startsWith("/admin")
      ? "admin"
      : pathname.startsWith("/recruiter")
      ? "recruiter"
      : "student");

  const links =
    activeRole === "admin"
      ? adminLinks
      : activeRole === "recruiter"
      ? recruiterLinks
      : studentLinks;

  const roleAccent =
    activeRole === "admin"
      ? { label: "Governance Console", badge: "ADMIN", iconColor: "text-[#F59E0B] bg-[#F59E0B]/15 border-[#F59E0B]/30" }
      : activeRole === "recruiter"
      ? { label: "Talent Hub", badge: "RECRUITER", iconColor: "text-[#22D3EE] bg-[#22D3EE]/15 border-[#22D3EE]/30" }
      : { label: "Learning Universe", badge: "STUDENT", iconColor: "text-[#00DC82] bg-[#10B981]/15 border-[#16382C]" };

  return (
    <>
      {/* Mobile / Tablet Quick Workspace Nav */}
      <div className="md:hidden sticky top-16 z-30 border-b border-[#143326] bg-[#07130E]/95 backdrop-blur-md px-3 py-2.5 overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
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
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-[#0F271D] text-[#00DC82] border border-[#16382C]"
                    : "text-[#8FA69B] hover:text-[#F0FDF4] bg-[#0A1913]/60 border border-transparent"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <aside
        className={`hidden md:flex sticky top-16 h-[calc(100vh-4rem)] border-r border-[#143326] bg-[#07130E] transition-all duration-200 flex-col justify-between select-none z-30 shrink-0 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="p-3 space-y-5 overflow-y-auto">
          {!collapsed && (
            <div className="p-3 rounded-xl bg-[#0A1913] border border-[#143326] flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${roleAccent.iconColor}`}>
                {activeRole === "student" ? (
                  <GraduationCap className="w-4 h-4" />
                ) : activeRole === "recruiter" ? (
                  <Building2 className="w-4 h-4" />
                ) : (
                  <ShieldAlert className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#5D7A6E]">
                  {roleAccent.badge}
                </span>
                <p className="text-xs font-semibold text-[#F0FDF4] truncate">
                  {roleAccent.label}
                </p>
              </div>
            </div>
          )}

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
                    ? "bg-[#0F271D] text-[#00DC82] border border-[#16382C] shadow-sm"
                    : "text-[#8FA69B] hover:text-[#F0FDF4] hover:bg-[#0A1913]"
                } ${collapsed ? "justify-center px-0" : ""}`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? "text-[#00DC82]"
                      : item.highlight
                      ? "text-[#22D3EE]"
                      : "text-[#8FA69B]"
                  }`}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && item.highlight && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#22D3EE] animate-pulse shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-[#143326]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`flex items-center gap-2 w-full py-2 px-3 rounded-lg text-xs text-[#8FA69B] hover:text-[#F0FDF4] hover:bg-[#0A1913] transition-colors cursor-pointer ${
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
    </>
  );
}
