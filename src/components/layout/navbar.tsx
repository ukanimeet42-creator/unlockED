"use client";

import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { NotificationPopover } from "./notification-popover";
import {
  Sparkles,
  Layers,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  FolderGit2,
  Briefcase,
  Settings,
  ShieldCheck,
  Radio,
} from "lucide-react";

const subscribeNoop = () => () => {};

export function Navbar() {
  const pathname = usePathname();
  const isHydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );
  const { user, role, isAuthenticated, isLoading, realtimeStatus, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const clientRole = isHydrated ? role : null;
  const clientAuth = isHydrated && isAuthenticated;
  const clientLoading = !isHydrated || isLoading;

  const dashboardHref =
    clientRole === "admin"
      ? "/admin"
      : clientRole === "recruiter"
      ? "/recruiter"
      : "/student";

  const navLinks =
    clientRole === "admin"
      ? [
          { href: "/admin", label: "Console" },
          { href: "/admin/analytics", label: "Analytics" },
          { href: "/admin/users", label: "Users" },
          { href: "/admin/recruiters", label: "Partners" },
        ]
      : clientRole === "recruiter"
      ? [
          { href: "/recruiter", label: "Talent Hub" },
          { href: "/recruiter/jobs", label: "Manage Jobs" },
          { href: "/recruiter/candidates", label: "Candidates" },
          { href: "/recruiter/applications", label: "Applications" },
        ]
      : [
          { href: clientAuth ? "/student/courses" : "/courses", label: "Curriculum" },
          { href: clientAuth ? "/student/assessments" : "/courses", label: "Benchmarks" },
          { href: clientAuth ? "/student/jobs" : "/login?redirectTo=/student/jobs", label: "Opportunities" },
          { href: clientAuth ? "/student/ai-assistant" : "/login?redirectTo=/student/ai-assistant", label: "AI Pathfinder", isAi: true },
        ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#143326] bg-[#06100C]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand + Role-Aware Links */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#059669] via-[#10B981] to-[#22D3EE] flex items-center justify-center shadow-md shadow-[#10B981]/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-slate-950" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-[#F0FDF4] text-base group-hover:text-[#00DC82] transition-colors leading-none">
                UnlockED
              </span>
              <span className="text-[10px] text-[#5D7A6E] tracking-wider uppercase font-semibold">
                Learn · Build · Connect
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1.5 pl-4 border-l border-[#143326]">
            {navLinks.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" &&
                  item.href !== "/recruiter" &&
                  item.href !== "/courses" &&
                  pathname.startsWith(item.href.split("?")[0]));

              if (item.isAi) {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="ml-1 px-3 py-1.5 rounded-full border border-[#22D3EE]/30 bg-[#0A1913] text-[#22D3EE] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#0E241B] hover:border-[#00DC82] transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#00DC82]" />
                    {item.label}
                  </Link>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-[#0F271D] text-[#00DC82] border border-[#16382C]"
                      : "text-[#8FA69B] hover:text-[#F0FDF4] hover:bg-[#0A1913]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          {clientAuth && (
            <>
              {/* Realtime Sync Status Pill */}
              <div
                title={
                  realtimeStatus === "connected"
                    ? "Real-time channel active"
                    : "Synchronizing via periodic polling"
                }
                className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0A1913] border border-[#143326] text-[10px] font-mono text-[#8FA69B]"
              >
                <Radio
                  className={`w-3 h-3 ${
                    realtimeStatus === "connected"
                      ? "text-[#00DC82] animate-pulse"
                      : "text-[#F59E0B]"
                  }`}
                />
                <span>{realtimeStatus === "connected" ? "Live" : "Sync"}</span>
              </div>

              <NotificationPopover />

              <Link href={dashboardHref}>
                <Button
                  variant="secondary"
                  size="sm"
                  className="hidden sm:inline-flex text-xs rounded-full px-4"
                >
                  Workspace
                </Button>
              </Link>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full border border-[#16382C] bg-[#0A1913] hover:border-[#10B981] transition-colors cursor-pointer"
                  aria-label="Open account menu"
                >
                  <div className="w-7 h-7 rounded-full bg-[#10B981]/20 text-[#00DC82] flex items-center justify-center text-xs font-bold">
                    {user?.full_name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#8FA69B] pr-1" />
                </button>

                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-[#143326] bg-[#0A1913] p-2 shadow-2xl z-50">
                      <div className="px-3 py-2 border-b border-[#143326] mb-1">
                        <p className="text-xs font-semibold text-[#F0FDF4] truncate">
                          {user?.full_name}
                        </p>
                        <p className="text-[11px] text-[#8FA69B] truncate">{user?.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#00DC82]">
                          {role}
                        </span>
                      </div>

                      <Link
                        href={dashboardHref}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#E6F4EA] hover:bg-[#0E241B] transition-colors"
                      >
                        <Layers className="w-3.5 h-3.5 text-[#10B981]" />
                        My Workspace
                      </Link>

                      {role === "student" && (
                        <>
                          <Link
                            href="/student/portfolio"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#E6F4EA] hover:bg-[#0E241B] transition-colors"
                          >
                            <FolderGit2 className="w-3.5 h-3.5 text-[#00DC82]" />
                            Project Portfolio
                          </Link>
                          <Link
                            href="/student/settings"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#E6F4EA] hover:bg-[#0E241B] transition-colors"
                          >
                            <User className="w-3.5 h-3.5 text-[#22D3EE]" />
                            Profile & Settings
                          </Link>
                        </>
                      )}

                      {role === "recruiter" && (
                        <>
                          <Link
                            href="/recruiter/company"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#E6F4EA] hover:bg-[#0E241B] transition-colors"
                          >
                            <Briefcase className="w-3.5 h-3.5 text-[#00DC82]" />
                            Company Profile
                          </Link>
                          <Link
                            href="/recruiter/settings"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#E6F4EA] hover:bg-[#0E241B] transition-colors"
                          >
                            <Settings className="w-3.5 h-3.5 text-[#22D3EE]" />
                            Account Settings
                          </Link>
                        </>
                      )}

                      {role === "admin" && (
                        <Link
                          href="/admin/users"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#E6F4EA] hover:bg-[#0E241B] transition-colors"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-[#00DC82]" />
                          User Governance
                        </Link>
                      )}

                      <div className="border-t border-[#143326] my-1 pt-1">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-[#F87171] hover:bg-[#0E241B] transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {!clientAuth && !clientLoading && (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-xs">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="gradient" size="sm" className="text-xs rounded-full px-4">
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-[#143326] bg-[#0A1913] text-[#8FA69B]"
            aria-label="Toggle mobile navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#143326] bg-[#081510] px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-[#E6F4EA] hover:bg-[#0F271D]"
            >
              {item.label}
            </Link>
          ))}
          {clientAuth ? (
            <Link
              href={dashboardHref}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#022C22] bg-gradient-to-r from-[#00DC82] to-[#10B981]"
            >
              Open Workspace
            </Link>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" className="w-full text-xs">
                  Sign In
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="gradient" className="w-full text-xs">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
