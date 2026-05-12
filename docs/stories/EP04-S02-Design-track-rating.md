# Story: 곡 평가 UI 스펙

**ID**: EP04-S02-Design
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
> I want to **create comprehensive UI specs for track rating**,
> So that **developers can implement intuitive track evaluation**.

---

## Acceptance Criteria

- [ ] AC1: 음반 상세 페이지 레이아웃 (헤더, 곡목, 리뷰 섹션)
- [ ] AC2: 음반 헤더 UI (이미지, 제목, 아티스트, 자동 계산 평점 표시)
- [ ] AC3: 곡 평가 행 디자인 (곡번호, 곡명, 아티스트, 시간, 별점)
- [ ] AC4: 별점 입력 UI (1-5 클릭식, 마우스오버 피드백)
- [ ] AC5: 평가 저장 상태 표시 (저장중, 완료)
- [ ] AC6: 곡 리뷰 작성 버튼/모달 디자인
- [ ] AC7: 모바일 반응형 (스크롤 테이블, 터치 별점)

---

## 📐 UI 스펙

### 페이지 레이아웃
```
┌─────────────────────────────────────┐
│ ← 뒤로가기                          │ (스티키 헤더, bg-white)
├─────────────────────────────────────┤
│  [앨범 이미지]                      │
│                                     │
│  제목                               │ (200×200px 또는 고정 크기)
│  아티스트                           │
│  ★★★★☆ 4.0 (3곡 평가)           │ (자동 계산)
│                                     │
├─────────────────────────────────────┤
│ 곡목 (15곡) [곡목 보기/숨기기]     │ (섹션 헤더)
├─────────────────────────────────────┤
│ 1 곡 제목              아티스트 3:45 ★★★☆☆ │
│ 2 다음 곡              아티스트 4:12 ☆☆☆☆☆ │
│ 3 또 다른 곡           아티스트 3:30 ★★★★★ │
│ ...                                  │ (스크롤 가능)
├─────────────────────────────────────┤
│ 리뷰 작성 (선택)                    │
│ [음반에 대한 생각을 남겨주세요...]  │
│  [저장]                              │
├─────────────────────────────────────┤
│ 🏠 검색 프로필 ...  (BottomNav)    │
└─────────────────────────────────────┘
```

### 음반 헤더
```
스크롤 전:
┌──────────────────────────────────┐
│ [     200×200         ]          │
│ 음반 제목                        │ - 폰트: bold, 16px
│ 아티스트                         │ - 텍스트: 12px, gray
│ ★★★★☆ 4.0/5 (3곡 평가) │ - 자동 계산, 배경색 #fff3cd
│ 2024 · Rock, Indie              │ - 년도 · 장르
└──────────────────────────────────┘

스티키 헤더:
┌──────────────────────────────────┐
│ ← 뒤로가기  | 음반 제목           │
└──────────────────────────────────┘
```

### 곡 평가 행 (테이블 형식)
```
┌─────┬──────────────┬──────────┬────┬──────────────┐
│ #   │ 곡명         │ 아티스트 │ 시간│ 별점         │
├─────┼──────────────┼──────────┼────┼──────────────┤
│ 1   │ Song Title   │ Singer   │3:45│ ★★★☆☆ 3.0 │
│     │              │          │    │ (✓ 저장됨)   │
├─────┼──────────────┼──────────┼────┼──────────────┤
│ 2   │ Another Song │ Singer   │4:12│ ☆☆☆☆☆ 0.0 │
│     │              │          │    │ (대기 중)    │
└─────┴──────────────┴──────────┴────┴──────────────┘

스타일:
- 각 행: py-3 px-4, border-b border-gray-200
- 곡번호: font-bold text-gray-500, width: 30px
- 곡명: font-semibold text-sm, line-clamp-1
- 아티스트: text-gray-500 text-xs, line-clamp-1
- 시간: text-gray-400 text-xs, width: 40px
- 별점: 인터랙티브 StarRating 컴포넌트
- 상태: "✓ 저장됨" 또는 "저장중..." (작은 텍스트)
```

### 별점 입력 UI (StarRating)
```
☆☆☆☆☆  <- 기본 (평가 안 함)
★★★☆☆  <- 3점 (마우스오버 또는 선택)
★★★★★  <- 5점 (선택)

상태:
- 호버: 별색 강조 + 커서 포인터
- 클릭: 즉시 저장 (색상 변경)
- 저장중: 로딩 스핀 + "저장중..." 표시
- 저장됨: 체크마크 "✓" + 회색 처리

크기: 각 별 32×32px (모바일에선 터치 영역 확대 40×40px)
```

### 곡목 섹션 헤더
```
┌─────────────────────────────────┐
│ 곡목 (15곡) [▼]                 │ (토글 버튼)
│ 총 재생시간: 1h 3m              │ (서브텍스트)
└─────────────────────────────────┘

- 폰트: bold 14px
- 패딩: px-4 py-3
- 배경: white
- 하단: border-b border-gray-200
```

