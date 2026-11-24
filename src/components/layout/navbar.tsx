"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { NotificationPopover } from "./notification-popover";
import {
  Sparkles,
  BookOpen,
  Briefcase,
  Award,
  Layers,
  ShieldCheck,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  FolderGit2,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, setRole, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isDashboard =
    pathname.startsWith("/student") ||
    pathname.startsWith("/recruiter") ||
    pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#143326] bg-[#07130E]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#059669] to-[#10B981] flex items-center justify-center shadow-md shadow-[#10B981]/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-[#F0FDF4] text-base group-hover:text-[#34D399] transition-colors leading-none">
                UnlockED
              </span>
              <span className="text-[10px] text-[#8FA69B] tracking-wider uppercase font-semibold">
                Obsidian Kinetic
              </span>
            </div>
          </Link>

          {/* Nav links on desktop */}
          <nav className="hidden md:flex items-center gap-1.5 pl-4 border-l border-[#143326]">
            <Link
              href="/student/courses"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                pathname.includes("/courses")
                  ? "bg-[#0F271D] text-[#F0FDF4]"
                  : "text-[#8FA69B] hover:text-[#F0FDF4] hover:bg-[#0A1913]"
              }`}
            >
              Curriculum
            </Link>
            <Link
              href="/student/assessments"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                pathname.includes("/assessments")
                  ? "bg-[#0F271D] text-[#F0FDF4]"
                  : "text-[#8FA69B] hover:text-[#F0FDF4] hover:bg-[#0A1913]"
              }`}
            >
              Skill Benchmark
            </Link>
            <Link
              href="/student/jobs"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                pathname.includes("/jobs")
                  ? "bg-[#0F271D] text-[#F0FDF4]"
                  : "text-[#8FA69B] hover:text-[#F0FDF4] hover:bg-[#0A1913]"
              }`}
            >
              Opportunities
            </Link>
            <Link
              href="/student/ai-assistant"
              className="ml-1 px-3 py-1 rounded-full border border-[#F59E0B]/35 bg-[#F59E0B]/10 text-[#FCD34D] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#F59E0B]/20 hover:border-[#F59E0B]/50 transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
              AI Pathfinder
            </Link>
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Role Switcher Pill */}
          <div className="hidden sm:flex items-center p-1 rounded-full bg-[#0B1A14] border border-[#142E23] text-[11px] font-semibold">
            <span className="text-[#5D7A6E] px-2 text-[10px] uppercase tracking-wider">Role:</span>
            <button
              onClick={() => {
                setRole("student");
                if (isDashboard) router.push("/student");
              }}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                role === "student"
                  ? "bg-[#10B981] text-slate-950 font-bold shadow-sm shadow-[#10B981]/30"
                  : "text-[#8FA69B] hover:text-[#F0FDF4]"
              }`}
            >
              Student
            </button>
            <button
              onClick={() => {
                setRole("recruiter");
                if (isDashboard) router.push("/recruiter");
              }}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                role === "recruiter"
                  ? "bg-[#059669] text-white font-bold shadow-sm shadow-[#059669]/30"
                  : "text-[#8FA69B] hover:text-[#F0FDF4]"
              }`}
            >
              Recruiter
            </button>
            <button
              onClick={() => {
                setRole("admin");
                if (isDashboard) router.push("/admin");
              }}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                role === "admin"
                  ? "bg-[#00DC82] text-slate-950 font-bold shadow-sm shadow-[#00DC82]/30"
                  : "text-[#8FA69B] hover:text-[#F0FDF4]"
              }`}
            >
              Admin
            </button>
          </div>

          {/* Notifications */}
          <NotificationPopover />

          {/* Dashboard Direct Button */}
          <Link
            href={
              role === "student"
                ? "/student"
                : role === "recruiter"
                ? "/recruiter"
                : "/admin"
            }
          >
            <Button variant="secondary" size="sm" className="hidden sm:inline-flex text-xs rounded-full px-4 border border-[#16382C] bg-[#0A1913] hover:border-[#10B981]">
              Dashboard
            </Button>
          </Link>

          {/* User profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-full border border-[#232336] bg-[#101018] hover:border-[#8B5CF6] transition-colors"
            >
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#8B5CF6]/20 text-[#D0BCFF] flex items-center justify-center text-xs font-semibold">
                  {user?.full_name?.charAt(0) || "U"}
                </div>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] pr-1" />
            </button>

            {userDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#232336] bg-[#151520] p-2 shadow-xl z-50">
                  <div className="px-3 py-2 border-b border-[#232336] mb-1">
                    <p className="text-xs font-semibold text-[#F5F3FF] truncate">
                      {user?.full_name}
                    </p>
                    <p className="text-[11px] text-[#94A3B8] truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#C4B5FD]">
                      {role}
                    </span>
                  </div>

                  <Link
                    href={
                      role === "student"
                        ? "/student"
                        : role === "recruiter"
                        ? "/recruiter"
                        : "/admin"
                    }
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#E4E1EC] hover:bg-[#1F1F26] transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5 text-[#8B5CF6]" />
                    My Workspace
                  </Link>
                  <Link
                    href="/student/portfolio"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#E4E1EC] hover:bg-[#1F1F26] transition-colors"
                  >
                    <FolderGit2 className="w-3.5 h-3.5 text-[#22C55E]" />
                    Project Portfolio
                  </Link>
                  <Link
                    href="/student/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#E4E1EC] hover:bg-[#1F1F26] transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-[#6366F1]" />
                    Profile & Settings
                  </Link>

                  <div className="border-t border-[#232336] my-1 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-[#F87171] hover:bg-[#1F1F26] transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-[#232336] bg-[#101018] text-[#94A3B8]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#232336] bg-[#13131A] px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-3 gap-1 p-1 bg-[#101018] rounded-xl border border-[#232336] text-xs">
            <button
              onClick={() => {
                setRole("student");
                setMobileMenuOpen(false);
              }}
              className={`py-1.5 rounded-lg text-center ${
                role === "student" ? "bg-[#8B5CF6] text-white" : "text-[#94A3B8]"
              }`}
            >
              Student
            </button>
            <button
              onClick={() => {
                setRole("recruiter");
                setMobileMenuOpen(false);
              }}
              className={`py-1.5 rounded-lg text-center ${
                role === "recruiter" ? "bg-[#6366F1] text-white" : "text-[#94A3B8]"
              }`}
            >
              Recruiter
            </button>
            <button
              onClick={() => {
                setRole("admin");
                setMobileMenuOpen(false);
              }}
              className={`py-1.5 rounded-lg text-center ${
                role === "admin" ? "bg-[#22C55E] text-slate-950 font-bold" : "text-[#94A3B8]"
              }`}
            >
              Admin
            </button>
          </div>

          <div className="space-y-1">
            <Link
              href="/student/courses"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-[#E4E1EC] hover:bg-[#1F1F26]"
            >
              Courses
            </Link>
            <Link
              href="/student/assessments"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-[#E4E1EC] hover:bg-[#1F1F26]"
            >
              Skill Assessments
            </Link>
            <Link
              href="/student/jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-[#E4E1EC] hover:bg-[#1F1F26]"
            >
              Job Openings
            </Link>
            <Link
              href="/student/ai-assistant"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-[#D0BCFF] hover:bg-[#1F1F26]"
            >
              AI Career Assistant
            </Link>
            <Link
              href={
                role === "student"
                  ? "/student"
                  : role === "recruiter"
                  ? "/recruiter"
                  : "/admin"
              }
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-white bg-[#8B5CF6]/20 border border-[#8B5CF6]/30"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
