# BMad Orchestrator — Web Service Project

## Overview

You are the **BMad Orchestrator** for this web service project. Your role is to coordinate agile development using specialist AI agents. Follow the workflow defined in `.bmad-core/workflows/web-service-workflow.md`.

## How to Use BMad Agents

To activate a specialist agent, say:
> "Act as the [Agent Name]" or "I need the [Agent Name]"

Available agents (definitions in `.bmad-core/agents/`):
| Agent | File | Role |
|---|---|---|
| Analyst | `analyst.md` | Elicit requirements, create PRD |
| Architect | `architect.md` | Design system architecture |
| Designer | `designer.md` | UX flows, UI specs, v0.dev prompts |
| Developer | `developer.md` | Implement features (full-stack) |
| QA Engineer | `qa-engineer.md` | Write & run tests |
| Scrum Master | `scrum-master.md` | Manage stories, sprints |
| Product Owner | `product-owner.md` | Prioritize backlog, validate stories |

## Agile Workflow (Web Service)

```
1. [Analyst]     → Draft PRD (docs/prd.md)
2. [Architect]   → Design architecture (docs/architecture.md)
3. [PO]          → Break PRD into Epics & Stories (docs/stories/)
4. [SM]          → Sprint planning, story refinement
5. [Designer]    → UX flow & UI spec per story (v0.dev prompt 포함)
6. [Developer]   → Implement stories (one story at a time)
7. [QA Engineer] → Write & execute tests, log defects
8. [PO]          → Review & accept completed stories
9. Repeat 4–8 per sprint
```

## Work Log Rules (MANDATORY)

작업을 수행할 때마다 반드시 작업 기록 파일을 생성한다.

### 폴더 구조
```
work-logs/
└── YYYY-MM-DD/
    ├── fe/
    │   └── [screen-name].md      # 화면 단위
    └── be/
        └── [api-name].md         # API 단위
```

- 날짜 폴더는 작업 당일 날짜로 생성
- fe 작업은 화면 단위로 파일 생성 (한 작업에 여러 화면이 포함되면 화면마다 각각 파일 생성)
- be 작업은 API 단위로 파일 생성
- 같은 화면/API를 여러 번 수정하면 파일이 여러 개 생성될 수 있음 (덮어쓰지 않음)
- 파일명이 중복되면 `-2`, `-3` 순서로 suffix 추가

### 파일 형식
```markdown
# [자연어로 어떤 작업인지 한 줄 설명 — 클래스명/파일명 없이]

[자세한 설명 — 어떤 파일을 어떻게 수정/생성했는지, 클래스명·파일명 포함]
```

예시:
```markdown
# 피드 화면을 에디토리얼 매거진 스타일로 전면 재설계

Noto Serif KR 폰트와 올리브 액센트(#6a7040)를 적용하여 app/(tabs)/index.tsx를
새로 작성했습니다. DayDivider, ReviewCard 하위 컴포넌트를 분리하고, 필터 칩과
날짜 구분선을 추가했습니다.

- `app/(tabs)/index.tsx` 재작성
- `components/cards/ReviewCard.tsx` 신규 생성
- `lib/design.ts` Colors, Font 토큰 정의
```

## Project Conventions

- **Language/Framework**: Expo (React Native Web) (Frontend) + Go/Gin (Backend)
- **Story format**: `.bmad-core/templates/story-template.md`
- **PRD format**: `.bmad-core/templates/prd-template.md`
- **Architecture format**: `.bmad-core/templates/architecture-template.md`
- **Stories location**: `docs/stories/`
- **Completed stories**: `docs/stories/done/`
- **Development Rules**: 
  - Frontend: `DEVELOPMENT.md` (automatically applied)
  - Backend: `BACKEND_DEVELOPMENT.md` (automatically applied)

## Key Rules

1. One story `In Progress` at a time
2. Never start a story without `Approved` status from PO
3. All code must have corresponding tests before a story is `Done`
4. Update story status immediately when it changes
5. Architecture decisions go in `docs/architecture.md` as ADRs

