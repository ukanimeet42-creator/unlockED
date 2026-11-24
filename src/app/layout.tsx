import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { Navbar } from "@/components/layout/navbar";

export const metadata: Metadata = {
  title: "UnlockED — AI-Powered Education & Career Platform",
  description:
    "Learn skills. Build projects. Prove your potential. Unlock opportunities. Production-calibrated learning and career platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#06100C] text-[#E6F4EA] font-sans antialiased flex flex-col selection:bg-[#10B981]/30 selection:text-white">
        <AuthProvider>
          <Suspense fallback={<div className="h-16 w-full border-b border-[#143326] bg-[#07130E]" />}>
            <Navbar />
          </Suspense>
          <div className="flex-1 flex flex-col">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
