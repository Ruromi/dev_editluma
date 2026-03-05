"use client";

const gallery = [
  {
    src: "/landing/gallery-enhance.png",
    alt: "AI 화질 보정 샘플 — 인물 사진 선명도·색감 복원",
    label: "화질 보정",
    objPos: "object-top",
  },
  {
    src: "/landing/ai-landing.png",
    alt: "AI 이미지 생성 샘플 — 프롬프트로 인물 사진 생성",
    label: "AI 생성",
    objPos: "",
  },
];

export default function GallerySection() {
  return (
    <section className="flex flex-col gap-6 max-w-5xl mx-auto w-full px-6">
      <h2 className="text-center text-2xl font-bold text-white">샘플 갤러리</h2>
      <p className="text-center text-sm text-gray-500">
        AI 화질 보정·이미지 생성 예시
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {gallery.map((g) => (
          <div
            key={g.src}
            className="overflow-hidden rounded-xl border border-gray-800"
          >
            <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-indigo-900/40 to-gray-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={g.src}
                alt={g.alt}
                className={`absolute inset-0 h-full w-full object-cover${g.objPos ? ` ${g.objPos}` : ""}`}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <div className="px-4 py-3">
              <span className="text-xs font-medium text-indigo-400">{g.label}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
