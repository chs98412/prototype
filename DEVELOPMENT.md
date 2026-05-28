# Development Rules & Conventions

This document outlines architectural decisions, coding conventions, and development practices for this project. **All Claude sessions automatically apply these rules.**

---

## Frontend Code Structure

### 폴더 구조
```
apps/mobile/src/
├── app/                          # 화면 (Expo Router 파일 기반 라우팅)
│   ├── (tabs)/
│   │   ├── _layout.tsx           # 탭바 설정
│   │   ├── index.tsx             # 피드
│   │   ├── search.tsx            # 검색
│   │   └── profile.tsx           # 프로필
│   ├── _layout.tsx               # 루트 레이아웃 (폰트 로딩, 인증 체크)
│   ├── login.tsx
│   ├── auth/callback.tsx
│   └── content/[type]/[id].tsx   # 콘텐츠 상세 (movie·book·music·performance 공통)
│
├── components/
│   ├── ui/                       # 디자인 시스템 기본 요소 (Pill, Poster, Avatar, StarRow 등)
│   └── cards/                    # 피드 카드 (EssayCard, RatingCard, LogCard 등)
│
├── lib/
│   ├── api/                      # API 호출 (도메인별)
│   │   ├── client.ts             # 베이스 fetch + 인증 헤더
│   │   ├── reviews.ts
│   │   ├── records.ts
│   │   └── profile.ts
│   ├── types/                    # 타입 정의 (도메인별)
│   │   ├── content.ts            # ContentType = 'movie' | 'book' | 'music' | 'performance'
│   │   ├── review.ts
│   │   ├── record.ts
│   │   └── profile.ts
│   ├── auth.ts                   # 토큰 저장/불러오기/삭제
│   ├── config.ts                 # API_URL 등 환경 설정
│   └── design.ts                 # 색상·폰트 토큰 (Colors, Font)
│
└── hooks/                        # 커스텀 훅
    ├── useProfile.ts
    └── useReviews.ts
```

### 파일 내부 순서 (모든 파일 통일)
```
1. import
2. type (이 파일 내부에서만 쓰는 타입)
3. default export (메인 컴포넌트 또는 함수)
4. 하위 컴포넌트 (이 파일에서만 쓰이는 것)
5. const styles = StyleSheet.create(...)
```

### 확장 가능성
콘텐츠 타입(영화·책·공연·음악)이 추가될 경우를 위해:
- 라우팅은 `content/[type]/[id]` 구조로 공통화
- `ContentType` 타입만 추가하면 기존 카드 컴포넌트는 변경 불필요
- 콘텐츠 소스 API는 `lib/api/` 하위에 도메인별로 추가

---

## Architecture Rules

### 1. API-First Architecture
- **Frontend NEVER directly queries the database** (Supabase removed)
- **All data access goes through backend API endpoints** (`/v1/*`)
- Frontend communicates exclusively via REST API with HttpOnly cookies for JWT tokens
- Backend API layer is the single source of truth

### 2. Domain-Based API Organization
API functions organized by domain, not by HTTP method:

```
lib/api/
├─ profile.ts          # User profile operations
├─ records.ts          # Viewing history & ratings
├─ reviews.ts          # Review CRUD & likes
├─ social.ts           # Follow, feed, notifications
├─ challenges.ts       # Goals & challenges
├─ analytics.ts        # Heatmap, genre stats, taste match
├─ client.ts           # Base apiCall() & clientApiCall() functions
└─ errors.ts           # Custom error classes
```

Each domain file exports typed API functions. Central `lib/api/index.ts` re-exports all functions.

### 3. Type Definitions by Domain
Strict TypeScript types for every API request/response:

```
lib/types/
├─ profile.ts
├─ records.ts
├─ reviews.ts
├─ social.ts
├─ challenges.ts
├─ analytics.ts
├─ notification.ts
└─ errors.ts
```

No `any` types. Request/response types must be explicit interfaces.

### 4. Server Components vs Client Components

**Server Components (default):**
- Direct database/external API calls allowed
- Can use server-only code (credentials, private keys)
- Must use `async` and await data before rendering
- Use `getCurrentUser()` from `lib/auth/getCurrentUser.ts` for auth context

