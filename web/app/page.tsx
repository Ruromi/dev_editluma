import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
      <h1 className="text-4xl font-bold">
        AI 이미지·영상 보정 + BGM 자동 삽입
      </h1>
      <p className="text-gray-400 text-lg max-w-xl">
        파일을 업로드하면 AI가 화질을 보정하고 분위기에 맞는 BGM을 자동으로 붙여드립니다.
      </p>
      <Link
        href="/dashboard"
        className="bg-indigo-600 hover:bg-indigo-500 transition px-6 py-3 rounded-lg font-semibold text-white"
      >
        대시보드로 이동
      </Link>
    </div>
  );
}
