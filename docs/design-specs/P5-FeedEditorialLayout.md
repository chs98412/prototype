# P5: 피드 에디토리얼 레이아웃 (FeedEditorialLayout)

## 📋 개요
리뷰를 더 매거진/에디토리얼 스타일로 표시. 큰 포스터 + 큰 인용문 + 리뷰 텍스트를 보여줌.

## 🎨 페이지 구조

### 현재 구조 (기존 - 리스트)
```
┌────────────────────────┐
│ [80px 포스터] 리뷰내용 │
│ 사용자명, 시간          │
├────────────────────────┤
│ [80px 포스터] 리뷰내용 │
│ ...                    │
└────────────────────────┘
```

### 신규 구조 (에디토리얼)
```
┌────────────────────────┐
│ 리뷰 제목 (영화명)     │
│ 사용자명 · 시간        │
├────────────────────────┤
│   [포스터]   │ 큰 인용 │
│  (160px)     │ 문 박스 │
│              │ (회색)  │
│              │ ...     │
├────────────────────────┤
│ 리뷰 전체 텍스트...    │
│                        │
│ ❤️ 123  💬 45          │
├────────────────────────┤
│ [다음 리뷰]            │
└────────────────────────┘
```

## 🧩 컴포넌트 상세

### 1. EditorialFeedItem (컴포넌트)
**책임**: 에디토리얼 스타일의 리뷰 아이템 렌더링

**구조**:
```
┌────────────────────────────────────┐
│ [EditorialFeedHeader]              │
│   영화명 / 사용자명 · 2일전        │
├────────────────────────────────────┤
│ [EditorialFeedContent]             │
│   [포스터] + [인용문박스]          │
│   + 리뷰 텍스트                    │
├────────────────────────────────────┤
│ [EditorialFeedActions]             │
│   ❤️ 123  💬 45                    │
└────────────────────────────────────┘
```

**Props**:
```ts
interface EditorialFeedItemProps {
  review: {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    movieId: string;
    movieTitle: string;
    moviePoster: string;
    text: string;
    highlightText?: string;  // 인용문
    likeCount: number;
    commentCount: number;
    createdAt: Date;
  };
  onLike: (reviewId: string) => void;
  onComment: (reviewId: string) => void;
  isLiked: boolean;
}
```

---

### 2. EditorialFeedHeader (컴포넌트)
**책임**: 리뷰 헤더 (영화명, 사용자, 시간)

**UI**:
```
┌────────────────────────┐
│ 영화명                 │  ← 18px, bold
│ 사용자명 · 2일전       │  ← 14px, gray
└────────────────────────┘
```

**스타일**:
```ts
{
  padding: '16px',
  
  movieTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#000',
    marginBottom: '4px'
  },
  
  metadata: {
    fontSize: '14px',
    color: '#999'
  }
}
```

---

### 3. EditorialFeedContent (컴포넌트)
**책임**: 포스터 + 인용문 + 리뷰 텍스트

**UI**:
```
┌──────────────────────────────────┐
│ [160px 포스터] │ [큰 인용문박스] │
│  (그림자)       │ (회색 배경)     │
│                 │ "인상깊은 장면" │
│                 │ 또는 리뷰의 일부│
│                 │ ...            │
├──────────────────────────────────┤
│ 리뷰 전체 텍스트...               │
│                                  │
│ 줄단위로 띄어쓰기, 읽기 편함     │
└──────────────────────────────────┘
```

**레이아웃 (Mobile)**:
```
상단: 포스터 (160px, 중앙)
 + 인용문 박스 (회색, 따라옴)
하단: 리뷰 텍스트 전체
```

**레이아웃 (Desktop)**:
```
좌측: 포스터 (200px)
우측: 인용문 박스 + 리뷰 텍스트 시작
```

**Props**:
```ts
interface EditorialFeedContentProps {
  posterUrl: string;
  reviewText: string;
  highlightText?: string;
  isDesktop: boolean;
}
```

**포스터 스타일**:
```ts
{
  width: '160px',
  aspectRatio: '9/16',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  objectFit: 'cover'
}
```

**인용문 박스 스타일**:
```ts
{
  background: '#f5f5f5',
  borderLeft: '4px solid #999',
  padding: '12px 16px',
  borderRadius: '4px',
  fontStyle: 'italic',
  color: '#333',
  fontSize: '14px',
  lineHeight: '1.6',
  
  marginTop: '12px',  // 모바일
  marginLeft: '12px'  // 데스크톱
}
```

