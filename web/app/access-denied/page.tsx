import type { Metadata } from "next";

const REDIRECT_URL = "https://www.editluma.com";

export const metadata: Metadata = {
  title: "Access Denied | EditLuma dev",
  description: "Blocked access notice for the dev deployment",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-6 py-16">
      <script
        dangerouslySetInnerHTML={{
          __html: `window.setTimeout(function(){window.location.replace(${JSON.stringify(REDIRECT_URL)});}, 1800);`,
        }}
      />

      <div className="w-full max-w-lg rounded-[28px] border border-gray-800 bg-gray-950/90 p-8 text-center shadow-2xl shadow-black/40">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-300">
          접근 불가
        </div>

        <h1 className="text-2xl font-semibold text-white">
          접근할 수 없는 IP입니다.
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-400">
          이 개발 페이지는 허용된 IP에서만 접근할 수 있습니다.
          <br />
          잠시 후 <span className="text-gray-200">www.editluma.com</span> 으로 이동합니다.
        </p>

        <a
          href={REDIRECT_URL}
          className="mt-6 inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          지금 이동
        </a>
      </div>
    </div>
  );
}
