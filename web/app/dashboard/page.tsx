"use client";

import { useState, useRef } from "react";

type JobStatus = "pending" | "processing" | "done" | "failed";
type JobMode = "enhance" | "generate";

interface Job {
  id: string;
  filename: string;
  type: "image" | "video";
  mode?: JobMode;
  prompt?: string;
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

const MODE_LABEL: Record<JobMode, string> = {
  enhance: "AI 보정",
  generate: "AI 생성",
};

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Uploaded file state (set after successful presign + PUT)
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);

  const [prompt, setPrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  // -------------------------------------------------------------------------
  // Step 1: Upload file → store object_key (no job created yet)
  // -------------------------------------------------------------------------
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploadedKey(null);
    setUploadedFilename(null);
    setUploading(true);

    try {
      // 1) Get presigned URL
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

      setUploadedKey(object_key);
      setUploadedFilename(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // -------------------------------------------------------------------------
  // Step 2a: AI 보정 요청
  // -------------------------------------------------------------------------
  async function handleEnhance() {
    if (!uploadedKey) {
      setError("먼저 파일을 업로드하세요.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/ai/enhance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ object_key: uploadedKey, prompt: prompt || undefined }),
      });
      if (!res.ok) throw new Error("AI 보정 요청 실패");
      const newJob: Job = await res.json();
      setJobs((prev) => [newJob, ...prev]);
      setUploadedKey(null);
      setUploadedFilename(null);
      setPrompt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setSubmitting(false);
    }
  }

  // -------------------------------------------------------------------------
  // Step 2b: AI 생성 요청
  // -------------------------------------------------------------------------
  async function handleGenerate() {
    if (!prompt.trim()) {
      setError("프롬프트를 입력하세요.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/ai/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      if (!res.ok) throw new Error("AI 생성 요청 실패");
      const newJob: Job = await res.json();
      setJobs((prev) => [newJob, ...prev]);
      setPrompt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* ------------------------------------------------------------------ */}
      {/* Upload section                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="border border-dashed border-gray-700 rounded-xl p-8 flex flex-col items-center gap-4">
        <p className="text-gray-400">이미지 또는 영상을 업로드하세요</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileSelect}
          disabled={uploading || submitting}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || submitting}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition px-6 py-3 rounded-lg font-semibold text-white"
        >
          {uploading ? "업로드 중…" : "파일 선택"}
        </button>

        {uploadedFilename && (
          <p className="text-green-400 text-sm">
            ✓ 업로드 완료: <span className="font-mono">{uploadedFilename}</span>
          </p>
        )}

        <p className="text-xs text-gray-600">JPG / PNG / MP4 / MOV 지원</p>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* AI Action section                                                    */}
      {/* ------------------------------------------------------------------ */}
      <section className="border border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">AI 작업 요청</h2>

        {/* Prompt input */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            프롬프트 (보정 힌트 또는 생성 지시문)
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={submitting}
            rows={3}
            placeholder="예: 선명하게 보정해줘 / 사이버펑크 도시 야경"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 disabled:opacity-50 resize-none"
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleEnhance}
            disabled={submitting || !uploadedKey}
            title={!uploadedKey ? "먼저 파일을 업로드하세요" : undefined}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition px-5 py-2.5 rounded-lg font-semibold text-white text-sm"
          >
            {submitting ? "요청 중…" : "AI 보정 요청"}
          </button>
          <button
            onClick={handleGenerate}
            disabled={submitting || !prompt.trim()}
            title={!prompt.trim() ? "프롬프트를 입력하세요" : undefined}
            className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition px-5 py-2.5 rounded-lg font-semibold text-white text-sm"
          >
            {submitting ? "요청 중…" : "AI 생성 요청"}
          </button>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Job list                                                             */}
      {/* ------------------------------------------------------------------ */}
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
                  <th className="px-4 py-3 text-left">모드</th>
                  <th className="px-4 py-3 text-left">프롬프트</th>
                  <th className="px-4 py-3 text-left">상태</th>
                  <th className="px-4 py-3 text-left">생성일</th>
                  <th className="px-4 py-3 text-left">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-900/50 transition">
                    <td className="px-4 py-3 font-mono">{job.filename}</td>
                    <td className="px-4 py-3">
                      {job.mode ? MODE_LABEL[job.mode] : "—"}
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate text-gray-400">
                      {job.prompt ?? "—"}
                    </td>
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
