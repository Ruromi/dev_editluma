"use client";

const features = [
  {
    title: "인물 화질 보정 · Upscale",
    desc: "셀피·인물사진의 피부 선명도·색감을 AI가 복원. 최대 4K 업스케일링.",
    img: "/landing/feature-enhance-portrait.png",
    alt: "인물 화질 보정 예시 — 실제 인물 사진 AI 보정 결과",
    objPos: "object-top",
  },
  {
    title: "AI 인물 이미지 생성",
    desc: "\"20대 여성, 카페\" 한 줄 프롬프트로 원하는 인물 사진을 즉시 생성.",
    img: "/landing/ai-landing_2.png",
    alt: "AI 인물 생성 예시 — 텍스트 프롬프트로 인물 사진 생성",
    objPos: "",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="flex flex-col gap-6 max-w-5xl mx-auto w-full px-6">
      <h2 className="text-center text-2xl font-bold text-white">주요 기능</h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {features.map((f) => (
          <div
            key={f.title}
            className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900"
          >
            <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-indigo-900/40 to-gray-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.img}
                alt={f.alt}
                className={`absolute inset-0 h-full w-full object-cover${f.objPos ? ` ${f.objPos}` : ""}`}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <div className="p-5">
              <h3 className="mb-1 font-semibold text-white">{f.title}</h3>
              <p className="text-sm text-gray-400">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
