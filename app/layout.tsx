import type { Metadata } from "next";
import "./globals.css";

/**
 * 루트 레이아웃 (Next.js App Router 필수)
 * 모든 페이지를 감싸며, 공통 HTML/body와 글로벌 스타일을 적용합니다.
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
