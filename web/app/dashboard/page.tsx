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
      const presignRes = await fetch(`${API_URL}/api/upload/presign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, content_type: file.type }),
      });
      if (!presignRes.ok) throw new Error("presign 요청 실패");
      const { upload_url, object_key } = await presignRes.json();

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
    <div className="space-y-12">

      {/* ------------------------------------------------------------------ */}
      {/* Hero: Prompt-first main section                                      */}
      {/* ------------------------------------------------------------------ */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            무엇을 만들어 드릴까요?
          </h1>
          <p className="text-gray-500 text-sm">
            프롬프트를 입력하면 AI가 이미지를 생성합니다
          </p>
        </div>

        {/* Prompt textarea */}
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate();
            }}
            disabled={submitting}
            rows={5}
            placeholder="예: 사이버펑크 도시 야경, 따뜻한 햇살이 비치는 카페 창가, 미래적인 우주선 내부…"
            className="w-full bg-gray-900 border border-gray-800 hover:border-gray-700 focus:border-indigo-500 rounded-2xl px-6 py-5 text-base text-white placeholder-gray-600 focus:outline-none transition-colors resize-none disabled:opacity-50"
          />
          <span className="absolute bottom-4 right-5 text-xs text-gray-700 pointer-events-none select-none">
            ⌘ + Enter
          </span>
        </div>

        {/* Primary CTA */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={submitting || !prompt.trim()}
            title={!prompt.trim() ? "프롬프트를 입력하세요" : undefined}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all px-7 py-3 rounded-xl font-semibold text-white text-sm shadow-lg shadow-indigo-900/40 active:scale-95"
          >
            {submitting ? "요청 중…" : "AI 생성 요청"}
          </button>
          <span className="text-gray-700 text-xs hidden sm:inline">프롬프트만으로 이미지를 생성합니다</span>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Secondary: Image enhance section                                    */}
      {/* ------------------------------------------------------------------ */}
      <section className="border border-gray-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-gray-300">AI 보정 요청</h2>
            <p className="text-xs text-gray-600">
              이미지 또는 영상을 업로드하면 AI가 화질·색감을 개선합니다
            </p>
          </div>
          <span className="text-xs text-gray-700 bg-gray-900 px-2 py-0.5 rounded-full border border-gray-800">
            JPG · PNG · MP4 · MOV
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Upload trigger */}
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
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all px-5 py-2.5 rounded-xl text-sm text-gray-300 font-medium active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {uploading ? "업로드 중…" : "파일 선택"}
          </button>

          {/* Uploaded file indicator */}
          {uploadedFilename ? (
            <span className="flex items-center gap-1.5 text-sm text-green-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-mono truncate max-w-[180px]">{uploadedFilename}</span>
            </span>
          ) : (
            <span className="text-xs text-gray-700">파일을 선택하면 자동 업로드됩니다</span>
          )}

          {/* Secondary CTA */}
          <button
            onClick={handleEnhance}
            disabled={submitting || !uploadedKey}
            title={!uploadedKey ? "먼저 파일을 업로드하세요" : undefined}
            className="sm:ml-auto flex items-center gap-2 bg-emerald-900/40 hover:bg-emerald-800/50 border border-emerald-800/60 hover:border-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all px-5 py-2.5 rounded-xl font-semibold text-emerald-300 text-sm active:scale-95"
          >
            {submitting ? "요청 중…" : "AI 보정 요청"}
          </button>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Error                                                                */}
      {/* ------------------------------------------------------------------ */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/30 border border-red-900/50 rounded-xl px-4 py-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Job list                                                             */}
      {/* ------------------------------------------------------------------ */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">작업 목록</h2>
        {jobs.length === 0 ? (
          <div className="border border-dashed border-gray-800 rounded-2xl py-12 text-center text-gray-700 text-sm">
            아직 작업이 없습니다
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-900/80 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">파일명</th>
                  <th className="px-4 py-3 text-left font-medium">모드</th>
                  <th className="px-4 py-3 text-left font-medium">프롬프트</th>
                  <th className="px-4 py-3 text-left font-medium">상태</th>
                  <th className="px-4 py-3 text-left font-medium">생성일</th>
                  <th className="px-4 py-3 text-left font-medium">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-900/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-gray-300">{job.filename}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {job.mode ? MODE_LABEL[job.mode] : "—"}
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate text-gray-500">
                      {job.prompt ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_COLOR[job.status]}`}>
                        {STATUS_LABEL[job.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {new Date(job.created_at).toLocaleString("ko-KR")}
                    </td>
                    <td className="px-4 py-3">
                      {job.status === "done" ? (
                        <button className="text-indigo-400 hover:text-indigo-300 hover:underline text-xs transition-colors">
                          다운로드
                        </button>
                      ) : (
                        <span className="text-gray-700 text-xs">—</span>
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
