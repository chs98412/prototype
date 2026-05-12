# Story: 음반 검색 UI 스펙

**ID**: EP04-S01-Design
**Epic**: EP04: 음악 평가 시스템
**Sprint**: 5
**Points**: 3
**Status**: Draft
**Assignee**: Designer
**Created**: 2026-05-12
**Updated**: 2026-05-12

---

## User Story

> As a **Designer**,
> I want to **create comprehensive UI specs for album search**,
> So that **developers can implement consistent and user-friendly album discovery**.

---

## Acceptance Criteria

- [ ] AC1: 검색 페이지 레이아웃 (영화 검색 참고, 음악에 맞게 조정)
- [ ] AC2: 음반 카드 디자인 (이미지, 제목, 아티스트, 출시일, 장르)
- [ ] AC3: 곡목 리스트 UI (펼침/접힘, 트랙 번호, 제목, 아티스트, 재생시간)
- [ ] AC4: "추가" 버튼 상태 (활성, 추가됨, 로딩)
- [ ] AC5: 모바일 반응형 스펙 (2열 그리드, 터치 영역)
- [ ] AC6: v0.dev 프롬프트 작성
- [ ] AC7: 컬러 팔레트 및 타이포그래피 정의

---

## 📐 UI 스펙

### 페이지 레이아웃
```
┌─────────────────────────────────────┐
│ ← 검색                              │ (스티키 헤더, bg-white border-b)
├─────────────────────────────────────┤
│                                     │
│  [음반1]  [음반2]                   │ 그리드 (2열 모바일, 3-4열 데스크톱)
│  [음반3]  [음반4]                   │ gap-x-2 md:gap-x-3, gap-y-4
│                                     │
├─────────────────────────────────────┤
│ 🏠 검색 프로필 ...  (BottomNav)    │
└─────────────────────────────────────┘
```

### 검색 입력 UI
```
위치: /music/search
헤더:
  - 왼쪽: ← 버튼 (뒤로가기)
  - 중앙: "음반 검색" (텍스트)
  - 높이: 56px (영화 검색과 동일)
  - 패딩: px-4, py-3
  - 배경: white
  - 하단: border-b border-gray-200

검색 입력:
  - 타입: 텍스트 입력
  - 플레이스홀더: "음반 또는 아티스트..."
  - 아이콘: SearchIcon (왼쪽)
  - 실시간 검색 (onChange)
  - 최소 2자 이상 검색
```

### 음반 카드 (AlbumCard)
```
┌─────────────────┐
│                 │
│   [이미지]      │  - 사각형 (1:1)
│   300×300px     │  - radius: rounded-lg
│   또는 정사각형  │  - object-cover
│                 │
├─────────────────┤
│ 제목            │  - font-bold text-sm
│ (최대 2줄)      │  - line-clamp-2
│                 │
│ 아티스트        │  - text-muted text-xs
│ 출시년 · 장르   │  - truncate
│                 │
│  [+ 추가]       │  - w-full h-10
│  또는 [✓ 추가됨]│  - bg-blue-500 (활성)
│                 │  - bg-gray-200 (추가됨)
│                 │  - disabled cursor-not-allowed
└─────────────────┘
```

### 곡목 리스트 (확장 시)
```
┌──────────────────────────────────────┐
│ 곡목 (1h 3m) [▼]                     │ (헤더, 토글 아이콘)
├──────────────────────────────────────┤
│ 1. 곡 제목                    3:45    │ - flex items-center
│    아티스트                          │ - 트랙 번호: font-bold
│                                      │ - 곡명: font-semibold truncate
│ 2. 다음 곡                    4:12    │ - 아티스트: text-muted text-sm
│    아티스트                          │ - 재생시간: text-right text-xs
│                                      │ - 패딩: py-2 px-3
│ [더 보기 1곡] (있을 때만)            │
│                                      │
│  [음반 추가]                         │ 버튼: w-full mt-3
└──────────────────────────────────────┘
```

### 카드 상태들

**로딩 중:**
- 쉐도우 + 애니메이션 (opacity pulse)
- "검색 중..." 메시지

**검색 결과 없음:**
- 센터 정렬 아이콘 + "결과 없음"
- 다시 시도 제안

