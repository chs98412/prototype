# Logged - 프로젝트 관리 (Notion 템플릿)

## 📌 Database 구조

### 1️⃣ Features (기능 목록)
**View**: Table + Timeline + Board

| 필드 | 타입 | 설명 |
|------|------|------|
| 이름 | Title | 기능 이름 (예: 피드 에디토리얼 레이아웃) |
| Epic | Select | EP01, EP02, EP03, EP04 |
| Story | Text | EP04-S03 |
| 상태 | Status | Draft, Approved, In Progress, Review, Done |
| 설명 | Text | 기능 설명 |
| 코드 경로 | Multi-select | frontend/components/feed/EditorialReviewFeed.tsx |
| 코드 분석 | Text | 주요 기술, 컴포넌트 구조, 라인 수 |
| PRD 링크 | URL | docs/prd.md#section |
| 스토리 링크 | URL | docs/stories/EP04-S03.md |
| 디자인 스펙 | URL | docs/design-specs/P5-FeedEditorialLayout.md |
| 담당자 | Person | |
| 우선순위 | Select | 높음, 중간, 낮음 |
| 시작일 | Date | |
| 완료일 | Date | |
| 진행률 | Number | 0-100% |
| 체크리스트 | Checkbox | - [ ] RPC 구현, - [ ] API 연동, 등 |
| 참고 | Text | 추가 메모 |

---

### 2️⃣ Components (컴포넌트 도감)
**View**: Gallery (UI 미리보기 가능)

| 필드 | 타입 |
|------|------|
| 이름 | Title |
| 파일 | URL |
| 라인 수 | Number |
| 주요 기술 | Multi-select |
| Props | Code block |
| 사용 위치 | Multi-select |
| 기능 | Features (관계) |
| 스크린샷/예시 | File |
| 상태 | Select |

---

### 3️⃣ Sprints (스프린트 일정)

| 필드 | 타입 |
|------|------|
| Sprint | Title |
| 번호 | Number |
| 시작일 | Date |
| 종료일 | Date |
| 목표 | Text |
| Features | Relation (Features DB) |
| 상태 | Select |

---

### 4️⃣ Architecture (아키텍처/기술)

| 필드 | 타입 |
|------|------|
| 항목 | Title |
| 카테고리 | Select |
| 설명 | Text |
| 링크 | URL |

---

## 📊 Views (뷰 설정)

### Features DB Views:
1. **Table** - 전체 목록
2. **Timeline** - 일정별 정렬
3. **Board** - 상태별 Kanban (Draft → Approved → In Progress → Review → Done)
4. **Gallery** - 코드 파일별 미리보기
5. **Calendar** - 완료일 기준

### Sprints DB Views:
1. **Timeline** - 전체 스프린트 일정
2. **Table** - 스프린트별 상세 정보

---

## 📝 EP04 예시 데이터

### EP04-S01: 알림 시스템
- **상태**: Done
- **코드 경로**: 
  - frontend/components/notifications/NotificationFeed.tsx
  - frontend/components/notifications/NotificationItem.tsx
  - supabase/migrations/013_notifications.sql
- **코드 분석**:
  - 실시간 Supabase 구독
  - RPC: get_notifications()
  - Realtime: notifications table
  - 기술: Next.js, Supabase Realtime, TypeScript
- **PRD 링크**: docs/prd.md#알림-시스템
- **스토리 링크**: docs/stories/EP04-S01.md
- **디자인 스펙**: docs/design-specs/P1-NotificationFeed.md
- **진행률**: 100%
- **체크리스트**:
  - [x] NotificationFeed 구현
  - [x] NotificationItem 구현
  - [x] Realtime 구독
  - [x] 삭제 기능
  - [ ] E2E 테스트
  - [ ] 무한 스크롤

### EP04-S02: 검색 그리드
- **상태**: Done
- **코드 경로**:
  - frontend/components/search/SearchGridView.tsx
  - frontend/components/search/MovieGridCard.tsx
- **코드 분석**:
  - 그리드 레이아웃: 2/3/4 컬럼 반응형
  - 카드 비율: 9:16 (포스터)
  - 기술: Next.js, Tailwind CSS
  - 라인 수: ~100
