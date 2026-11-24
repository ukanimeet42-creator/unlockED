import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased flex flex-col selection:bg-[#8B5CF6]/30 selection:text-[#F5F3FF]">
        <ThemeProvider defaultTheme="dark">
          <AuthProvider>
            <Suspense fallback={<div className="h-16 w-full border-b border-[#232336] bg-[#13131A]" />}>
              <Navbar />
            </Suspense>
            <div className="flex-1 flex flex-col">{children}</div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
