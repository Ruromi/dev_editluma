import type { Metadata } from "next";
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
        <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-3">
          <span className="text-xl font-bold text-indigo-400">EditLuma</span>
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">dev</span>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
