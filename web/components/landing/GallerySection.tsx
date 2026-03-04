"use client";

const gallery = [
  {
    src: "/landing/hero-user.jpg",
    alt: "AI 보정 샘플 — 실제 인물 사진 선명도·색감 보정",
    objPos: "object-top",
  },
  {
    src: "/landing/gallery-2.svg",
    alt: "AI 보정 샘플 — 스트릿 포트레이트 보정",
    objPos: "",
  },
  {
    src: "/landing/gallery-3.svg",
    alt: "AI 생성 샘플 — 크리에이터 썸네일 인물",
    objPos: "",
  },
];

export default function GallerySection() {
  return (
    <section className="flex flex-col gap-6 max-w-5xl mx-auto w-full px-6">
      <h2 className="text-center text-2xl font-bold text-white">샘플 갤러리</h2>
      <p className="text-center text-sm text-gray-500">
        셀피·스트릿 포트레이트·크리에이터 썸네일 — AI 보정·생성 예시
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {gallery.map((g) => (
          <div
            key={g.src + g.alt}
            className="overflow-hidden rounded-xl border border-gray-800"
          >
            <div className="relative aspect-square w-full bg-gradient-to-br from-indigo-900/40 to-gray-800">
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
          </div>
        ))}
      </div>
    </section>
  );
}
