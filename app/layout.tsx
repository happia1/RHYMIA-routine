import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

/**
 * 루트 레이아웃 (Next.js App Router 필수)
 * 프로필 없으면 /onboarding 리다이렉트, 온보딩이 아닐 때만 하단 탭바 표시.
 */
export const metadata: Metadata = {
  title: "RHYMIA Routine",
  description: "RHYMIA 루틴 앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
