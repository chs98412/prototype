# Story: 리뷰 & 통계 UI 스펙

**ID**: EP04-S03-Design
**Epic**: EP04: 음악 평가 시스템
**Sprint**: 6
**Points**: 2
**Status**: Draft
**Assignee**: Designer
**Created**: 2026-05-12
**Updated**: 2026-05-12

---

## User Story

> As a **Designer**,
> I want to **create UI specs for album reviews and statistics**,
> So that **developers can implement comprehensive album insight pages**.

---

## Acceptance Criteria

- [ ] AC1: 통계 섹션 카드 디자인 (평가 곡 수, 평균 평점, 청취 일수, 마지막 청취)
- [ ] AC2: 리뷰 작성 폼 UI (텍스트 에어리어, 스포일러 체크박스, 저장 버튼)
- [ ] AC3: 리뷰 표시 디자인 (읽기/편집 모드, 수정/삭제 버튼)
- [ ] AC4: 스포일러 마크 스타일 (경고 뱃지)
- [ ] AC5: 모바일 반응형 (폼 너비, 터치 상호작용)

---

## 📐 UI 스펙

### 통계 섹션 (Stats Cards)
```
┌─────────────────────────────────────┐
│ 음악 통계                            │
├─────────────────────────────────────┤
│                                     │
│  [평가 곡]  [평균평점]  [청취 일수] │
│     3곡      4.0/5      5일       │
│                                     │
│          마지막 청취                 │
│          2024.12.15 19:45          │
│                                     │
└─────────────────────────────────────┘

레이아웃:
- 섹션 헤더: 12px bold, px-4 py-3
- 통계 그리드: 3열 (모바일), 4열 (데스크톱)
- 각 카드: bg-gray-50, border rounded-lg, px-3 py-2
- 큰 숫자: 24px bold, text-gray-900
- 레이블: 12px text-gray-500
- 마지막 청취: 중앙 정렬, text-sm text-gray-600
```

### 리뷰 섹션 (Display + Edit)

#### 읽기 모드
```
┌─────────────────────────────────────┐
│ 리뷰                [수정] [삭제]    │ (헤더 + 버튼)
├─────────────────────────────────────┤
│ ⚠ 스포일러 포함                     │ (스포일러 배지)
│                                     │
│ "이 음반은 정말 좋았어요. 특히     │ (리뷰 본문)
│  처음 세 곡이 최고입니다."          │
│                                     │
│ 작성일: 2024.12.15 19:45           │ (메타데이터)
└─────────────────────────────────────┘

스타일:
- 헤더: font-bold text-sm, flex justify-between items-center
- 스포일러 배지: bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold
- 본문: text-sm text-gray-900, line-height 1.6, break-words
- 메타: text-xs text-gray-500, mt-3
- 수정 버튼: text-blue-500 hover:underline text-sm
- 삭제 버튼: text-red-500 hover:underline text-sm
```

#### 편집 모드
```
┌─────────────────────────────────────┐
│ 리뷰 편집                            │
├─────────────────────────────────────┤
│ [텍스트 에어리어 - 기존 내용 표시]  │
│                                     │
│ ☑ 스포일러 포함                     │
│                                     │
│      [저장]  [취소]                 │
└─────────────────────────────────────┘

스타일:
- textarea: w-full, border border-gray-200, rounded-lg, px-3 py-2
- 포커스: ring-2 ring-blue-500
- 체크박스: w-4 h-4, accent-blue-500
- 저장: bg-blue-500 hover:bg-blue-600, text-white, px-4 py-2, rounded
- 취소: bg-gray-200 hover:bg-gray-300, text-gray-900, px-4 py-2, rounded
```

### 리뷰 없을 때
```
┌─────────────────────────────────────┐
│ 리뷰                [작성하기]       │
├─────────────────────────────────────┤
│                                     │
│  이 음반에 대한 생각을 남겨주세요.  │ (플레이스홀더)
│                                     │
└─────────────────────────────────────┘
```

### 스포일러 뱃지
```
┌──────────────────┐
│ ⚠ 스포일러 포함  │
└──────────────────┐

스타일:
- 배경: #fef3c7 (yellow-100)
- 텍스트: #92400e (yellow-800)
- 아이콘: ⚠
- 패딩: px-2 py-1
- 폰트: 12px bold
- 반경: rounded
```

### 레이아웃 (페이지 내 위치)

```
┌─────────────────────────────────────┐
│ [음반 헤더]                         │
├─────────────────────────────────────┤
│ [곡목 테이블]                       │
├─────────────────────────────────────┤
│ [통계 카드]  ← 새 섹션              │
├─────────────────────────────────────┤
│ [리뷰 섹션]  ← 기존                 │
├─────────────────────────────────────┤
│ [BottomNav]                         │
└─────────────────────────────────────┘
```