### 리뷰 섹션
```
┌─────────────────────────────────┐
│ 리뷰 (선택)                     │
│ [이 음반에 대한 생각을...]      │ 플레이스홀더
│                                  │ min-height: 80px
│                                  │ max-height: 200px
│                                  │
│ ☑ 스포일러 포함                 │ (체크박스)
│                                  │
│      [저장]  [취소]             │ 버튼들
└─────────────────────────────────┘

스타일:
- textarea: border border-gray-200, rounded-lg, px-3 py-2
- 체크박스: 라벨과 함께
- 저장 버튼: bg-blue-500 text-white
- 취소 버튼: bg-gray-200 text-gray-900
```

### 반응형 브레이크포인트
```
모바일 (< 768px):
  - 헤더 이미지: 150×150px
  - 곡 테이블: 가로 스크롤 가능
  - 별점: 더 큰 터치 영역 (40×40px)
  - 폰트 축소: 행 높이 py-2

태블릿+ (≥ 768px):
  - 헤더 이미지: 200×200px
  - 곡 테이블: 전체 너비 표시
  - 별점: 32×32px
  - 폰트 정상: py-3
```

### 색상 팔레트
```
배경: #ffffff (white)
텍스트 (주): #000000 (gray-900)
텍스트 (보조): #6b7280 (gray-500)
텍스트 (약): #9ca3af (gray-400)
테두리: #e5e7eb (gray-200)
별: #fbbf24 (yellow-400) / ★
별 (빈): #d1d5db (gray-300) / ☆
버튼: #3b82f6 (blue-500)
알림배경: #fff3cd (yellow-50)
```

---

## 🎨 v0.dev 프롬프트

```
Create a music album detail page with track rating functionality, similar to a movie detail page.

Layout:
- Sticky header with back button and album title
- Album info section: Square image (1:1), title, artist, auto-calculated rating (yellow stars)
- Track list table showing all songs with track number, title, artist, duration, and interactive star rating
- Optional review section at bottom
- Bottom navigation bar

Album Header Section:
- Image: 150×150px mobile, 200×200px desktop, rounded corners
- Title: Bold, large font (text-lg font-bold)
- Artist: Gray subtext (text-sm text-gray-500)
- Auto Rating: "★★★★☆ 4.0/5 (3 tracks rated)" in pale yellow background (#fff3cd)
- Year and genres: "2024 · Rock, Indie" in small gray text

Track Table:
- Columns: Track # | Song Title | Artist | Duration | Star Rating
- Multiple rows, each showing one track
- Track number: Bold, small (1, 2, 3...)
- Song title: Semi-bold, truncate if too long
- Artist: Gray, smaller text
- Duration: Gray, right-aligned (3:45, 4:12)
- Below each row: Status text "Saving..." or "✓ Saved" in small gray text

Star Rating Component (Interactive):
- 5 clickable stars: ★ for filled, ☆ for empty
- Half-star precision (3.5 stars possible)
- Click to rate immediately
- Hover effect: Stars highlight on mouseover
- Shows current rating number (3.0, 4.5, etc) next to stars
- On click: Display "Saving..." then "✓ Saved"
- 32×32px per star (larger touch areas on mobile)

Star Colors:
- Filled: Yellow (#fbbf24)
- Empty: Light gray (#d1d5db)
- Text: Dark gray (#1f2937)

Review Section (Bottom):
- Label: "Album Review (Optional)"
- Large textarea: White background, gray border, rounded corners
- Placeholder: "Share your thoughts about this album..."
- Checkbox: "Contains spoiler content"
- Buttons: [Save] [Cancel]

Responsive:
- Mobile: Header image 150px, compact table with horizontal scroll
- Desktop: Header image 200px, full-width table
- Touch-friendly: Large star areas on mobile

Make it clean, modern, consistent with existing content pages.
```

---

## 📋 컴포넌트 구조

```typescript
// components/music/
├── AlbumDetailHeader.tsx    // 음반 정보 + 이미지
├── TrackRatingRow.tsx       // 곡 1행 (곡명, 별점, 상태)
├── TrackRatingTable.tsx     // 곡 테이블 전체
├── AlbumRatingDisplay.tsx   // 자동 계산 평점 표시
├── ReviewSection.tsx        // 리뷰 작성 폼
└── app/music/albums/[id]/page.tsx  // 상세 페이지
```

---

## Deliverables

- [ ] Figma 디자인 파일 (또는 v0.dev 생성 코드)
- [ ] v0.dev 프롬프트 검증
- [ ] 모든 상태 (저장중, 저장됨, 로드 중) 디자인
- [ ] 모바일/데스크톱 레이아웃 확인

---

## 참고 (Reference)

**기존 StarRating 컴포넌트:**
- 위치: `components/content/StarRating.tsx`
- 기능: 0.5-5.0 별점, 호버 효과, 반응형
- 재사용 가능: 음악 곡 평가에 그대로 사용 가능

**곡 평가 데이터 흐름:**
1. 사용자가 별점 클릭
2. 즉시 저장 (RPC: `rate_track`)
3. UI 업데이트 (체크마크 + 회색)
4. 음반 평점 자동 계산 (평균)

---

## Dependencies

- EP04-S01: 음반 검색 개발 완료
- StarRating 컴포넌트 (기존)

---

## Definition of Done

- [ ] Figma 또는 v0.dev 생성 코드 완성
- [ ] 모든 상태 명확히 정의됨
- [ ] Developer가 구현할 수 있는 상세 스펙
- [ ] 모바일/태블릿/데스크톱 반응형 확인
- [ ] 최종 승인

---

## Dev Notes

[To be filled during design phase]
