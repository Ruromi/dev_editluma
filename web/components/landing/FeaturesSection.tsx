const features = [
  {
    title: "인물 화질 보정 · Upscale",
    desc: "셀피·인물사진의 피부 선명도·색감을 AI가 복원. 최대 4K 업스케일링.",
    img: "/landing/hero-user.jpg",
    alt: "인물 화질 보정 예시 — 실제 인물 사진 AI 보정 결과",
    imgClass: "aspect-[4/3] object-cover object-top",
  },
  {
    title: "AI 인물 이미지 생성",
    desc: "\"20대 여성, 카페\" 한 줄 프롬프트로 원하는 인물 사진을 즉시 생성.",
    img: "/landing/feature-generate.svg",
    alt: "AI 인물 생성 예시 — 텍스트 프롬프트로 인물 사진 생성",
    imgClass: "",
  },
  {
    title: "쇼츠 BGM 자동 삽입",
    desc: "인물 영상의 분위기를 분석해 어울리는 BGM을 자동으로 매칭·삽입.",
    img: "/landing/feature-music.svg",
    alt: "BGM 자동 삽입 예시 — 크리에이터 쇼츠 영상에 BGM 웨이브폼",
    imgClass: "",
  },
];

export default function FeaturesSection() {
  return (
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
              className={`w-full object-cover${f.imgClass ? ` ${f.imgClass}` : ""}`}
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
  );
}
