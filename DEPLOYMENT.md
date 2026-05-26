# 배포 및 설정 가이드

## 🚀 CI/CD 자동 배포

### GitHub Actions 설정
- **파일**: `.github/workflows/deploy.yml`
- **트리거**: `master` 브랜치에 푸시 시 자동 배포
- **필수**: Fly.io API 토큰을 GitHub Secrets에 `FLY_API_TOKEN`으로 설정

### 배포 플로우
```
git push origin master → GitHub Actions 실행 → Fly.io 배포 (2-3분)
```

---

## 🔧 Fly.io 배포 설정

### fly.toml 주요 설정
```toml
app = "logged-backend"
primary_region = "nrt"

[build]
  dockerfile = "Dockerfile"  # ⚠️ 반드시 명시해야 함

[http_service]
  internal_port = 8080
  force_https = true
```

**중요**: `[build]` 섹션에 `dockerfile = "Dockerfile"`이 반드시 있어야 함. 비어있으면 빌드 실패!

### 환경변수 설정
Fly.io Secrets (이미 설정됨):
- `DATABASE_URL` - Supabase 연결 문자열 (우선)
- `JWT_SECRET` - JWT 서명 키
- `SUPABASE_URL` - Supabase URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase 서비스 역할 키
- 기타: SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET 등

**주의**: 코드는 먼저 `DATABASE_URL` 환경변수를 찾고, 없으면 개별 변수 사용

---

## 🗄️ 데이터베이스 연결

### 현재 방식
```go
// backend/main.go
dsn := os.Getenv("DATABASE_URL")  // Fly.io 환경에서 사용
if dsn == "" {
    // 로컬 개발 환경 폴백
    dsn = fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=require",
        os.Getenv("DB_HOST"),
        os.Getenv("DB_USER"),
        os.Getenv("DB_PASSWORD"),
        os.Getenv("DB_NAME"),
        os.Getenv("DB_PORT"),
    )
}
```

**DATABASE_URL 형식** (Supabase):
```
postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
```

### 로컬 개발 환경 설정
`.env` 파일 또는 환경변수:
```bash
DB_HOST=your-supabase.supabase.co
DB_USER=postgres
DB_PASSWORD=your-password
DB_NAME=postgres
DB_PORT=5432
```

---

## 📚 API 문서

### Swagger/OpenAPI 엔드포인트
- **URL**: `https://logged-backend.fly.dev/docs`
- **OpenAPI Spec**: `https://logged-backend.fly.dev/api/openapi.json`
- **구현**: 
  - `backend/handler/docs.go` - Swagger UI HTML (인라인 임베드)
  - `backend/handler/openapi.go` - OpenAPI 스펙 생성

**중요**: HTML을 `templates/` 폴더에서 로드하지 말고, 핸들러에 인라인으로 임베드할 것. Docker 빌드 시 templates 폴더가 포함되지 않을 수 있음!

---

## 📊 API 성능 로깅

### 요청/응답 시간 로깅
- **파일**: `backend/middleware/request_logger.go`
- **로그 형식**: `[API] GET /v1/records - 200 (125ms)`
- **위치**: 모든 API 요청에 자동 적용
- **백엔드 로그만**: FE에서 불필요한 로깅은 제거

---

## 🎨 로딩 UX 개선 사항

### Phase 1: 스켈레톤 로더
- **파일**: `frontend/components/ui/Loading.tsx`
- **컴포넌트**: 
  - `LoadingSpinner` - 기본 스피너
  - `AlbumDetailSkeleton` - 음반 상세 페이지용
  - `TrackDetailSkeleton` - 트랙 상세 페이지용

### Phase 2: 로딩 스피너 통일화
- 8개 컴포넌트에서 일관된 로딩 UI 사용
- 색상, 크기, 메시지 통일

### Phase 3: API 병렬 로드
```js
// Before: 순차 호출
const profile = await fetch(...);
const records = await fetch(...);

// After: 병렬 호출 (최대 50% 성능 개선)
const [profileRes, recordsRes] = await Promise.all([
    fetch(...),
    fetch(...)
]);
```

---

## ⚠️ 주의사항 & 트러블슈팅

### 1. 배포 실패 - "Host not in allowlist"
**원인**: 환경변수 미설정
**해결**: Fly.io Secrets에서 DATABASE_URL 확인

### 2. 배포 실패 - Docker 빌드 오류
**원인**: fly.toml의 `[build]` 섹션이 비어있음
**해결**: `[build]` 섹션에 `dockerfile = "Dockerfile"` 추가

### 3. Swagger 문서 404 오류
**원인**: templates 폴더가 Docker 이미지에 포함되지 않음
**해결**: HTML을 핸들러에 인라인으로 임베드 (현재 구현)

### 4. 로컬 개발에서 DB 연결 오류
**확인**: `.env` 파일에 DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT 설정
**또는**: DATABASE_URL 환경변수 설정

---

## 🔄 배포 체크리스트

배포 전 확인사항:
- [ ] `fly.toml`의 `[build]` 섹션에 `dockerfile = "Dockerfile"` 있는가?
- [ ] GitHub Secrets에 `FLY_API_TOKEN` 설정했는가?
- [ ] Fly.io에서 `DATABASE_URL` 시크릿 설정했는가?
- [ ] 로컬에서 빌드 성공했는가? (`go build`)
- [ ] 프론트엔드 빌드 성공했는가? (`npm run build`)

배포 후 확인사항:
- [ ] `https://logged-backend.fly.dev/health` 접근 가능?
- [ ] `https://logged-backend.fly.dev/docs` Swagger UI 로드?
- [ ] API 로그가 Fly.io 로그에 보이는가?
- [ ] 프론트엔드에서 API 호출 성공?

---

## 📝 최근 수정 이력

### 2026-05-26
1. **API 응답 시간 로깅** 추가
   - `backend/middleware/request_logger.go` 생성
   - `main.go`에 미들웨어 적용

2. **Swagger 문서화** 추가
   - `backend/handler/docs.go` - HTML 인라인 임베드
   - `backend/handler/openapi.go` - OpenAPI 스펙
   - `/docs` 및 `/api/openapi.json` 엔드포인트

3. **FE 로깅 제거**
   - `frontend/app/home/page.tsx`에서 performance.now() 제거

4. **fly.toml 수정**
   - `[build]` 섹션에 `dockerfile = "Dockerfile"` 명시

5. **DATABASE_URL 환경변수 사용**
   - `backend/main.go`에서 DATABASE_URL 우선 사용
   - 로컬 개발은 개별 env vars로 폴백

---

## 🆘 도움이 필요할 때

Fly.io 로그 확인:
```bash
flyctl logs -a logged-backend
```

로컬 테스트:
```bash
PORT=8080 ./backend/app
# 또는
cd frontend && npm run dev
```

Fly.io 대시보드:
- URL: https://fly.io
- App: logged-backend
- Secrets 탭에서 환경변수 확인
