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

uvicorn app.main:app --reload --port 8010
# → http://localhost:8010/docs
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
# → http://localhost:3001
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
| `SUPABASE_SCHEMA` | api | 기본값 `public` (권장), `dev`는 명시적으로 노출한 경우에만 사용 |
| `STORAGE_ACCESS_KEY` | api | S3 호환 스토리지 액세스 키 |
| `STORAGE_SECRET_KEY` | api | S3 호환 스토리지 시크릿 키 |
| `REDIS_URL` | api/worker | Redis 연결 URL |

## 사용 흐름

### 업로드 → AI 보정 요청

1. `/dashboard` 접속 후 **파일 선택** 클릭 → 이미지/영상 업로드
2. 업로드 완료(✓ 표시) 후 프롬프트 입력창에 선택적으로 힌트 입력
   - 예: `선명하게, 노이즈 제거`
3. **AI 보정 요청** 버튼 클릭
4. 작업 목록에 `pending` 상태 행이 추가되며 Celery 워커가 처리

### 프롬프트 입력 → AI 생성 요청

1. `/dashboard` 접속 (파일 업로드 불필요)
2. 프롬프트 입력창에 원하는 이미지 설명 입력
   - 예: `사이버펑크 도시 야경, 네온 사인`
3. **AI 생성 요청** 버튼 클릭
4. 작업 목록에 `pending` 상태 행이 추가되며 Celery 워커가 생성 처리

---

## API 엔드포인트

### Sprint 1

| Method | Path | 설명 |
|--------|------|------|
| GET | `/health` | 헬스체크 (Redis·Supabase 상태 포함) |
| POST | `/api/upload/presign` | S3 presigned PUT URL 발급 |
| POST | `/api/jobs` | 작업 생성 + Celery 큐 등록 |
| GET | `/api/jobs` | 작업 목록 조회 |
| GET | `/api/jobs/{id}` | 작업 단건 조회 |

### Sprint 2 (AI endpoints)

| Method | Path | Body | 설명 |
|--------|------|------|------|
| POST | `/api/ai/enhance` | `{object_key, prompt?}` | 업로드 파일 AI 보정 |
| POST | `/api/ai/generate` | `{prompt, width?, height?}` | 프롬프트 기반 AI 이미지 생성 |

전체 문서: `http://localhost:8010/docs`

### DB 마이그레이션 (Sprint 2)

Supabase 대시보드 → SQL Editor에서 추가 실행:

```
supabase/migrations/0002_add_mode_prompt.sql
```

### DB 마이그레이션 (Credits 준비)

사용자별 크레딧 잔액과 작업 소유자를 저장하려면 추가 실행:

```
supabase/migrations/0005_add_user_credits.sql
supabase/migrations/0006_add_credit_ledger.sql
supabase/migrations/0007_add_credit_usage_ledger.sql
```

## 로컬 트러블슈팅

| 증상 | 원인 | 해결 |
|------|------|------|
| `Cannot find module './NNN.js'` / 500 | `.next` 캐시 손상 (서버 강제 종료 후 발생) | `rm -rf web/.next && cd web && npm run build` |
| `EADDRINUSE :::3001` | 이전 dev 서버 프로세스 잔존 | `ps aux \| grep 'next dev'` 로 PID 확인 후 `kill <PID>` |
| TypeScript 오류 · `next-env.d.ts` 없음 | 빌드 전 타입 파일 미생성 | `cd web && npm run build` 실행 후 재기동 |
| HMR 후 화면 깨짐 | webpack 캐시 꼬임 | `.next` 삭제 후 `npm run dev` 재기동 |
| `devIndicators` 관련 경고 | Next.js 15 에서도 `buildActivity` 옵션 유효 — 무시 가능 | — |

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