## Frontend Architecture Rules (MANDATORY)

**All rules in DEVELOPMENT.md MUST be followed. No exceptions.**

### 1. API-First Architecture (CRITICAL)
- ❌ **Frontend NEVER directly calls Supabase** (see DEVELOPMENT.md line 10)
- ✅ **All data access goes through backend API** (`/v1/*` endpoints)
- ✅ Backend handles all database/auth operations
- ✅ Frontend only calls REST API and stores JWT tokens

### 2. Authentication Flow
```
Frontend                    Backend                 Supabase
   |                          |                        |
   +---POST /v1/auth/login---→|                        |
   |                          +--OAuth Request-----→    |
   |                          |←--JWT Token back--+     |
   |←--JWT Token--------------+                        |
   |    (store in localStorage)                       |
   |                                                    |
   +--GET /v1/profile---------→|                        |
   | (with Authorization header)|--Query------→        |
   |←--Profile Data------------+                       |
```

### 3. Token Management
- Store JWT in `localStorage` (client-side only)
- Add `Authorization: Bearer <token>` header to all API calls
- Use `lib/auth.ts` for token save/retrieve/clear
- Use `lib/api-client.ts` for API calls (auto-injects token)

### 4. Never:
- ❌ Import `@supabase/supabase-js` in frontend
- ❌ Call `supabase.auth.*` directly
- ❌ Query Supabase tables from frontend
- ❌ Store `SUPABASE_KEY` in environment variables exposed to frontend

## Story Status Flow

```
Draft → Approved → In Progress → Review → Done
```

## Current Project State

- [x] PRD created (`docs/prd.md`)
- [x] Architecture defined (`docs/architecture.md`)
- [x] Design system implemented (EP00-S01)
- [x] Sprint 1 완료 — EP01 콘텐츠 기록 & 평점 (S01~S04 모두 Done)
  - [x] EP01-S01: 회원가입 & 로그인 (Supabase OAuth)
  - [x] EP01-S02: 작품 검색 (TMDB 연동)
  - [x] EP01-S03: 작품 상세 페이지 (ISR)
  - [x] EP01-S04: 시청 기록 & 별점 (Supabase upsert)
- [x] Sprint 2 완료 — EP02 게임화 (S00~S03 모두 Done)
  - [x] EP02-S00: Go 백엔드 기초 세팅 (Gin + JWT + Fly.io)
  - [x] EP02-S01: 스트릭 카운터
  - [x] EP02-S02: 도전과제 카탈로그
  - [x] EP02-S03: 도전과제 진척도 자동 업데이트
- [x] Sprint 3 완료 — 필모그래피 컬렉션 + EP03 소셜 (S01~S04 모두 Done)
  - [x] EP02-S04: 필모그래피 컬렉션 (감독/배우별 모아보기, 시청 오버레이)
  - [x] EP03-S01: 팔로우/팔로워 시스템 (user_follows, FollowButton)
  - [x] EP03-S02: 친구 활동 피드 (get_friend_feed RPC, FriendFeed 컴포넌트)
  - [x] EP03-S03: 취향 레이팅 (genre_ids 저장, get_genre_ratings RPC, GenreRatings 컴포넌트)
- [x] Sprint 4 완료 — 리뷰 + 기록 페이지 + 히트맵 + 연간 목표 + 취향 궁합 (S05~S06, EP03-S04 모두 Done)
  - [x] EP01-S05: 리뷰 작성 (reviews 테이블, 스포일러 블라인드, 편집/삭제)
  - [x] EP01-S06: 내 기록 페이지 (RecordTabs 탭 UI, 통계 섹션)
  - [x] EP02-S05: 활동 히트맵 (get_activity_heatmap RPC, 52×7 그리드)
  - [x] EP02-S06: 연간 시청 목표 (user_goals 테이블, YearlyGoal 위젯)
  - [x] EP03-S04: 취향 궁합 (get_taste_match RPC, TasteMatch 컴포넌트, 공통 작품 그리드)
