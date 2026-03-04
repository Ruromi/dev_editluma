"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type JobStatus = "pending" | "processing" | "done" | "failed";
type JobMode = "enhance" | "generate";

interface Job {
  id: string;
  filename: string;
  type: "image" | "video";
  mode?: JobMode;
  prompt?: string;
  original_prompt?: string;
  enhanced_prompt?: string;
  status: JobStatus;
  created_at: string;
  output_key?: string;
  output_url?: string;
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

const POLL_INTERVAL_MS = 3000;

// ---------------------------------------------------------------------------
// Gallery card: skeleton shimmer for pending / processing
// ---------------------------------------------------------------------------
function SkeletonCard({ job }: { job: Job }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-800 bg-gray-900">
      {/* Shimmer image area */}
      <div className="aspect-square relative overflow-hidden animate-shimmer">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5">
          <div className="w-7 h-7 rounded-full border-2 border-indigo-500/70 border-t-transparent animate-spin" />
          <span className="text-xs text-gray-500">
            {job.status === "processing" ? "생성 중…" : "대기 중…"}
          </span>
        </div>
      </div>
      {/* Meta */}
      <div className="p-3 space-y-2">
        {job.prompt ? (
          <p className="text-xs text-gray-600 truncate">{job.prompt}</p>
        ) : (
          <div className="h-2.5 bg-gray-800 rounded animate-pulse w-3/4" />
        )}
        <div className="h-2 bg-gray-800/60 rounded animate-pulse w-2/5" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Image detail modal
// ---------------------------------------------------------------------------
function ImageDetailModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const originalPrompt = job.original_prompt || job.prompt;
  const enhancedPrompt = job.enhanced_prompt;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        {job.output_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={job.output_url}
            alt={originalPrompt ?? job.filename}
            className="w-full rounded-t-2xl object-cover"
          />
        ) : (
          <div className="aspect-square flex items-center justify-center bg-gray-900 rounded-t-2xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Info */}
        <div className="p-5 space-y-4">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">
              {new Date(job.created_at).toLocaleString("ko-KR")}
            </span>
            <div className="flex items-center gap-3">
              {job.output_url && (
                <a
                  href={job.output_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                >
                  다운로드
                </a>
              )}
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-gray-300 transition-colors"
                aria-label="닫기"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* 입력 프롬프트 */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              입력 프롬프트
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              {originalPrompt || "—"}
            </p>
          </div>

          {/* AI 보정 프롬프트 */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-semibold text-indigo-400/70 uppercase tracking-wider">
              AI 보정 프롬프트
            </h3>
            <p className="text-sm text-indigo-200/70 leading-relaxed">
              {enhancedPrompt || "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gallery card: completed / failed job
// ---------------------------------------------------------------------------
function GalleryCard({ job, onClick }: { job: Job; onClick: () => void }) {
  const isDone = job.status === "done";

  return (
    <div
      className="rounded-2xl overflow-hidden border border-gray-800 bg-gray-900 group cursor-pointer hover:border-gray-700 transition-colors"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div
        className={`aspect-square relative overflow-hidden flex items-center justify-center ${
          isDone && !job.output_url
            ? "bg-gradient-to-br from-indigo-950/80 to-gray-900"
            : !isDone
            ? "bg-gradient-to-br from-red-950/40 to-gray-900"
            : ""
        }`}
      >
        {isDone && job.output_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={job.output_url}
            alt={job.original_prompt ?? job.prompt ?? job.filename}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : isDone ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10 text-indigo-800/60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-red-800/60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        )}
        {/* Status badge */}
        <span
          className={`absolute top-2 right-2 px-2 py-0.5 text-xs rounded-full border font-medium ${
            isDone
              ? "bg-green-900/60 text-green-300 border-green-800/50"
              : "bg-red-900/60 text-red-300 border-red-800/50"
          }`}
        >
          {isDone ? "완료" : "실패"}
        </span>
      </div>
      {/* Meta */}
      <div className="p-3 space-y-2">
        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed min-h-[2.25rem]">
          {job.original_prompt || job.prompt || "—"}
        </p>
        <p className="text-xs text-gray-700">
          {new Date(job.created_at).toLocaleString("ko-KR")}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gallery section
// ---------------------------------------------------------------------------
function GallerySection({ jobs }: { jobs: Job[] }) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const activeJobs = jobs.filter(
    (j) => j.status === "pending" || j.status === "processing"
  );
  const finishedJobs = jobs.filter(
    (j) => j.status === "done" || j.status === "failed"
  );

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          생성 갤러리
        </h2>
        {activeJobs.length > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
            {activeJobs.length}개 생성 중
          </span>
        )}
      </div>

      {jobs.length === 0 ? (
        <div className="border border-dashed border-gray-800 rounded-2xl py-14 flex flex-col items-center gap-2 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-gray-700 mb-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-gray-700 text-sm">아직 생성된 이미지가 없습니다</p>
          <p className="text-gray-800 text-xs">
            프롬프트를 입력하여 첫 번째 이미지를 만들어 보세요
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Active jobs (skeleton) shown first */}
          {activeJobs.map((job) => (
            <SkeletonCard key={job.id} job={job} />
          ))}
          {/* Finished jobs */}
          {finishedJobs.map((job) => (
            <GalleryCard key={job.id} job={job} onClick={() => setSelectedJob(job)} />
          ))}
        </div>
      )}

      {selectedJob && (
        <ImageDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main dashboard page
// ---------------------------------------------------------------------------
export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [uploadedKey, setUploadedKey] = useState<string | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);

  const [prompt, setPrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 로컬 개발: NEXT_PUBLIC_API_URL을 비워두면 상대 경로(/api/*)를 사용하며
  // Next.js 리라이트가 FastAPI로 프록시 → CORS 불필요.
  // 원격 API 사용 시에만 절대 URL을 설정하세요.
  const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

  // 연결 실패 시 보여줄 힌트 메시지를 API_URL 설정에 맞게 생성합니다.
  const apiConnErrMsg = API_URL
    ? `API 서버(${API_URL})에 연결할 수 없습니다. 서버 URL과 네트워크 상태를 확인하세요.`
    : "API 서버에 연결할 수 없습니다. Next.js 개발 서버 및 FastAPI(포트 8000)가 실행 중인지 확인하세요.";

  // -------------------------------------------------------------------------
  // Job fetching & polling
  // -------------------------------------------------------------------------
  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/jobs`);
      if (!res.ok) return;
      const data: Job[] = await res.json();
      setJobs(data);
    } catch {
      // silently ignore polling errors
    }
  }, [API_URL]);

  // Initial load on mount
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Poll every POLL_INTERVAL_MS while any job is pending/processing
  useEffect(() => {
    const hasActive = jobs.some(
      (j) => j.status === "pending" || j.status === "processing"
    );
    if (!hasActive) return;
    const timer = setTimeout(fetchJobs, POLL_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [jobs, fetchJobs]);

  // -------------------------------------------------------------------------
  // Step 1: Upload file → store object_key (no job created yet)
  // -------------------------------------------------------------------------
  const ACCEPTED_TYPES = ["image/jpeg", "image/png", "video/mp4", "video/quicktime"];

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("지원하지 않는 파일 형식입니다. JPG, PNG, MP4, MOV 파일만 업로드할 수 있습니다.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setUploadedKey(null);
    setUploadedFilename(null);
    setUploading(true);

    try {
      let presignRes: Response;
      try {
        presignRes = await fetch(`${API_URL}/api/upload/presign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, content_type: file.type }),
        });
      } catch {
        throw new Error(apiConnErrMsg);
      }
      if (!presignRes.ok) {
        const detail = await presignRes.text().catch(() => "");
        throw new Error(`presign 요청 실패 (${presignRes.status})${detail ? `: ${detail}` : ""}`);
      }
      const { upload_url, object_key } = await presignRes.json();

      let putRes: Response;
      try {
        putRes = await fetch(upload_url, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
      } catch {
        throw new Error("스토리지에 파일을 업로드할 수 없습니다. 네트워크 상태 또는 스토리지 CORS 설정을 확인하세요.");
      }
      if (!putRes.ok) throw new Error(`파일 업로드 실패 (HTTP ${putRes.status}). 스토리지 서비스 상태를 확인하세요.`);

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
      let res: Response;
      try {
        res = await fetch(`${API_URL}/api/ai/enhance`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ object_key: uploadedKey, prompt: prompt || undefined }),
        });
      } catch {
        throw new Error(apiConnErrMsg);
      }
      if (!res.ok) throw new Error(`AI 보정 요청 실패 (HTTP ${res.status}). 잠시 후 다시 시도하세요.`);
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
      let res: Response;
      try {
        res = await fetch(`${API_URL}/api/ai/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: prompt.trim() }),
        });
      } catch {
        throw new Error(apiConnErrMsg);
      }
      if (!res.ok) throw new Error(`AI 생성 요청 실패 (HTTP ${res.status}). 잠시 후 다시 시도하세요.`);
      const newJob: Job = await res.json();
      setJobs((prev) => [newJob, ...prev]);
      setPrompt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setSubmitting(false);
    }
  }

  const generateJobs = jobs.filter((j) => j.mode === "generate");

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
            accept=".jpg,.jpeg,.png,.mp4,.mov,image/jpeg,image/png,video/mp4,video/quicktime"
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
      {/* Gallery: AI generate jobs                                           */}
      {/* ------------------------------------------------------------------ */}
      <GallerySection jobs={generateJobs} />

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
                      {job.status === "done" && job.output_url ? (
                        <a
                          href={job.output_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 hover:underline text-xs transition-colors"
                        >
                          다운로드
                        </a>
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
