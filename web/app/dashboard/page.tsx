"use client";

import { useState, useRef } from "react";

type JobStatus = "pending" | "processing" | "done" | "failed";

interface Job {
  id: string;
  filename: string;
  type: "image" | "video";
  status: JobStatus;
  created_at: string;
}

const STATUS_LABEL: Record<JobStatus, string> = {
  pending: "대기 중",
  processing: "처리 중",
  done: "완료",
  failed: "실패",
};

const STATUS_COLOR: Record<JobStatus, string> = {
  pending: "text-yellow-400 bg-yellow-400/10",
  processing: "text-blue-400 bg-blue-400/10",
  done: "text-green-400 bg-green-400/10",
  failed: "text-red-400 bg-red-400/10",
};

// Placeholder jobs for UI skeleton
const MOCK_JOBS: Job[] = [
  {
    id: "job_001",
    filename: "photo_01.jpg",
    type: "image",
    status: "done",
    created_at: "2026-03-03T09:00:00Z",
  },
  {
    id: "job_002",
    filename: "clip_02.mp4",
    type: "video",
    status: "processing",
    created_at: "2026-03-03T09:10:00Z",
  },
  {
    id: "job_003",
    filename: "photo_03.png",
    type: "image",
    status: "pending",
    created_at: "2026-03-03T09:20:00Z",
  },
];

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);

    try {
      // 1) Get presigned URL from API
      const presignRes = await fetch(`${API_URL}/api/upload/presign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, content_type: file.type }),
      });
      if (!presignRes.ok) throw new Error("presign 요청 실패");
      const { upload_url, object_key } = await presignRes.json();

      // 2) PUT file to presigned URL
      const putRes = await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) throw new Error("파일 업로드 실패");

      // 3) Create job
      const jobRes = await fetch(`${API_URL}/api/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ object_key, filename: file.name }),
      });
      if (!jobRes.ok) throw new Error("작업 생성 실패");
      const newJob: Job = await jobRes.json();

      setJobs((prev) => [newJob, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-8">
      {/* Upload section */}
      <section className="border border-dashed border-gray-700 rounded-xl p-8 flex flex-col items-center gap-4">
        <p className="text-gray-400">이미지 또는 영상을 업로드하세요</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileSelect}
          disabled={uploading}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition px-6 py-3 rounded-lg font-semibold text-white"
        >
          {uploading ? "업로드 중…" : "파일 선택"}
        </button>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <p className="text-xs text-gray-600">JPG / PNG / MP4 / MOV 지원</p>
      </section>

      {/* Job list */}
      <section>
        <h2 className="text-lg font-semibold mb-4">작업 목록</h2>
        {jobs.length === 0 ? (
          <p className="text-gray-500 text-sm">아직 작업이 없습니다.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-900 text-gray-400">
                <tr>
                  <th className="px-4 py-3 text-left">파일명</th>
                  <th className="px-4 py-3 text-left">유형</th>
                  <th className="px-4 py-3 text-left">상태</th>
                  <th className="px-4 py-3 text-left">생성일</th>
                  <th className="px-4 py-3 text-left">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-900/50 transition">
                    <td className="px-4 py-3 font-mono">{job.filename}</td>
                    <td className="px-4 py-3 capitalize">{job.type}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLOR[job.status]}`}
                      >
                        {STATUS_LABEL[job.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(job.created_at).toLocaleString("ko-KR")}
                    </td>
                    <td className="px-4 py-3">
                      {job.status === "done" ? (
                        <button className="text-indigo-400 hover:underline text-xs">
                          다운로드
                        </button>
                      ) : (
                        <span className="text-gray-600 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
