"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";

const TABS = [
  { id: "generate", label: "생성" },
  { id: "gallery", label: "갤러리" },
  { id: "history", label: "작업 내역" },
] as const;

export default function DashboardNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  if (!pathname.startsWith("/dashboard")) return null;

  const tab = searchParams.get("tab") ?? "generate";

  return (
    <nav className="flex items-center gap-6">
      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => router.replace(`/dashboard?tab=${t.id}`)}
          className={`text-sm font-medium transition-colors relative pb-0.5 ${
            tab === t.id
              ? "text-white"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          {t.label}
          {tab === t.id && (
            <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-indigo-500 rounded-full" />
          )}
        </button>
      ))}
    </nav>
  );
}
