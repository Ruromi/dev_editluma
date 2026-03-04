"use client";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section
      className="relative w-full overflow-hidden bg-gradient-to-br from-indigo-950 to-gray-900"
      style={{ minHeight: 480 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/landing/hero-user.jpg"
        alt="EditLuma — AI 인물 보정 서비스 — 실제 인물 사진 피부·선명도·색감 업스케일"
        className="w-full object-cover object-top"
        style={{ maxHeight: 520, display: "block" }}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-black/40 px-6 text-center">
        <h1 className="text-4xl font-bold leading-tight text-white drop-shadow-lg sm:text-5xl">
          AI 인물 사진·영상 보정
          <br />
          <span className="text-indigo-300">+ BGM 자동 삽입</span>
        </h1>
        <p className="max-w-xl text-base text-gray-200 drop-shadow sm:text-lg">
          셀피·인물사진을 업로드하면 AI가 피부·색감을 보정하고
          <br className="hidden sm:block" />
          쇼츠 영상에 어울리는 BGM을 자동으로 붙여드립니다.
        </p>
        <div className="flex gap-4">
          <Link
            href="/dashboard"
            className="rounded-lg bg-indigo-600 px-7 py-3 font-semibold text-white transition hover:bg-indigo-500"
          >
            무료로 시작하기
          </Link>
          <a
            href="#features"
            className="rounded-lg border border-white/30 bg-white/10 px-7 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            기능 보기
          </a>
        </div>
      </div>
    </section>
  );
}
