"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell, Sparkles, BookOpen, Briefcase, Award } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Notification } from "@/types";
import { formatRelativeTime } from "@/lib/utils";

export function NotificationPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markNotificationRead, markAllNotificationsRead, role } = useAuth();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "application_update":
        return <Briefcase className="w-4 h-4 text-[#22D3EE]" />;
      case "course_achievement":
        return <Award className="w-4 h-4 text-[#00DC82]" />;
      case "ai_recommendation":
        return <Sparkles className="w-4 h-4 text-[#10B981]" />;
      default:
        return <BookOpen className="w-4 h-4 text-[#34D399]" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg border border-[#143326] bg-[#0A1913] text-[#8FA69B] hover:text-[#F0FDF4] hover:border-[#10B981] transition-colors cursor-pointer"
        title="Notifications"
        aria-label="Open notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#00DC82] text-[10px] font-bold text-slate-950 shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[#143326] bg-[#0A1913] p-4 shadow-2xl z-50">
            <div className="flex items-center justify-between pb-3 border-b border-[#143326]">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-[#F0FDF4]">Notifications</h4>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-[#10B981]/15 px-2 py-0.5 text-xs font-semibold text-[#00DC82]">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllNotificationsRead()}
                  className="text-xs text-[#8FA69B] hover:text-[#00DC82] transition-colors cursor-pointer"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="mt-3 max-h-80 overflow-y-auto space-y-2 pr-1">
              {notifications.length === 0 ? (
                <p className="py-6 text-center text-xs text-[#5D7A6E]">
                  No notifications recorded yet.
                </p>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                      n.read
                        ? "bg-[#06100C]/60 border-transparent text-[#8FA69B]"
                        : "bg-[#0F271D] border-[#16382C] text-[#E6F4EA]"
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-[#0A1913] shrink-0 border border-[#143326]">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-[#F0FDF4] truncate">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-[#5D7A6E] shrink-0">
                          {formatRelativeTime(n.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-[#8FA69B] mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {(role === "student" || role === "admin") && (
              <div className="pt-3 mt-3 border-t border-[#143326] text-center">
                <Link
                  href={role === "admin" ? "/admin/notifications" : "/student/notifications"}
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-[#10B981] hover:underline font-medium"
                >
                  View all notification history
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
