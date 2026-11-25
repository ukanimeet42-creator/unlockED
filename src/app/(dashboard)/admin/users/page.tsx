"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Search, ArrowLeft, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Profile, UserRole } from "@/types";
import { formatDate } from "@/lib/utils";

type GovernedUser = Profile & { passedBenchmarks: number };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<GovernedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const loadUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users", { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      setUsers(json.users || []);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/users", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (active && json?.users) setUsers(json.users);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const changeRole = async (userId: string, role: UserRole) => {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });
    if (res.ok) loadUsers();
  };

  const toggleStatus = async (user: GovernedUser) => {
    const nextStatus = user.status === "suspended" ? "active" : "suspended";
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, status: nextStatus }),
    });
    if (res.ok) loadUsers();
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 pb-20">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-[#8FA69B] hover:text-[#F0FDF4]">
        <ArrowLeft className="w-4 h-4" /> Back to Console
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">
          User Access & Governance
        </h1>
        <p className="text-xs sm:text-sm text-[#8FA69B] mt-1">
          Server-enforced role assignment and instant account suspension/reactivation backed by Supabase Auth.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-[#5D7A6E] absolute left-3 top-3.5" />
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
              className={`px-3 py-1.5 rounded-lg border capitalize cursor-pointer transition-all ${
                roleFilter === r
                  ? "bg-[#10B981] text-slate-950 font-bold border-[#10B981]"
                  : "bg-[#0A1913] border-[#143326] text-[#8FA69B] hover:text-[#F0FDF4]"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#07130E] border-b border-[#143326] text-[#8FA69B] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined</th>
                <th className="p-4 text-right">Governance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#143326] text-[#E6F4EA]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#8FA69B]">Loading registered users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[#8FA69B]">
                    No registered accounts match your query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#0D221A] transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-[#F0FDF4]">{u.full_name}</p>
                      <p className="text-[11px] text-[#8FA69B]">{u.email}</p>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={u.role === "admin" ? "emerald" : u.role === "recruiter" ? "indigo" : "default"}
                        className="capitalize"
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant={u.status === "suspended" ? "error" : "emerald"}>
                        {u.status === "suspended" ? "Suspended" : "Active"}
                      </Badge>
                    </td>
                    <td className="p-4 text-[#8FA69B]">{formatDate(u.created_at)}</td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <select
                          value={u.role}
                          onChange={(e) => changeRole(u.id, e.target.value as UserRole)}
                          className="rounded-lg border border-[#143326] bg-[#06100C] px-2 py-1 text-xs text-[#F0FDF4]"
                        >
                          <option value="student">Student</option>
                          <option value="recruiter">Recruiter</option>
                          <option value="admin">Admin</option>
                        </select>
                        <Button
                          size="sm"
                          variant={u.status === "suspended" ? "gradient" : "outline"}
                          onClick={() => toggleStatus(u)}
                          className="text-xs h-7 gap-1"
                        >
                          {u.status === "suspended" ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Activate
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="w-3 h-3 text-rose-400" /> Suspend
                            </>
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
