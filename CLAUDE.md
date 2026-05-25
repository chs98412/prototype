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

## Project Conventions

- **Language/Framework**: Next.js 16 (Frontend) + Go/Gin (Backend)
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
