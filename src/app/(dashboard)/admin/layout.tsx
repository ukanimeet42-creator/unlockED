import { Suspense } from "react";
import { Sidebar } from "@/components/layout/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-[#06100C] relative overflow-x-clip">
      <div className="pointer-events-none fixed inset-x-0 top-16 h-56 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.1),rgba(16,185,129,0.06)_50%,transparent_70%)] z-0" />
      <Suspense fallback={<div className="hidden md:block w-64 border-r border-[#143326] bg-[#07130E]" />}>
        <Sidebar />
      </Suspense>
      <main className="relative z-10 flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full">
        <Suspense fallback={<div className="text-xs text-[#8FA69B] p-8">Loading console...</div>}>
          {children}
        </Suspense>
      </main>
    </div>
  );
}
