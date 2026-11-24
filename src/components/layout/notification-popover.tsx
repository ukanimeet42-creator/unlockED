"use client";

import React, { useState } from "react";
import { Bell, Check, Sparkles, BookOpen, Briefcase, Award } from "lucide-react";
import { Notification } from "@/types";
import { formatRelativeTime } from "@/lib/utils";

export function NotificationPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markOneAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "application_update":
        return <Briefcase className="w-4 h-4 text-[#8B5CF6]" />;
      case "course_achievement":
        return <Award className="w-4 h-4 text-[#22C55E]" />;
      case "ai_recommendation":
        return <Sparkles className="w-4 h-4 text-[#A078FF]" />;
      default:
        return <BookOpen className="w-4 h-4 text-[#6366F1]" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg border border-[#232336] bg-[#101018] text-[#94A3B8] hover:text-[#F5F3FF] hover:border-[#363654] transition-colors"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#8B5CF6] text-[10px] font-bold text-white shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[#232336] bg-[#151520] p-4 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-[#232336]">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-[#F5F3FF]">Notifications</h4>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-[#8B5CF6]/15 px-2 py-0.5 text-xs font-semibold text-[#8B5CF6]">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-[#94A3B8] hover:text-[#F5F3FF] transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="mt-3 max-h-80 overflow-y-auto space-y-2 pr-1">
              {notifications.length === 0 ? (
                <p className="py-6 text-center text-xs text-[#64748B]">
                  No notifications yet.
                </p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markOneAsRead(n.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                      n.read
                        ? "bg-[#101018]/50 border-transparent text-[#94A3B8]"
                        : "bg-[#1F1F26] border-[#2A2931] text-[#E4E1EC]"
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-[#151520] shrink-0 border border-[#232336]">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-[#F5F3FF] truncate">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-[#64748B] shrink-0">
                          {formatRelativeTime(n.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-[#94A3B8] mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
