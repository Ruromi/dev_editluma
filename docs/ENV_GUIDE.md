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
