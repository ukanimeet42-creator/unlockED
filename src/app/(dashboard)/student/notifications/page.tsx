"use client";

import React from "react";
import { useAuth } from "@/context/auth-context";
import { Bell, CheckCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";

export default function StudentNotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAuth();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-4xl space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#143326] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F0FDF4]">Notifications</h1>
          <p className="text-xs sm:text-sm text-[#8FA69B] mt-1">
            Live activity alerts for course milestones, assessments, and application status updates.
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
            Mark All Read ({unread})
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell className="w-10 h-10 text-[#143326] mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#F0FDF4]">No notifications yet</p>
          <p className="text-xs text-[#8FA69B] mt-1">
            Platform events will appear here automatically.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`p-4 flex items-start justify-between gap-4 cursor-pointer ${
                n.read ? "opacity-75" : "border-[#10B981]/50 bg-[#0D221A]"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#F0FDF4]">{n.title}</h3>
                  {!n.read && <Badge variant="emerald">New</Badge>}
                </div>
                <p className="text-xs text-[#8FA69B]">{n.message}</p>
              </div>
              <span className="text-[11px] font-mono text-[#5D7A6E] shrink-0">
                {formatRelativeTime(n.created_at)}
              </span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
