import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import DashboardNav from "@/components/DashboardNav";
import UserMenu from "@/components/UserMenu";
import "./globals.css";

export const metadata: Metadata = {
  title: "EditLuma",
  description: "AI-powered image & video enhancement with BGM",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-gray-950 text-gray-100 min-h-screen">
        <header className="border-b border-gray-800 px-6 h-14 flex items-center">
          {/* 좌: 로고 */}
          <div className="flex items-center gap-2 w-40">
            <Link href="/" className="text-xl font-bold text-indigo-400 hover:text-indigo-300 transition-colors">EditLuma</Link>
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">dev</span>
          </div>
          {/* 중앙: 대시보드 탭 nav */}
          <div className="flex-1 flex justify-center">
            <Suspense>
              <DashboardNav />
            </Suspense>
          </div>
          {/* 우: 사용자 메뉴 */}
          <div className="w-40 flex justify-end">
            <Suspense>
              <UserMenu />
            </Suspense>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
