import Link from "next/link";

const features = [
  {
    title: "인물 화질 보정 · Upscale",
    desc: "셀피·인물사진의 피부 선명도·색감을 AI가 복원. 최대 4K 업스케일링.",
    img: "/landing/feature-enhance.svg",
    alt: "인물 화질 보정 예시 — 피부·선명도 before/after 비교",
  },
  {
    title: "AI 인물 이미지 생성",
    desc: "\"20대 여성, 카페\" 한 줄 프롬프트로 원하는 인물 사진을 즉시 생성.",
    img: "/landing/feature-generate.svg",
    alt: "AI 인물 생성 예시 — 텍스트 프롬프트로 인물 사진 생성",
  },
  {
    title: "쇼츠 BGM 자동 삽입",
    desc: "인물 영상의 분위기를 분석해 어울리는 BGM을 자동으로 매칭·삽입.",
    img: "/landing/feature-music.svg",
    alt: "BGM 자동 삽입 예시 — 크리에이터 쇼츠 영상에 BGM 웨이브폼",
  },
];

const gallery = [
  { src: "/landing/gallery-1.svg", alt: "AI 보정 샘플 — 셀피 인물 사진 보정" },
  { src: "/landing/gallery-2.svg", alt: "AI 보정 샘플 — 스트릿 포트레이트 보정" },
  { src: "/landing/gallery-3.svg", alt: "AI 생성 샘플 — 크리에이터 썸네일 인물" },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* ── Hero ── */}
      <section className="relative -mx-6 -mt-8 overflow-hidden rounded-b-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/landing/hero-main.svg"
          alt="EditLuma — AI 인물 보정 before/after 비교 — 피부·선명도·색감 업스케일"
          className="w-full object-cover"
          style={{ maxHeight: 520, display: "block" }}
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

      {/* ── Feature Cards ── */}
      <section id="features" className="flex flex-col gap-6">
        <h2 className="text-center text-2xl font-bold text-white">주요 기능</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.img}
                alt={f.alt}
                className="w-full object-cover"
                style={{ display: "block" }}
              />
              <div className="p-5">
                <h3 className="mb-1 font-semibold text-white">{f.title}</h3>
                <p className="text-sm text-gray-400">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Sample Gallery ── */}
      <section className="flex flex-col gap-6">
        <h2 className="text-center text-2xl font-bold text-white">샘플 갤러리</h2>
        <p className="text-center text-sm text-gray-500">
          셀피·스트릿 포트레이트·크리에이터 썸네일 — AI 보정·생성 예시
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {gallery.map((g) => (
            <div
              key={g.src}
              className="overflow-hidden rounded-xl border border-gray-800"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={g.src}
                alt={g.alt}
                className="w-full object-cover"
                style={{ display: "block" }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Bottom ── */}
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
    </div>
  );
}
