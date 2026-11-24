"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  MoreVertical,
  ArrowLeft,
  UserCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<{
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: string;
    joinedAt: string;
    readiness: string;
  }[]>([]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const changeRole = (id: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
    );
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#F5F3FF] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Console
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F3FF]">
          User Access & Role Management
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
          Server-side role assignment and account state control. Public signup never assigns the admin role.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-3.5" />
          <Input
            placeholder="Search by user name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {["all", "student", "recruiter", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg border capitalize transition-all ${
                roleFilter === r
                  ? "bg-[#8B5CF6] text-white border-[#8B5CF6]"
                  : "bg-[#151520] border-[#232336] text-[#94A3B8] hover:text-[#F5F3FF]"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="bg-[#151520] border-[#232336] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#101018] border-b border-[#232336] text-[#94A3B8] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4">Verification</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#143326] text-[#E6F4EA]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[#8FA69B]">
                    No registered accounts found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#1A1A26] transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-[#F5F3FF]">{u.name}</p>
                    <p className="text-[11px] text-[#94A3B8]">{u.email}</p>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={
                        u.role === "admin"
                          ? "emerald"
                          : u.role === "recruiter"
                          ? "indigo"
                          : "default"
                      }
                      className="capitalize"
                    >
                      {u.role}
                    </Badge>
                  </td>
                  <td className="p-4 font-mono text-xs text-[#22C55E]">
                    {u.readiness}
                  </td>
                  <td className="p-4 text-[#94A3B8]">{u.joinedAt}</td>
                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <select
                        value={u.role}
                        onChange={(e) => changeRole(u.id, e.target.value as UserRole)}
                        className="rounded-lg border border-[#232336] bg-[#101018] px-2 py-1 text-xs text-[#F5F3FF] focus:border-[#8B5CF6] focus:outline-none"
                      >
                        <option value="student">Student</option>
                        <option value="recruiter">Recruiter</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
