# P3: 영화 상세 페이지 개선 (MovieDetailPage)

## 📋 개요
영화 정보를 더 임팩트있게 표시. 큰 포스터를 중앙에 배치하고, 버튼과 정보를 명확하게 표시.

## 🎨 페이지 구조

### 현재 구조 (기존)
```
┌─────────────────┐
│ [80px 포스터]   │
│ 제목            │
│ 연도·국가·장르  │
│ 러닝타임        │
│ [평점 기록]     │
│ [리뷰 보기]     │
│ ...             │
└─────────────────┘
```

### 신규 구조 (개선)
```
┌──────────────────────┐
│      [큰 포스터]     │  ← 중앙 배치, 200px
│      (9:16 비율)     │
├──────────────────────┤
│       제목           │
│     연도·국가·장르   │
│    러닝타임·등급     │
├──────────────────────┤
│  [평점 쓰기]  [기록] │  ← 2개 버튼 명확히
├──────────────────────┤
│   정보 섹션          │
│   출연·감독·줄거리   │
│   리뷰 섹션          │
│   추천 섹션          │
└──────────────────────┘
```

## 🧩 컴포넌트 상세

### 1. MovieDetailPage (페이지)
**책임**: 영화 상세 정보 표시 및 상호작용

**구조**:
```tsx
<MovieDetailPage>
  <MovieDetailHeader />        // 포스터 + 제목 + 메타정보
  <MovieDetailActions />       // 평점/기록 버튼
  <MovieDetailInfo />          // 출연/감독/줄거리
  <MovieReviews />             // 리뷰 섹션
  <MovieRecommendations />     // 추천 영화
</MovieDetailPage>
```

---

### 2. MovieDetailHeader (컴포넌트)
**책임**: 포스터, 제목, 메타 정보 표시

**UI**:
```
┌──────────────────────┐
│                      │
│   [200px 포스터]     │  ← 중앙 정렬
│   (9:16, 그림자)     │
│                      │
├──────────────────────┤
│   제목               │ ← bold, 24px
│  (최대 2줄)          │
├──────────────────────┤
│  연도 · 국가 · 장르  │ ← #666, 14px
│  2시간 45분 · 12세   │
└──────────────────────┘
```

**Props**:
```ts
interface MovieDetailHeaderProps {
  movie: Movie & {
    id: string;
    title: string;
    posterUrl: string;
    year: number;
    country: string;
    genres: string[];
    runtime: number;
    rating: string;
    tmdbId: number;
  };
}
```

**스타일**:
```ts
{
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '24px 16px',
  gap: '12px',
  
  poster: {
    width: '200px',
    aspectRatio: '9/16',
    borderRadius: '12px',
    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
    objectFit: 'cover'
  },
  
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center'
  },
  
  meta: {
    fontSize: '14px',
    color: '#666',
    textAlign: 'center'
  }
}
```

---

### 3. MovieDetailActions (컴포넌트)
**책임**: 평점 쓰기 + 기록 버튼

**UI**:
```
┌──────────────────────┐
│  [⭐ 평점 쓰기]     │
│  [📌 기록하기]       │
└──────────────────────┘
```

**레이아웃**:
- Grid: 2 columns (각각 50%)
- Gap: 8px
- 버튼 높이: 44px
- Border-radius: 8px

**버튼 스타일**:

| 상태 | 배경 | 텍스트 |
|------|------|--------|
| 활성 (평점 함) | 파란색 (#007AFF) | 흰색 |
| 비활성 | 회색 (#E8E8E8) | 검정 |
| Hover | 더 진한 색 | - |

**상호작용**:
- 평점 쓰기 클릭: Modal 또는 새 페이지 (RatingModal)
- 기록 클릭: 시청 기록 토글 (체크박스 같이)

**Props**:
```ts
interface MovieDetailActionsProps {
  movieId: string;
  hasRated: boolean;
  hasLogged: boolean;
  onRatingClick: () => void;
  onLoggingClick: () => void;
}
```

---

### 4. MovieDetailInfo (컴포넌트)
**책임**: 감독, 출연, 줄거리 표시

**UI**:
```
┌──────────────────────┐
│ 감독                 │
│ 감독명1, 감독명2     │
├──────────────────────┤
│ 출연                 │
│ [배우1] [배우2]...   │
├──────────────────────┤
│ 줄거리               │
│ 영화의 긴 줄거리가   │
│ 여기 표시됩니다...   │
└──────────────────────┘
```

**섹션별 스타일**:
```ts
{
  padding: '16px',
  borderTop: '1px #eee',
  
  sectionTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#999',
    marginBottom: '8px'
  },
  
  sectionContent: {
    fontSize: '14px',
    color: '#333',
    lineHeight: '1.5'
  }
}
```

**배우 칩**:
```
┌─────────────┐
│ 배우명      │
└─────────────┘
```
- Background: #f0f0f0
- Padding: 6px 10px
- Border-radius: 4px
- Margin: 4px (gap)

---

## 📱 반응형

| 화면 | 포스터 크기 | 레이아웃 |
|------|-----------|---------|
| Mobile (375px) | 160px | 전체 너비 |
| Tablet (768px) | 200px | 전체 너비 |
| Desktop (1280px) | 240px | 전체 너비 (중앙 정렬) |

---

## 🔧 기술 스펙

**파일 위치**:
```
app/
├── components/
│   ├── movie/
│   │   ├── MovieDetailPage.tsx
│   │   ├── MovieDetailHeader.tsx
│   │   ├── MovieDetailActions.tsx
│   │   ├── MovieDetailInfo.tsx
│   │   └── RatingModal.tsx
```

**API 연결**:
- 영화 정보: `getMovieDetail(tmdbId)`
- 평점 조회: `getUserRating(movieId, userId)`
- 기록 조회: `getUserLogEntry(movieId, userId)`

**라이브러리**:
- Image optimization: `next/image`
- Modal: 기존 Modal 컴포넌트 재사용

---

## ✅ 승인 기준 (AC)

- [ ] MovieDetailHeader 구현 (200px 중앙 포스터)
- [ ] 제목과 메타 정보 명확하게 표시
- [ ] MovieDetailActions (2개 버튼)
- [ ] 평점 쓰기 모달 연결
- [ ] 기록 토글 기능
- [ ] MovieDetailInfo 섹션 (감독/출연/줄거리)
- [ ] 배우 칩 스타일
- [ ] 모바일/태블릿/데스크톱 반응형 테스트
- [ ] 포스터 로딩 상태 처리 (skeleton)
- [ ] 이미지 최적화 (next/image)

---

## 🎬 v0.dev 프롬프트

```
Create an improved movie detail page for a movie app.

Layout:
- Centered, vertical scrollable page

MovieDetailHeader:
- Large poster image (200px width, 9:16 aspect ratio, rounded corners, shadow)
- Title below (24px, bold, max 2 lines)
- Metadata: year · country · genre (14px gray)
- Runtime · rating (14px gray)

MovieDetailActions:
- 2 full-width buttons in a row (50% width each, 4px gap)
- Button 1: "⭐ 평점 쓰기" (blue when active, gray when inactive)
- Button 2: "📌 기록하기" (toggle state)
- Height: 44px, border-radius: 8px
- Font: 16px, bold

MovieDetailInfo sections:
1. Director(s) - gray title "감독", list names
2. Cast - gray title "출연", display as gray chips (padding 6px 10px, rounded)
3. Synopsis - gray title "줄거리", body text with 1.5 line-height

Spacing:
- Section gap: 16px
- Section padding: 16px
- Border-top between sections: 1px #eee

All text should be center-aligned where appropriate (title, meta).
```

