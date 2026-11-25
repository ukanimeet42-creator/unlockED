"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { ArrowLeft, Bell, CheckCheck, Shield, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatRelativeTime } from "@/lib/utils";

interface AuditEntry {
  id: string;
  actor_id: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export default function AdminNotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    fetch("/api/admin/overview", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.auditLogs) setAuditLogs(json.auditLogs);
      })
      .finally(() => setLoadingLogs(false));
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  const filteredLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return auditLogs;
    return auditLogs.filter(
      (a) =>
        a.action.toLowerCase().includes(q) ||
        a.target_type.toLowerCase().includes(q) ||
        JSON.stringify(a.metadata || {}).toLowerCase().includes(q)
    );
  }, [auditLogs, searchQuery]);

  return (
    <div className="max-w-5xl space-y-6 pb-16">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs text-[#8FA69B] hover:text-[#F0FDF4]"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Admin Console
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#143326] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">
              System Events &amp; Audit Explorer
            </h1>
            <Badge variant="amber" dot>Governance Log</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#8FA69B] mt-1">
            Inspect administrative alerts alongside persisted RBAC and moderation audit events.
          </p>
        </div>

        {unread > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => markAllNotificationsRead()}
            className="gap-1.5 text-xs"
          >
            <CheckCheck className="w-3.5 h-3.5 text-[#00DC82]" />
            Mark All Read
          </Button>
        )}
      </div>

      <Tabs defaultValue="audit" className="w-full">
        <TabsList>
          <TabsTrigger value="audit">Audit Event Explorer ({auditLogs.length})</TabsTrigger>
          <TabsTrigger value="alerts">Admin Notifications ({notifications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-[#5D7A6E] absolute left-3 top-3.5" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search action, target type, metadata..."
              className="pl-9"
            />
          </div>

          {loadingLogs ? (
            <div className="h-32 rounded-2xl bg-[#0A1913] border border-[#143326] animate-pulse" />
          ) : filteredLogs.length === 0 ? (
            <Card className="p-12 text-center">
              <Shield className="w-10 h-10 text-[#143326] mx-auto mb-3" />
              <p className="text-sm font-semibold text-[#F0FDF4]">No matching audit records</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <Card key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#00DC82]">
                        {log.action}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {log.target_type}
                      </Badge>
                      {log.target_id && (
                        <span className="text-[11px] font-mono text-[#8FA69B]">
                          #{log.target_id.slice(0, 12)}
                        </span>
                      )}
                    </div>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <p className="text-[11px] font-mono text-[#8FA69B] break-all">
                        {JSON.stringify(log.metadata)}
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-[#5D7A6E] shrink-0">
                    {formatRelativeTime(log.created_at)}
                  </span>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-3">
          {notifications.length === 0 ? (
            <Card className="p-12 text-center">
              <Bell className="w-10 h-10 text-[#143326] mx-auto mb-3" />
              <p className="text-sm font-semibold text-[#F0FDF4]">No system alerts recorded</p>
            </Card>
          ) : (
            notifications.map((n) => (
              <Card
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`p-4 flex items-start justify-between gap-4 cursor-pointer ${
                  n.read ? "opacity-75" : "border-[#10B981]/50"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-[#F0FDF4]">{n.title}</h3>
                    {!n.read && <Badge variant="emerald">Unread</Badge>}
                  </div>
                  <p className="text-xs text-[#8FA69B]">{n.message}</p>
                </div>
                <span className="text-[11px] font-mono text-[#5D7A6E] shrink-0">
                  {formatRelativeTime(n.created_at)}
                </span>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