**Client Components (`'use client'`):**
- API calls only via `clientApiCall()` with existing JWT token
- State management (useState, useEffect)
- Event handlers (onClick, onChange)
- Must explicitly import types from `lib/types/*`

---

## Centralized Configuration

All environment-dependent values in `lib/config.ts`:

```typescript
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
export const TMDB_BASE = 'https://api.themoviedb.org/3'
export const IMG_BASE = 'https://image.tmdb.org/t/p'
```

**Never hardcode URLs or API endpoints in components.**

---

## TypeScript Rules

### Strict Mode Always
- `strict: true` in tsconfig.json
- All function parameters and return types must be explicit
- No implicit `any`

### Type Definition Checklist
For each API endpoint, create matching types:
```typescript
// Request
export type CreateReviewRequest = {
  tmdbId: number
  content: string
  spoiler: boolean
}

// Response (must include all fields returned by backend)
export type Review = {
  id: string
  user_id: string
  tmdb_id: number
  content: string
  spoiler: boolean
  like_count: number
  created_at: string
  updated_at: string
  user: {
    id: string
    display_name?: string
    avatar_url?: string
  }
}
```

### Naming Conventions
- **Database columns**: snake_case (user_id, created_at)
- **TypeScript fields**: snake_case (match database)
- **React components**: PascalCase
- **Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE

---

## Error Handling

### Custom Error Classes
Use `lib/api/errors.ts`:

```typescript
import { ApiError, ValidationError, NotFoundError } from '@/lib/api/errors'

try {
  const data = await fetchSomething()
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation error
  } else if (error instanceof NotFoundError) {
    // Handle 404
  } else if (error instanceof ApiError) {
    // Handle other API errors
  } else {
    // Handle unknown error
  }
}
```

### Error Logging
Use `lib/logger.ts`:
```typescript
logger.error('Operation failed', error, { userId, context: 'data' })
logger.warn('Slow API response', { duration: '2000ms' })
```

---

## Logging & Performance Monitoring

### Logger Integration
- **Client-side errors** → collected via Performance Monitor → sent to `/api/logs` → stored/forwarded to external service
- **Server-side errors** → logged directly → external service
- Development: all logs sent; Production: errors/warnings only

### Performance Metrics
- API call duration tracked automatically
- Page render time logged via `logPageRender()`
- Custom metrics via `logPerformanceMetric()`

### External Services
External API calls (Sentry, LogRocket, etc.) must route through **server endpoint `/api/logs`**, NOT from client:

```typescript
// ✅ CORRECT: Server-side
async function sendToExternalService(log: LogEntry) {
  await fetch('https://sentry.io/api/...', {
    headers: { 'X-Sentry-Auth': `Sentry sentry_key=${process.env.SENTRY_KEY}` },
  })
}

// ❌ WRONG: Never from client
fetch('https://sentry.io/...', { /* API key exposed */ })
```

---

## Commit & Branch Rules

### Commit Message Format
```
<type>: <description>

<optional detailed explanation>

https://claude.ai/code/session_<id>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring (no behavior change)
- `chore`: Build, deps, config
- `docs`: Documentation

### Examples
✅ Good:
```
fix: Resolve FeedItem type mismatch in FriendFeed component

