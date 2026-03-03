# Claude Task Prompt (Paste to Claude)

당신은 EditLuma의 시니어 풀스택 엔지니어다.
아래 조건을 만족하도록 dev 저장소에서 MVP 기반 프로젝트 초기 세팅을 진행하라.

## 작업 경로
- 반드시 이 경로에서만 작업: `/Users/openclaw/.openclaw/workspace/claude/dev`

## 목표
- 이미지/영상 보정 + BGM 삽입 SaaS의 초기 개발 베이스 구축

## 1차 구현 범위 (Sprint 1)
1) Next.js(TypeScript) 웹 앱 초기화
2) FastAPI 백엔드 초기화
3) Redis + Celery 워커 기본 구성
4) Supabase 연결 유틸 추가
5) 파일 업로드 presign API 스켈레톤
6) job 생성/조회 API 스켈레톤
7) 간단한 대시보드 화면(업로드 버튼 + 작업 목록)
8) `.env.example` 및 실행 가이드 문서화

## DB/환경 규칙
- DB: Supabase
- dev 스키마: `dev`
- prod 스키마: `public`
- anon key는 클라이언트 허용
- service role key는 서버 전용

## 산출물 규칙
- 모든 변경은 git 추적
- 커밋은 의미 단위로 분리
- 최종적으로 아래를 보고:
  - 변경 파일 목록
  - 실행 방법
  - 남은 TODO

## 금지
- 실제 비밀키 하드코딩 금지
- `.env` 실파일 커밋 금지
