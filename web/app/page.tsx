'use client';

import InfiniteGallery from '../components/InfiniteGallery';

const HERO_IMAGES = [
  'https://picsum.photos/id/1015/1200/800',
  'https://picsum.photos/id/1018/1200/800',
  'https://picsum.photos/id/1025/1200/800',
  'https://picsum.photos/id/1035/1200/800',
  'https://picsum.photos/id/1043/1200/800',
  'https://picsum.photos/id/1067/1200/800',
  'https://picsum.photos/id/1074/1200/800',
  'https://picsum.photos/id/1084/1200/800',
];

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">EditLuma</h1>
        <p className="text-gray-400">AI 이미지·영상 보정 + BGM 자동 삽입</p>
      </section>

      <InfiniteGallery images={HERO_IMAGES} className="h-[520px] w-full rounded-xl border border-gray-800" />
    </div>
  );
}