lib/types/social.ts now exports FeedItem with flattened structure
to match backend API response. FriendFeed imports type instead of
defining locally.
```

❌ Bad:
```
fixed stuff
update
changes
```

### Branch Naming
- Feature: `feat/description`
- Bugfix: `fix/description`
- Development work: assigned via Git workflow

### Push Rules
- Always use `-u origin <branch>` for first push
- Retry on network failure: wait 2s, 4s, 8s, 16s
- Never force push to master/main

---

## File Organization

### Frontend Structure
```
frontend/
├─ app/                      # Next.js app router
│  ├─ api/                   # Route handlers (/api/*)
│  │  └─ logs/route.ts       # Log collection endpoint
│  ├─ actions/               # Server Actions (mutations)
│  └─ [routes]/              # Page routes
├─ components/
│  ├─ feed/                  # Feature: Friend feed
│  ├─ content/               # Feature: Content display
│  ├─ providers/             # App-level providers (PerformanceMonitor, etc.)
│  └─ [feature]/             # Organized by feature
├─ lib/
│  ├─ api/                   # API functions by domain
│  ├─ types/                 # TypeScript types by domain
│  ├─ auth/                  # Authentication utilities
│  ├─ config.ts              # Centralized configuration
│  ├─ logger.ts              # Logging system
│  └─ performance.ts         # Performance utilities
└─ proxy.ts                  # Middleware for request interception
```

### Backend Structure (Go)
```
backend/
├─ handler/                  # HTTP handlers organized by domain
│  ├─ social.go
│  ├─ profile.go
│  └─ ...
├─ pkg/                      # Internal packages
├─ main.go                   # App initialization
└─ go.mod                    # Dependencies
```

---

## Code Quality Standards

### No Half-Finished Code
- Don't add error handling for impossible scenarios
- Trust internal code and framework guarantees
- Validate at system boundaries (user input, external APIs only)
- No feature flags for incomplete features

### Comments
- **Default**: No comments (well-named code is self-documenting)
- **Exception**: Only add comments for the WHY:
  - Hidden constraints
  - Subtle invariants
  - Workarounds for specific bugs
  - Non-obvious behavior

```typescript
// ✅ Good comment
// Retry with backoff for transient network errors
// (not for auth errors, which fail fast)
if (error instanceof NetworkError) {
  return retry(fn, backoffDelay)
}

// ❌ Bad comment
// Get the user ID from props
const userId = props.userId
```

### Imports & Exports
- Prefer specific imports: `import { getReviews } from '@/lib/api/reviews'`
- Export types with `export type` (not `export interface`)
- Centralize re-exports in `index.ts` for public APIs

---

## Database & Backend Rules

### SQL Queries
- Use ORM or parameterized queries (NOT string interpolation)
- Parameterized: `Query(sql, args...)`
- ❌ Never: `fmt.Sprintf("SELECT * FROM users WHERE id = '%s'", id)`

### API Response Format
All responses follow standard envelope:
```typescript
{
  data: T | null
  error?: string
  count?: number
}
```

### Status Codes
- 200: Success
- 201: Created
- 400: Validation error
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 500: Server error

---

## Testing & QA

### Test Coverage
- All critical paths tested
- Integration tests for API endpoints
- Component tests for UI behavior
- Run tests before committing

### Pre-commit Checklist
- [ ] TypeScript passes (`npm run type-check`)
- [ ] Build succeeds (`npm run build`)
- [ ] Tests pass (`npm run test`)
- [ ] No console.error or warnings
- [ ] Commit message follows format

---

## Performance Best Practices

### Next.js Optimization
- Use `next/image` for all images (automatic optimization)
- Implement ISR with `revalidate` for static pages
- Server Components by default (more efficient)
- Lazy load Client Components with `dynamic()`

### Database Optimization
- Use indexes on frequently queried columns
- Implement pagination (don't fetch all records)
- Cache repeated queries with appropriate TTL

### Monitoring
- Track API response times in logs
- Monitor page load times per route
- Alert on errors (production: errors/warnings only)

---

## Security

### Credentials & Secrets
- **Never** commit `.env.local` or API keys
- Use environment variables for all secrets
- Server-side API keys only (not exposed to client)
- HttpOnly cookies for JWT tokens (XSS protection)

### Input Validation
- Validate all user input (forms, URL params, API requests)
- Use TypeScript types as first line of defense
- Sanitize strings before DB queries
- CORS headers configured on backend

---

## Documentation

### Code Documentation
- README.md: Project overview, setup instructions
- ARCHITECTURE.md: System design, data flow diagrams
- DEVELOPMENT.md: This file (development rules)
- Inline comments: Only for non-obvious logic

### Commit History
- Commit messages are part of documentation
- Use them to explain design decisions
- Help future developers understand why code was written

---

## Continuous Improvement

This document evolves as the project grows. When adding new rules:
1. Document in DEVELOPMENT.md
2. Update CLAUDE.md to reference DEVELOPMENT.md
3. All future sessions automatically apply the rules

**Questions about a rule?** Check this file first — it's always current.
