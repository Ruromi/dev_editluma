"use client";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24">
      {/* Background gradient orbs */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, #6366f1 0%, #4f46e5 30%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute top-60 -right-40 w-[400px] h-[400px] rounded-full opacity-10 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, #a78bfa 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-800 bg-gray-900/80 px-4 py-1.5 text-xs text-gray-400 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
          AI-Powered Image Studio
        </div>

        {/* Headline */}
        <h1 className="text-4xl font-bold leading-[1.15] tracking-tight text-white sm:text-6xl">
          사진 한 장의 차이,
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            AI가 만듭니다
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-gray-400 sm:text-lg">
          업로드 한 번으로 인물 보정부터
          <br className="hidden sm:block" />
          프롬프트 한 줄로 이미지 생성까지.
        </p>

        {/* CTA */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25"
          >
            무료로 시작하기
          </Link>
          <a
            href="#features"
            className="rounded-xl border border-gray-700 px-8 py-3.5 text-sm font-semibold text-gray-300 transition-all hover:border-gray-600 hover:bg-gray-900 hover:text-white"
          >
            기능 보기
          </a>
        </div>
      </div>

    </section>
  );
}