### 반응형 브레이크포인트
```
모바일 (< 768px):
  - 통계: 3열 (각 40% 너비)
  - 리뷰: 전체 너비
  - 폰트: 약간 축소 (text-sm)

태블릿 (768px ~ 1024px):
  - 통계: 4열 (각 25% 너비)
  - 리뷰: 전체 너비

데스크톱 (≥ 1024px):
  - 통계: 4열 (각 25% 너비)
  - 리뷰: 전체 너비
  - 폰트 정상 (text-base)
```

### 색상 팔레트
```
배경: #ffffff (white)
텍스트 (주): #000000 (gray-900)
텍스트 (보조): #6b7280 (gray-500)
통계 카드: #f9fafb (gray-50)
테두리: #e5e7eb (gray-200)
스포일러 배경: #fef3c7 (yellow-100)
스포일러 텍스트: #92400e (yellow-800)
버튼 (수정): #3b82f6 (blue-500)
버튼 (삭제): #ef4444 (red-500)
```

### 타이포그래피
```
섹션 헤더: font-bold text-sm (12px)
통계 큰 숫자: font-bold text-2xl (24px)
통계 레이블: text-xs text-gray-500 (12px)
리뷰 헤더: font-semibold text-sm (14px)
리뷰 본문: text-sm (14px)
메타데이터: text-xs text-gray-500 (12px)
버튼: font-semibold text-sm (14px)
```

---

## 🎨 v0.dev 프롬프트

```
Create album statistics and review section components for a music detail page.

Statistics Section:
- Display 4 stat cards in a responsive grid (3-4 columns)
- Each card shows: Label, Number (large, bold)
- Stats: "Rated Tracks" (count), "Average Rating" (X.X/5), "Listen Days" (count)
- Additional: "Last Listened" (date and time, center-aligned)
- Card styling: Light gray background, rounded, subtle border
- Mobile: 3 cards visible, Desktop: 4 cards

Review Section:
Two states:

1. Read Mode:
   - Header: "Review" with Edit and Delete buttons (right-aligned)
   - If spoiler: Yellow warning badge "⚠ Contains spoiler"
   - Review text: Gray, readable, preserve line breaks
   - Meta: Small gray text "Created: 2024.12.15 19:45"

2. Write/Edit Mode:
   - Textarea with review text (max 500 chars)
   - Checkbox: "Contains spoiler content"
   - Buttons: [Save] [Cancel]
   - Textarea styling: White bg, gray border, rounded, with focus ring

No Review State:
   - Placeholder text: "Share your thoughts about this album..."
   - [Write Review] button
   - Light background

Responsive:
- Mobile: Single column layout
- Desktop: Full width with proper spacing

Colors:
- Spoiler badge: Yellow background (#fef3c7), dark yellow text (#92400e)
- Edit/Delete: Blue/Red links
- Buttons: Blue for save, Gray for cancel

Make it clean and simple, similar to the track rating UI.
```

---

## 📋 컴포넌트 구조

```typescript
// components/music/
├── AlbumStatsCards.tsx     // 통계 카드 4개
├── AlbumReviewDisplay.tsx  // 리뷰 읽기/편집 모드
└── (기존 ReviewSection을 확장)
```

---

## Deliverables

- [ ] Figma 디자인 (또는 v0.dev 생성 코드)
- [ ] v0.dev 프롬프트 검증
- [ ] 모든 상태 명확히 정의 (읽기, 편집, 없음)
- [ ] 모바일/데스크톱 레이아웃 확인

---

## 참고 (Reference)

**기존 ReviewSection:**
- 기본적인 리뷰 작성 폼 구현됨
- EP04-S03에서 확장 필요:
  - 리뷰 표시 모드 추가
  - 수정/삭제 버튼 추가
  - 통계 카드 분리

**데이터 흐름:**
1. 리뷰 저장: RPC `save_album_review`
2. 리뷰 삭제: RPC `delete_album_review`
3. 통계 로드: RPC `get_album_stats`

---

## Dependencies

- EP04-S02: 곡 평가 개발 완료
- ReviewSection 컴포넌트 (기존)

---

## Definition of Done

- [ ] Figma 또는 v0.dev 생성 코드 완성
- [ ] 모든 상태 (읽기, 편집, 삭제, 없음) 명확히 정의
- [ ] Developer가 구현할 수 있는 상세 스펙
- [ ] 모바일/태블릿/데스크톱 반응형 확인
- [ ] 최종 승인

---

## Dev Notes

[To be filled during design phase]