- **PRD 링크**: docs/prd.md#검색-그리드
- **스토리 링크**: docs/stories/EP04-S02.md
- **디자인 스펙**: docs/design-specs/P2-SearchGridView.md
- **진행률**: 100%
- **체크리스트**:
  - [x] SearchGridView 구현
  - [x] MovieGridCard 구현
  - [x] 반응형 레이아웃
  - [ ] 뷰 전환 애니메이션
  - [ ] LocalStorage 저장

### EP04-S03: 피드 에디토리얼 레이아웃
- **상태**: In Progress
- **코드 경로**:
  - frontend/components/feed/EditorialReviewFeed.tsx
  - frontend/app/profile/edit/page.tsx
  - frontend/components/content/MovieDetailHeader.tsx
  - frontend/components/content/MovieDetailInfo.tsx
- **코드 분석**:
  - 포스터: 200px, 9:16 비율
  - 인용문 박스: #f5f5f5 배경, 좌측 보더
  - 좋아요: #666 → #ff4458
  - 기술: Next.js, Tailwind CSS, Framer Motion (선택)
  - 라인 수: ~400
- **PRD 링크**: docs/prd.md#피드-에디토리얼
- **스토리 링크**: docs/stories/EP04-S03.md
- **디자인 스펙**: docs/design-specs/P5-FeedEditorialLayout.md
- **진행률**: 70%
- **체크리스트**:
  - [x] EditorialReviewFeed 디자인 적용
  - [x] MovieDetailHeader 개선
  - [x] MovieDetailInfo 섹션 분리
  - [x] ProfileEditPage 필드 추가
  - [ ] RPC get_friend_reviews 구현
  - [ ] 좋아요 API 연동
  - [ ] 댓글 기능 연동
  - [ ] E2E 테스트

---

## 🎯 Components 예시

### EditorialReviewFeed
- **파일**: frontend/components/feed/EditorialReviewFeed.tsx
- **라인 수**: ~200
- **주요 기술**: Next.js, Tailwind CSS, Supabase
- **Props**: 
  ```typescript
  interface EditorialReviewFeedProps {
    userId?: string
    onlyFollowing?: boolean
  }
  ```
- **사용 위치**: /feed (친구 활동 피드)
- **기능**: EP04-S03
- **상태**: In Progress

### NotificationItem
- **파일**: frontend/components/notifications/NotificationItem.tsx
- **라인 수**: ~120
- **주요 기술**: Next.js, Supabase
- **사용 위치**: /notifications
- **기능**: EP04-S01
- **상태**: Done

---

## 📅 Sprint 일정

### Sprint 1-4 (완료)
- EP01: 콘텐츠 기록 & 평점 ✅
- EP02: 게임화 ✅
- EP03: 소셜 ✅
- EP02-S04, EP02-S05, EP02-S06, EP03-S04: 추가 ✅

### Sprint 5 (진행중)
- **시작일**: 2026-04-16
- **종료일**: 2026-05-14
- **목표**: 디자인 개선 & 신기능 (알림, 검색, 피드 에디토리얼)
- **Features**:
  - EP04-S01 (완료)
  - EP04-S02 (완료)
  - EP04-S03 (진행중)

### Sprint 6 (계획 예정)
- EP04 기능 완성 (RPC, API 연동)
- E2E 테스트
- 버그 수정

---

## 🏗️ 기술 스택

| 카테고리 | 항목 |
|---------|------|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | Go (Gin), Supabase RPC |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| Real-time | Supabase Realtime |
| Animation | Framer Motion |
| External | TMDB API |
| Deployment | Fly.io |

---

## 📌 사용 방법

1. **Notion에서 새 Database 생성**
   - "+ Add a database" → "Table"
   
2. **위 구조대로 Properties 추가**
   - Title, Select, Status, Relation, URL 등
   
3. **Views 설정**
   - Table, Timeline, Board, Gallery 추가
   
4. **EP04 데이터 입력**
   - 위 예시 데이터 참고
   
5. **지속적 업데이트**
   - 매 커밋마다 코드 경로, 상태, 진행률 업데이트

---

## 🔄 자동화 아이디어 (향후)

1. **GitHub Actions**: 커밋 시 Notion 자동 업데이트
2. **Zapier**: PR 생성 시 자동으로 Features DB 생성
3. **스크립트**: 코드 분석 자동 생성 (파일 라인 수, 컴포넌트 목록 등)

