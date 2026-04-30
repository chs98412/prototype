# P2: 검색 페이지 그리드 뷰 (SearchGridView)

## 📋 개요
검색 결과를 리스트 뷰와 그리드 뷰로 전환 가능하게 표시. 그리드는 2×2 또는 3×3 레이아웃.

## 🎨 페이지 구조

```
리스트 뷰 (기존):
┌────────────────────────┐
│ [검색바] [필터 아이콘] │
├────────────────────────┤
│ [포스터] 제목           │
│         연도 · 국가     │
│         2시간 45분      │
├────────────────────────┤
│ [포스터] 제목           │
│ ...                    │
└────────────────────────┘

그리드 뷰 (신규):
┌──────────────┬──────────────┐
│ [검색바] [⊟] [전환 버튼]    │
├──────────────┬──────────────┤
│  [포스터]    │  [포스터]    │
│  제목        │  제목        │
│  2024·한국   │  2024·한국   │
├──────────────┼──────────────┤
│  [포스터]    │  [포스터]    │
│  ...         │  ...         │
└──────────────┴──────────────┘
```

## 🧩 컴포넌트 상세

### 1. SearchPage (페이지)
**책임**: 검색 모드 관리 및 리스트/그리드 전환

**State**:
```ts
const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
const [searchQuery, setSearchQuery] = useState('');
const [results, setResults] = useState<Movie[]>([]);
```

**기능**:
- 검색 쿼리 입력
- 리스트 ↔ 그리드 전환
- 결과 필터링

---

### 2. SearchHeader (컴포넌트)
**책임**: 검색바 + 뷰 전환 버튼

**UI**:
```
┌────────────────────────────────────────┐
│ [⬅] [검색 입력]           [📋] [⊟]   │
│      "제목, 배우, 감독"              │
└────────────────────────────────────────┘
```

**Props**:
```ts
interface SearchHeaderProps {
  query: string;
  onQueryChange: (q: string) => void;
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
}
```

**버튼**:
- 📋 리스트 뷰 버튼 (색상: 현재 모드면 파란색)
- ⊟ 그리드 뷰 버튼 (2×2 그리드 아이콘)

---

### 3. MovieListView (컴포넌트 - 기존)
**책임**: 세로 리스트 렌더링

```
┌────────────────────────────────────┐
│ [80px 포스터] 제목                 │
│              2024 · 한국            │
│              2시간 45분 · 12세      │
├────────────────────────────────────┤
│ [80px 포스터] 제목                 │
│ ...                                │
└────────────────────────────────────┘
```

---

### 4. MovieGridView (컴포넌트 - 신규)
**책임**: 그리드 레이아웃 렌더링

```
┌──────────────┬──────────────┐
│  [포스터]    │  [포스터]    │
│  제목        │  제목        │
│  2024·한국   │  2024·한국   │
│  45분·12세   │  45분·12세   │
├──────────────┼──────────────┤
│  [포스터]    │  [포스터]    │
│  ...         │  ...         │
└──────────────┴──────────────┘
```

**Props**:
```ts
interface MovieGridViewProps {
  movies: Movie[];
  onMovieClick: (id: string) => void;
}
```

**특징**:
- 포스터 비율: 16:9 또는 원본 유지
- 각 카드 padding: 4px (gap)
- 한 줄에 2개 (모바일), 3개 (데스크톱)
- 제목: 1-2줄 (overflow: ellipsis)

---

### 5. MovieGridCard (컴포넌트)
**책임**: 단일 그리드 카드

**구조**:
```
┌──────────────┐
│              │
│  [포스터]    │ (h: 160px)
│              │
├──────────────┤
│ 제목 (1-2줄) │
│ 연도·국가    │
│ 러닝타임·등급│
└──────────────┘
```

**스타일**:
```ts
{
  width: '100%',
  aspectRatio: '9/16',  // 포스터 기본 비율
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  cursor: 'pointer'
}
```

---

## 📱 반응형 설정

| 화면 | 컬럼 수 | 카드 너비 |
|------|--------|---------|
| Mobile (375px) | 2 | calc(50% - 2px) |
| Tablet (768px) | 3 | calc(33% - 2px) |
| Desktop (1280px) | 4 | calc(25% - 2px) |

---

## 🔧 기술 스펙

**파일 위치**:
```
app/
├── components/
│   ├── search/
│   │   ├── SearchPage.tsx
│   │   ├── SearchHeader.tsx
│   │   ├── MovieListView.tsx
│   │   ├── MovieGridView.tsx
│   │   └── MovieGridCard.tsx
```

**상태 저장**:
- LocalStorage에 `searchViewMode` 저장 (다음 방문시 유지)

**성능**:
- 그리드: Virtual scrolling (react-window) 추천
- 라이브러리: React Grid Layout 또는 CSS Grid

---

## ✅ 승인 기준 (AC)

- [ ] SearchHeader 구현 (검색바 + 뷰 전환 버튼)
- [ ] MovieListView 기존 유지
- [ ] MovieGridView 구현 (2×2 레이아웃)
- [ ] MovieGridCard 컴포넌트
- [ ] 뷰 전환 시 스무드 애니메이션
- [ ] 모바일/태블릿/데스크톱 반응형 테스트
- [ ] 뷰 모드 LocalStorage 저장
- [ ] 그리드 카드 클릭 → 상세 페이지 이동

---

## 🎬 v0.dev 프롬프트

```
Create a dual-view search page for a movie app with list and grid toggle.

SearchHeader:
- Left: Back button
- Center: Search input (placeholder: "제목, 배우, 감독")
- Right: 2 view mode buttons
  - List view icon (currently active: blue highlight)
  - Grid view icon (4 squares)

MovieGridView (when grid mode enabled):
- 2 columns on mobile, 3 on tablet, 4 on desktop
- Each card: poster image (aspect ratio 9:16) + title (max 2 lines) + year·country + runtime·rating
- Gap: 4px between cards
- Border radius: 8px
- Shadow on hover
- Click: navigate to movie detail page

MovieListView (existing, no changes):
- Keep current implementation

Behavior:
- Smooth transition when switching between views
- Remember last selected view in localStorage
- Responsive grid with CSS Grid or Flexbox
```

