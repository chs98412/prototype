# logged. — Development Guidelines

**MANDATORY**: All frontend/backend development must follow the rules in `DEVELOPMENT.md` and `BACKEND_DEVELOPMENT.md`. These are not guidelines—they are requirements.

## Quick Reference

- **Framework**: Expo (React Native Web) for frontend, Go + Gin for backend
- **Deployments**: Web to Vercel, Mobile via EAS Build, Backend to Fly.io
- **Architecture**: API-first (frontend never calls Supabase directly)
- **Auth**: OAuth flow via backend endpoints (`/v1/auth/google`)
- **Conventions**: See `DEVELOPMENT.md` (FE) and `BACKEND_DEVELOPMENT.md` (BE)

---

## Work Log Rules (MANDATORY)

작업을 수행할 때마다 반드시 작업 기록 파일을 생성한다.

### 폴더 구조
```
work-logs/
└── YYYY-MM-DD/
    ├── fe/
    │   └── [screen-name].md      # 화면 단위
    └── be/
        └── [api-name].md         # API 단위
```

- 날짜 폴더는 작업 당일 날짜로 생성
- fe 작업은 화면 단위로 파일 생성 (한 작업에 여러 화면이 포함되면 화면마다 각각 파일 생성)
- be 작업은 API 단위로 파일 생성
- 같은 화면/API를 여러 번 수정하면 파일이 여러 개 생성될 수 있음 (덮어쓰지 않음)
- 파일명이 중복되면 `-2`, `-3` 순서로 suffix 추가

### 파일 형식
```markdown
# [자연어로 어떤 작업인지 한 줄 설명 — 클래스명/파일명 없이]

[자세한 설명 — 어떤 파일을 어떻게 수정/생성했는지, 클래스명·파일명 포함]
```

예시:
```markdown
# 피드 화면을 에디토리얼 매거진 스타일로 전면 재설계

Noto Serif KR 폰트와 올리브 액센트(#6a7040)를 적용하여 app/(tabs)/index.tsx를
새로 작성했습니다. DayDivider, ReviewCard 하위 컴포넌트를 분리하고, 필터 칩과
날짜 구분선을 추가했습니다.

- `app/(tabs)/index.tsx` 재작성
- `components/cards/ReviewCard.tsx` 신규 생성
- `lib/design.ts` Colors, Font 토큰 정의
```

---

## Framework & Deployment

### Frontend
- **Framework**: Expo (React Native Web) — single codebase builds to web + mobile
- **Web**: `npx expo export --platform web` → deploy to Vercel
- **Mobile**: EAS Build → iOS/Android native apps
- **Development**: `cd apps/mobile && npm run web` (local testing)

### Backend
- **Framework**: Go + Gin
- **Deployment**: Fly.io (`flyctl deploy --app logged-backend`)
- **Local**: `cd apps/backend && go run main.go`

---

## Architecture Rules (MANDATORY)

**All rules in DEVELOPMENT.md and BACKEND_DEVELOPMENT.md MUST be followed.**

### API-First (CRITICAL)
- ❌ Frontend NEVER calls Supabase directly
- ✅ Frontend only calls backend `/v1/*` endpoints
- ✅ Backend handles all database/auth/external API operations
- ✅ Frontend stores JWT tokens in `localStorage`

### Authentication Flow
```
Frontend                Backend                 Supabase
   |                      |                        |
   +→ POST /v1/auth/google→|                        |
   |                      +→ OAuth Request -----→  |
   |                      |←── JWT back ──────+    |
   |←── JWT ──────────────+                        |
   |    (localStorage)                             |
   |                                                |
   +→ GET /v1/profile ────→|                        |
   |  (w/ Authorization)   +→ Query ────────→     |
   |←── Profile Data ──────+                       |
```

### Token Management
- Store JWT in `localStorage` (client-side only)
- Inject `Authorization: Bearer <token>` automatically via `lib/api-client.ts`
- Use `lib/auth.ts` for token operations (save/retrieve/clear)

---

## Environment Variables

### Frontend (Vercel)
```
EXPO_PUBLIC_API_URL=https://logged-backend.fly.dev
```

### Backend (Fly.io)
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx
SUPABASE_JWT_SECRET=xxxxx
DATABASE_URL=xxxxx
TMDB_API_KEY=xxxxx
PORT=8080
ALLOWED_ORIGINS=https://logged-web.vercel.app,logged://
```

---

## Project Structure

**Frontend**: See `DEVELOPMENT.md` → "Frontend Code Structure"
- Folder organization (app/, components/, lib/, hooks/)
- File internal order (imports → types → exports → subcomponents → styles)
- Expandability for future content types (books, music, performances)

**Backend**: See `BACKEND_DEVELOPMENT.md`

---

## Key Development Rules

1. **One task at a time** — Don't start a new feature until the current one is pushed
2. **Type everything** — `strict: true` in TypeScript, no `any` types
3. **API-First mentality** — All data flows through `/v1/*` endpoints
4. **Test before committing** — Run type-check, build, tests locally
5. **Commit message format**:
   ```
   type: Short description
   
   Detailed explanation of why this change was made.
   
   https://claude.ai/code/session_<id>
   ```
   Types: `feat`, `fix`, `refactor`, `chore`, `docs`

6. **Create work logs** — Every task creates a file in `work-logs/YYYY-MM-DD/{fe|be}/[name].md`

---

## References

- **Frontend conventions?** → `DEVELOPMENT.md`
- **Backend conventions?** → `BACKEND_DEVELOPMENT.md`
- **API endpoints?** → `apps/backend/handler/` directory
- **Content type expansion?** → `DEVELOPMENT.md` "Frontend Code Structure" (ContentType enum pattern)
- **Work log format?** → Top of this file "Work Log Rules"
