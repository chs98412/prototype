# 🏗 Architecture 시스템 아키텍처

> 전체 기술 스택과 시스템 설계를 정리합니다.

---

## 📊 기술 스택

### Frontend

| 항목 | 기술 |
|------|------|
| Framework | Next.js 15+ (React 19) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | React Hooks + Context |
| Animation | Framer Motion |
| HTTP Client | Fetch API / axios |

### Backend

| 항목 | 기술 |
|------|------|
| API Server | Go Gin (REST) |
| Database | PostgreSQL (Supabase) |
| Auth | Supabase Auth (OAuth) |
| RPC | PostgreSQL Functions |
| Real-time | Supabase Realtime |
| Storage | Supabase Storage |

### Deployment

| 항목 | 기술 |
|------|------|
| Frontend | Vercel |
| Backend | Fly.io |
| Database | Supabase |
| CDN | Vercel Edge Network |

### External APIs

| 서비스 | 용도 |
|--------|------|
| TMDB API | 영화/드라마 데이터 |
| Google OAuth | 소셜 로그인 |
| GitHub OAuth | 소셜 로그인 |

---

## 🗂 폴더 구조

```
logged-prototype/
├── frontend/                 # Next.js 프로젝트
│   ├── app/                 # 페이지 & 라우팅
│   │   ├── search/
│   │   ├── movie/[id]/
│   │   ├── feed/
│   │   ├── profile/
│   │   ├── notifications/
│   │   └── record/
│   ├── components/          # React 컴포넌트
│   │   ├── content/        # 콘텐츠 관련
│   │   ├── feed/           # 피드 관련
│   │   ├── notifications/  # 알림
│   │   ├── search/         # 검색
│   │   ├── profile/        # 프로필
│   │   └── ...
│   ├── lib/                # 유틸리티
│   │   ├── supabase/      # Supabase 클라이언트
│   │   ├── tmdb.ts        # TMDB API
│   │   └── ...
│   └── package.json
│
├── backend/                 # Go 백엔드
│   ├── main.go
│   ├── handlers/           # HTTP 핸들러
│   ├── middleware/         # JWT 등
│   └── ...
│
├── supabase/               # DB 마이그레이션
│   └── migrations/
│       ├── 001_init.sql
│       ├── 002_auth.sql
│       └── ...
│
├── docs/                   # 문서
│   ├── prd.md             # 기능 명세
│   ├── architecture.md     # 아키텍처
│   ├── stories/           # 스토리
│   ├── design-specs/      # 디자인 스펙
│   └── obsidian/          # Obsidian 관리
│
├── fly.toml               # Fly.io 설정
├── vercel.json            # Vercel 설정
└── ...
```

---

## 🔄 데이터 흐름

```
사용자 UI (Next.js)
    ↓
API Call (Fetch/Axios)
    ↓
Supabase/Go Backend
    ↓
PostgreSQL Database
    ↓
응답 & 캐싱
    ↓
Real-time Update (Realtime)
```

---

## 🗄 데이터베이스 테이블

### 인증 & 프로필
- `auth.users` - 사용자 (Supabase 제공)
- `user_profiles` - 프로필 정보
- `user_follows` - 팔로우 관계

### 콘텐츠 & 활동
- `watch_history` - 시청 기록
- `reviews` - 리뷰
- `ratings` - 별점
- `user_stats` - 사용자 통계
- `user_goals` - 연간 목표
- `notifications` - 알림

### 게임화
- `challenges` - 도전과제
- `challenge_progress` - 도전과제 진척도

### 메타데이터
- `genres` - 장르 (캐시)
- `people` - 배우/감독 (캐시)

---

## 🔌 주요 RPC 함수

### 피드 & 알림

```sql
get_friend_feed(user_id) → activities
get_notifications(user_id) → notifications
```

### 통계

```sql
get_activity_heatmap(user_id) → heatmap
get_genre_ratings(user_id) → ratings
get_taste_match(user_id, other_user_id) → score
```

### 도전과제

```sql
get_challenge_progress(user_id) → progress
update_challenge_status(user_id) → void
```

---

## 🔐 보안

### 인증
- OAuth 2.0 (Google, GitHub)
- JWT 토큰
- HttpOnly 쿠키

### 데이터베이스
- Row Level Security (RLS) 활성화
- 권한 기반 접근 제어 (Role-based)

### API
- CORS 설정
- Rate limiting
- Input validation

---

## 🚀 배포 파이프라인

```
Git Commit
    ↓
GitHub Actions (선택)
    ↓
Frontend: Vercel (자동 배포)
    ↓
Backend: Fly.io (수동 또는 자동)
    ↓
Production
```

---

## 📈 성능 최적화

### Frontend
- ISR (Incremental Static Regeneration)
- Image Optimization (Next.js)
- Code Splitting
- Lazy Loading

### Backend
- Query Optimization (Indexes)
- Caching (Redis 또는 메모리)
- Connection Pooling

### Database
- 인덱스 설정
- 쿼리 실행 계획 분석

---

## 🔗 원본 문서

- **[Full Architecture](../architecture.md)** - 상세 설계
- **[PRD](../prd.md)** - 기능 명세