**리뷰 텍스트 스타일**:
```ts
{
  fontSize: '14px',
  color: '#333',
  lineHeight: '1.8',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  marginTop: '16px'
}
```

---

### 4. EditorialFeedActions (컴포넌트)
**책임**: 좋아요 + 댓글 버튼

**UI**:
```
┌────────────────────────┐
│ ❤️ 123    💬 45       │
└────────────────────────┘
```

**스타일**:
```ts
{
  display: 'flex',
  gap: '24px',
  padding: '12px 16px',
  borderTop: '1px #eee',
  
  action: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#666'
  },
  
  'action:hover': {
    color: '#000'
  },
  
  'action.liked': {
    color: '#ff4458'
  }
}
```

**상호작용**:
- 좋아요: 클릭 시 토글, 하트 아이콘 색상 변경
- 댓글: 클릭 시 댓글 입력 또는 댓글 페이지로 이동

---

### 5. FeedViewToggle (컴포넌트)
**책임**: 리스트 ↔ 에디토리얼 뷰 전환 (선택)

**UI**:
```
┌────────────────────────┐
│ [📋 리스트] [📖 에디토]│
└────────────────────────┘
```

---

## 📱 반응형

| 화면 | 포스터 | 인용문 박스 |
|------|--------|-----------|
| Mobile (375px) | 160px, 중앙 | 아래 배치, 전체 너비 |
| Tablet (768px) | 180px, 좌측 | 우측 배치, 좌측 옆 |
| Desktop (1280px) | 200px, 좌측 | 우측 배치, 좌측 옆 |

---

## 🔧 기술 스펙

**파일 위치**:
```
app/
├── components/
│   ├── feed/
│   │   ├── EditorialFeedItem.tsx
│   │   ├── EditorialFeedHeader.tsx
│   │   ├── EditorialFeedContent.tsx
│   │   ├── EditorialFeedActions.tsx
│   │   └── FeedViewToggle.tsx (선택)
```

**API 연결**:
- 피드 조회: `getFeed()` (기존 재사용)
- 좋아요: `likeReview(reviewId)`
- 댓글: `commentReview(reviewId)`

**상태 관리**:
```ts
const [feedView, setFeedView] = useState<'list' | 'editorial'>('editorial');
const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set());
```

**라이브러리**:
- Framer Motion: 좋아요 애니메이션
- react-markdown: 리뷰 텍스트 포매팅 (선택)

---

## ✅ 승인 기준 (AC)

- [ ] EditorialFeedItem 구현
- [ ] EditorialFeedHeader (영화명 + 사용자 + 시간)
- [ ] EditorialFeedContent (포스터 + 인용문 박스 + 텍스트)
- [ ] 포스터 이미지 최적화
- [ ] 인용문 박스 스타일 (회색 배경, 좌측 보더)
- [ ] 리뷰 텍스트 자간/행간 최적화 (1.8)
- [ ] EditorialFeedActions (좋아요 + 댓글)
- [ ] 좋아요 토글 애니메이션
- [ ] 모바일/태블릿/데스크톱 반응형 테스트
- [ ] 긴 텍스트 처리 (줄바꿈 유지)
- [ ] 에디토리얼 뷰와 리스트 뷰 전환 (선택)

---

## 🎬 v0.dev 프롬프트

```
Create an editorial/magazine-style feed for displaying movie reviews.

EditorialFeedItem (vertical card layout):

Header:
- Movie title (18px, bold)
- User name · 2days ago (14px, gray)
- Padding: 16px

Content:
- Mobile: poster image (160px, centered, rounded, shadow) above, then highlight/quote box below
- Desktop: poster (200px) on left, quote box + review text on right

Poster:
- Aspect ratio 9:16
- Border-radius: 8px
- Box-shadow: 0 4px 12px rgba(0,0,0,0.15)

Quote/Highlight Box:
- Background: #f5f5f5
- Border-left: 4px solid #999
- Padding: 12px 16px
- Border-radius: 4px
- Font-style: italic
- Color: #333
- Font-size: 14px
- Line-height: 1.6

Review Text:
- Full review below quote
- Font-size: 14px
- Color: #333
- Line-height: 1.8
- Preserve whitespace (pre-wrap)
- Padding: 16px

Actions (bottom):
- Heart icon + like count (left), comment icon + count (right)
- Gap: 24px
- Hover: dark gray color
- Liked state: red heart (#ff4458)
- Padding: 12px 16px
- Border-top: 1px #eee

Overall:
- Smooth, magazine-like presentation
- High contrast between poster and quote box
- Easy readability for long reviews
```

