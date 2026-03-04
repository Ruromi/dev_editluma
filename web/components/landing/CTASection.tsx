import Link from "next/link";

export default function CTASection() {
  return (
    <section className="rounded-2xl border border-indigo-900/60 bg-gradient-to-br from-indigo-950 to-purple-950 p-10 text-center">
      <h2 className="mb-3 text-2xl font-bold text-white">
        지금 바로 업로드해보세요
      </h2>
      <p className="mb-6 text-gray-400">
        무료 플랜으로 오늘 바로 AI 보정을 경험하세요.
      </p>
      <Link
        href="/dashboard"
        className="inline-block rounded-lg bg-indigo-600 px-8 py-3 font-semibold text-white transition hover:bg-indigo-500"
      >
        대시보드로 이동 →
      </Link>
    </section>
  );
}