**추가됨 상태:**
- 버튼 텍스트: "✓ 추가됨"
- 배경색: #e5e7eb (gray-200)
- disabled 상태

### 반응형 브레이크포인트
```
모바일 (< 768px):
  - 그리드: 2열
  - 카드 너비: (100vw - 32px) / 2
  - gap: px-4, gap-2

태블릿 (768px ~ 1024px):
  - 그리드: 3열
  - gap-x-3, gap-y-4

데스크톱 (≥ 1024px):
  - 그리드: 4열
  - gap-x-3, gap-y-5
```

### 색상 팔레트
```
Background: #ffffff (white)
Text (Primary): #000000 (gray-900)
Text (Secondary): #6b7280 (gray-500)
Border: #e5e7eb (gray-200)
Button (Active): #3b82f6 (blue-500)
Button (Disabled): #e5e7eb (gray-200)
Hover: #f3f4f6 (gray-100)
```

### 타이포그래피
```
헤더 텍스트: font-bold text-base
카드 제목: font-bold text-sm
카드 서브: text-muted text-xs
곡목 제목: font-semibold text-sm
곡목 아티스트: text-muted text-xs
```

---

## 🎨 v0.dev 프롬프트

```
Create a music album search page similar to a movie search interface but adapted for music albums.

Layout:
- Sticky header with back arrow and search input
- Search bar with icon and real-time search (minimum 2 characters)
- Grid layout: 2 columns mobile, 3 columns tablet, 4 columns desktop
- Bottom navigation

Album Card:
- 1:1 square image (album cover) with rounded corners
- Bold album title (max 2 lines, truncated)
- Artist name (gray, smaller text)
- Release year · Genre (gray, smallest text)
- "Add" button (blue when active, gray when added)
- On click, show expandable track list

Track List (when expanded):
- Shows all tracks in album
- Format: [1.] Track Name [Time]
  - Smaller text: Artist Name
- Total duration at top
- "Add Album" button below tracks

States:
- Loading: Show skeleton/pulse animation
- No Results: Center message
- Added: Button shows checkmark, disabled
- Hover: Subtle background change

Colors:
- Background: white
- Text: dark gray
- Borders: light gray
- Active buttons: blue (#3b82f6)
- Disabled buttons: light gray

Make it look modern, clean, and similar to the existing movie search page.
```

---

## 📋 컴포넌트 구조

```typescript
// components/music/
├── AlbumSearch.tsx         // 검색 페이지 (메인)
├── AlbumSearchBar.tsx      // 검색 입력
├── AlbumGridView.tsx       // 그리드 레이아웃
├── AlbumCard.tsx           // 음반 카드
└── AlbumTrackList.tsx      // 곡목 리스트 (토글)
```

---

## Deliverables

- [ ] Figma 디자인 파일 (또는 v0.dev 생성 코드)
- [ ] v0.dev 프롬프트 작성 및 검증
- [ ] 상태 명세 (활성, 로딩, 오류, 성공)
- [ ] 모바일 브레이크포인트 확인

---

## Dependencies

- EP04-S00: 기초 세팅 완료 (Spotify API, Backend 구현)

---

## Definition of Done

- [ ] Figma 파일 완성 또는 v0.dev 코드 생성
- [ ] 모든 상태(로딩, 오류, 성공, 추가됨) 디자인됨
- [ ] Developer가 구현할 수 있는 명확한 스펙
- [ ] 모바일/태블릿/데스크톱 레이아웃 확인
- [ ] 최종 승인

---

## 참고 (Reference)

**기존 영화 검색 페이지:**
- 위치: `/search`
- 컴포넌트: `SearchGridView`, `MovieGridCard`, 검색바
- 레이아웃: 그리드 (2-4열), 헤더, BottomNav
- 스타일: Tailwind CSS, 동일 색상 체계 사용

**차이점 (Music 버전):**
- 영화: 포스터 (2:3 비율) → 음반: 커버 (1:1 비율)
- 영화: 년도, 장르, 언어 → 음반: 출시일, 장르 (language 제거)
- 영화: 곡목 없음 → 음악: 곡목 리스트 표시 (토글)
- 영화: "시청" 또는 "예정" → 음악: "추가" 또는 "추가됨"

---

## Dev Notes

[To be filled during design phase]

