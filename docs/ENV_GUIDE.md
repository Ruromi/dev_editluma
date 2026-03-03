# Environment Guide

## 공용 템플릿
- `/Users/openclaw/.openclaw/workspace/claude/.env.shared.example`

## 실제 파일(예시)
- shared: `/Users/openclaw/.openclaw/workspace/claude/.env.shared`
- dev override: `/Users/openclaw/.openclaw/workspace/claude/dev/.env.local`

## 필수 변수
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (서버 전용)
- DATABASE_URL
- APP_ENV=dev|prod
- DB_SCHEMA=dev|public

## 보안 규칙
- `.env*`는 git 커밋 금지
- `SUPABASE_SERVICE_ROLE_KEY`는 프론트 노출 금지

## Ideogram 규칙
- IDEOGRAM_API_KEY
- IDEOGRAM_BASE_URL
- IDEOGRAM_MODEL
- IDEOGRAM_TIMEOUT_MS

주의:
- `IDEOGRAM_API_KEY`는 서버 전용 (클라이언트 노출 금지)
- API 호출은 반드시 백엔드에서만 수행
