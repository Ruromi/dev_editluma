# EditLuma - Project Brief (MVP)

## 서비스 개요
EditLuma는 AI 기반 이미지/영상 보정 + BGM 자동 삽입 SaaS.

## 도메인
- Dev: https://editluma.xyz
- Prod: https://editluma.com

## 저장소/경로
- Dev repo: https://github.com/Ruromi/dev_editluma.git
- Prod repo: https://github.com/Ruromi/prod_editluma.git
- 로컬 개발 경로: `/Users/openclaw/.openclaw/workspace/claude/dev`

## MVP 범위
1. 이미지 보정 (denoise/upscale/color)
2. 짧은 영상 보정 (denoise/color/stabilize)
3. BGM 추천/삽입 (길이 맞춤, 볼륨 밸런싱)
4. 업로드 → 비동기 처리(job) → 미리보기 → export
5. Free/Pro 플랜 제한

## 기술 스택
- Frontend: Next.js (TypeScript)
- Backend: FastAPI
- Worker: Celery + Redis
- DB: Supabase Postgres
- Storage: S3 호환
- Billing: Stripe

## DB 정책
- 같은 Supabase 프로젝트 사용
- 스키마 분리:
  - dev 환경: `dev` schema
  - prod 환경: `public` schema
- 브라우저는 anon key만 사용
- service role key는 서버 전용

## 목표 SLO (MVP)
- 이미지 작업 p95 < 20s
- 30초 영상 작업 p95 < 120s
- API 오류율 < 1%
