# EditLuma — dev

AI 기반 이미지·영상 보정 + BGM 자동 삽입 SaaS (개발 환경)

## 프로젝트 구조

```
.
├── web/                # Next.js 15 (TypeScript) — 프론트엔드
├── api/                # FastAPI — REST API 서버
├── worker/             # Celery 워커 — 비동기 미디어 처리
├── supabase/
│   └── migrations/     # SQL 마이그레이션 파일
├── docker-compose.yml  # 로컬 Redis
└── .env.example        # 환경변수 참고용
```

## 실행 방법

### 0. 공통 준비

```bash
# Redis 실행 (Docker)
docker compose up -d redis
```

### 1. API 서버 (FastAPI)

```bash
cd api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env   # Supabase URL, service_role key, Storage 키 입력

uvicorn app.main:app --reload --port 8000
# → http://localhost:8000/docs
```

### 2. Celery 워커

```bash
# 프로젝트 루트에서 실행 (worker 패키지 경로)
source api/.venv/bin/activate
celery -A worker.celery_app worker --loglevel=info -Q default
```

### 3. 웹 앱 (Next.js)

```bash
cd web
npm install

cp .env.example .env.local   # Supabase URL, anon key, API URL 입력

npm run dev
# → http://localhost:3000
```

### 4. DB 마이그레이션

Supabase 대시보드 → SQL Editor에서 실행:

```
supabase/migrations/0001_init_dev_schema.sql
```

## 환경변수 요약

| 변수 | 위치 | 용도 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | web | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | web | 브라우저 클라이언트 (공개 가능) |
| `SUPABASE_SERVICE_ROLE_KEY` | api | 서버 전용 — **절대 노출 금지** |
| `SUPABASE_SCHEMA` | api | `dev` (dev) / `public` (prod) |
| `STORAGE_ACCESS_KEY` | api | S3 호환 스토리지 액세스 키 |
| `STORAGE_SECRET_KEY` | api | S3 호환 스토리지 시크릿 키 |
| `REDIS_URL` | api/worker | Redis 연결 URL |

## API 엔드포인트 (Sprint 1)

| Method | Path | 설명 |
|--------|------|------|
| GET | `/health` | 헬스체크 (Redis·Supabase 상태 포함) |
| POST | `/api/upload/presign` | S3 presigned PUT URL 발급 |
| POST | `/api/jobs` | 작업 생성 + Celery 큐 등록 |
| GET | `/api/jobs` | 작업 목록 조회 |
| GET | `/api/jobs/{id}` | 작업 단건 조회 |

전체 문서: `http://localhost:8000/docs`

## TODO (Sprint 2+)

- [ ] Supabase Auth 연동 (사용자 인증)
- [ ] 이미지 보정 파이프라인 구현 (Real-ESRGAN / Topaz)
- [ ] 영상 보정 파이프라인 구현 (FFmpeg + denoise)
- [ ] BGM 추천/삽입 모델 연동
- [ ] 결과물 다운로드 presigned URL API
- [ ] Free/Pro 플랜 제한 로직
- [ ] Stripe 빌링 연동
- [ ] 작업 진행률 SSE/WebSocket 스트리밍
- [ ] prod 스키마(`public`) 마이그레이션 분리
