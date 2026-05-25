# Backend Development Rules & Conventions

Backend architecture rules for Go services. Apply these alongside main DEVELOPMENT.md.

---

## Architecture Overview

```
Presentation Layer (HTTP)
    ↓ (Request/Response DTO)
Service Layer (Business Logic)
    ↓ (Domain Entity)
Domain Layer (Entity, Repository Interface, Domain Service)
    ↓ (Repository Implementation)
Infrastructure Layer (Database, External Services)
```

### Layer Responsibilities

**Presentation Layer**
- HTTP Handlers only
- Request/Response DTO marshaling
- No business logic
- Status codes & error responses

**Service Layer**
- Business logic implementation
- Orchestrates domain & repositories
- Defines interfaces (Repository, External Services)
- Converts Entity ↔ DTO at boundaries

**Domain Layer**
- Core business logic (Domain Service)
- Entity definitions
- Repository interfaces (no implementation)
- Aggregate Root pattern for multi-repository operations

**Infrastructure Layer**
- Repository implementations (database queries)
- External service client implementations (Spotify, iTunes)
- Database connection management
- ORM integration

---

## File Organization

```
backend/
├─ main.go                              # Server setup, DI wiring
├─ middleware/
│  └─ auth.go                          # JWT validation
├─ handler/                            # Presentation Layer
│  ├─ profile_handler.go               # HTTP handlers only
│  ├─ request/                         # Request DTOs
│  │  └─ profile_request.go
│  └─ response/                        # Response DTOs
│     └─ profile_response.go
├─ service/                            # Service Layer
│  ├─ profile_service.go               # Interface + Implementation
│  ├─ music_service.go                 # Multi-repo orchestration
│  └─ interfaces.go                    # Repository & External Service interfaces
├─ domain/                             # Domain Layer
│  ├─ entity/
│  │  └─ profile.go                    # Entity (not exported outside domain)
│  ├─ repository/
│  │  └─ profile_repository.go         # Interface only
│  └─ service/
│     └─ music_domain_service.go       # Domain Service (Aggregate logic)
├─ infrastructure/                     # Infrastructure Layer
│  ├─ repository/
│  │  └─ profile_repository_impl.go    # Repository Implementation
│  ├─ external/
│  │  ├─ spotify_client.go             # External service impl
│  │  └─ itunes_client.go
│  └─ database.go                      # DB connection
└─ pkg/
   └─ supabase/
      └─ client.go                     # Raw DB driver
```

---

## Dependency Injection Pattern (Go Standard)

Go uses **Constructor Injection** - no DI framework needed.

### 1. Define Interfaces in Service Layer

```golang
// service/interfaces.go
package service

import "context"

// Repository interface
type ProfileRepository interface {
  GetByID(ctx context.Context, userID string) (*domain.Profile, error)
  Update(ctx context.Context, profile *domain.Profile) error
}

// External service interface
type SpotifyClient interface {
  SearchAlbums(ctx context.Context, query string) ([]Album, error)
}
```

### 2. Service with Injected Dependencies

```golang
// service/profile_service.go
package service

import "context"

type ProfileService struct {
  repo ProfileRepository        // Injected
  spotify SpotifyClient         // Injected
}

// Constructor (Dependency Injection)
func NewProfileService(
  repo ProfileRepository,
  spotify SpotifyClient,
) *ProfileService {
  return &ProfileService{
    repo: repo,
    spotify: spotify,
  }
}

// Business logic
func (s *ProfileService) UpdateProfile(
  ctx context.Context,
  userID string,
  req *UpdateProfileRequest,
) (*ProfileDTO, error) {
  // Load entity from repository
  profile, err := s.repo.GetByID(ctx, userID)
  if err != nil {
    return nil, err
  }
  
  // Business logic
  profile.UpdateInfo(req.DisplayName, req.Bio)
  
  // Persist
  if err := s.repo.Update(ctx, profile); err != nil {
    return nil, err
  }
  
  // Convert Entity → DTO (boundary)
  return profile.ToDTO(), nil
}
```

### 3. Repository Implementation

```golang
// infrastructure/repository/profile_repository_impl.go
package repository

import (
  "context"
  "github.com/chs98412/prototype/backend/domain"
  "github.com/chs98412/prototype/backend/pkg/supabase"
)

type ProfileRepositoryImpl struct {
  db *supabase.Client  // Injected
}

func NewProfileRepository(db *supabase.Client) domain.ProfileRepository {
  return &ProfileRepositoryImpl{db: db}
}

func (r *ProfileRepositoryImpl) GetByID(
  ctx context.Context,
  userID string,
) (*domain.Profile, error) {
  result, err := r.db.Query(
    ctx,
    "SELECT * FROM user_profiles WHERE user_id = $1",
    userID,
  )
  if err != nil {
    return nil, err
  }
  
  // Parse result → Entity
  return domain.NewProfile(result), nil
}
```

### 4. Wire Dependencies in main.go

```golang
// main.go
package main

import (
  "github.com/chs98412/prototype/backend/handler"
  "github.com/chs98412/prototype/backend/infrastructure/repository"
  "github.com/chs98412/prototype/backend/service"
  "github.com/chs98412/prototype/backend/pkg/supabase"
)

func main() {
  // Initialize infrastructure
  db := supabase.NewClient()
  spotifyClient := spotify.NewClient()
  
  // Wire repositories
  profileRepo := repository.NewProfileRepository(db)
  recordsRepo := repository.NewRecordsRepository(db)
  
  // Wire services
  profileService := service.NewProfileService(profileRepo, spotifyClient)
  musicService := service.NewMusicService(recordsRepo, spotifyClient)
  
  // Wire handlers
  profileHandler := handler.NewProfileHandler(profileService)
  musicHandler := handler.NewMusicHandler(musicService)
  
  // Register routes
  r := gin.Default()
  r.GET("/v1/profile", profileHandler.GetProfile)
  r.POST("/v1/music/search", musicHandler.SearchMusic)
  
  r.Run(":8080")
}
```

---

## Entity & DTO Pattern

### Domain Layer: Entity (Private)

```golang
// domain/entity/profile.go
package entity

// Entity: Business logic holder, never exported outside domain
type Profile struct {
  ID           string
  UserID       string
  DisplayName  string
  Bio          string
  AvatarURL    string
  CreatedAt    time.Time
  UpdatedAt    time.Time
}

// Constructor
func NewProfile(id, userID, displayName string) *Profile {
  return &Profile{
    ID:           id,
    UserID:       userID,
    DisplayName:  displayName,
    CreatedAt:    time.Now(),
    UpdatedAt:    time.Now(),
  }
}

// Domain methods (business logic)
func (p *Profile) UpdateInfo(displayName, bio string) error {
  if displayName == "" {
    return ErrInvalidDisplayName
  }
  p.DisplayName = displayName
  p.Bio = bio
  p.UpdatedAt = time.Now()
  return nil
}

// Convert to DTO (only when leaving domain)
func (p *Profile) ToDTO() *ProfileDTO {
  return &ProfileDTO{
    UserID:      p.UserID,
    DisplayName: p.DisplayName,
    Bio:         p.Bio,
    AvatarURL:   p.AvatarURL,
  }
}
```

### Presentation Layer: DTO (Public)

```golang
// handler/response/profile_response.go
package response

// DTO: Only for external communication
type ProfileDTO struct {
  UserID      string `json:"user_id"`
  DisplayName string `json:"display_name"`
  Bio         string `json:"bio"`
  AvatarURL   string `json:"avatar_url"`
}

// Request DTO
type UpdateProfileRequest struct {
  DisplayName string `json:"display_name" binding:"required"`
  Bio         string `json:"bio"`
}
```

### Handler Usage

```golang
// handler/profile_handler.go
package handler

type ProfileHandler struct {
  service service.ProfileService  // Injected
}

func NewProfileHandler(svc service.ProfileService) *ProfileHandler {
  return &ProfileHandler{service: svc}
}

func (h *ProfileHandler) UpdateProfile(c *gin.Context) {
  userID := c.GetString("userID")
  
  // Parse Request DTO
  var req request.UpdateProfileRequest
  if err := c.BindJSON(&req); err != nil {
    c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
    return
  }
  
  // Call service (returns Response DTO)
  dto, err := h.service.UpdateProfile(c.Request.Context(), userID, &req)
  if err != nil {
    c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
    return
  }
  
  // Return Response DTO
  c.JSON(http.StatusOK, dto)
}
```

---

## Domain Service & Aggregate Pattern

For complex operations spanning multiple entities/repositories, use **Domain Service**.

### Example: Create Record with Achievement Check

```golang
// domain/service/record_domain_service.go
package service

import "context"

// Domain Service: Orchestrates multiple aggregates
type RecordDomainService struct {
  recordRepo repository.RecordRepository
  goalRepo   repository.GoalRepository
  achievementRepo repository.AchievementRepository
}

func NewRecordDomainService(
  recordRepo repository.RecordRepository,
  goalRepo repository.GoalRepository,
  achievementRepo repository.AchievementRepository,
) *RecordDomainService {
  return &RecordDomainService{
    recordRepo:      recordRepo,
    goalRepo:        goalRepo,
    achievementRepo: achievementRepo,
  }
}

// Business rule: Creating a record may trigger achievements
func (ds *RecordDomainService) CreateRecordAndCheckAchievements(
  ctx context.Context,
  record *entity.Record,
) (*entity.Record, []*entity.Achievement, error) {
  // 1. Create record
  if err := ds.recordRepo.Save(ctx, record); err != nil {
    return nil, nil, err
  }
  
  // 2. Load user goal
  goal, err := ds.goalRepo.GetByUserID(ctx, record.UserID)
  if err != nil {
    return nil, nil, err
  }
  
  // 3. Check if achievements unlocked
  achievements := []*entity.Achievement{}
  if goal.IsYearlyGoalMet(record) {
    achievement := entity.NewAchievement(record.UserID, "yearly_goal_met")
    ds.achievementRepo.Save(ctx, achievement)
    achievements = append(achievements, achievement)
  }
  
  return record, achievements, nil
}
```

### Service Layer Uses Domain Service

```golang
// service/record_service.go
package service

type RecordService struct {
  domainService *RecordDomainService  // Injected
  recordRepo RecordRepository
}

func (s *RecordService) CreateRecord(
  ctx context.Context,
  userID string,
  req *CreateRecordRequest,
) (*RecordDTO, error) {
  // Create entity
  record := entity.NewRecord(userID, req.TMDBID, req.Rating)
  
  // Use domain service for business logic
  saved, achievements, err := s.domainService.CreateRecordAndCheckAchievements(ctx, record)
  if err != nil {
    return nil, err
  }
  
  // Notify user of achievements (could be event-driven)
  for _, ach := range achievements {
    // Send notification...
  }
  
  return saved.ToDTO(), nil
}
```

---

## Error Handling

### Custom Domain Errors

```golang
// domain/errors.go
package domain

import "errors"

var (
  ErrNotFound           = errors.New("entity not found")
  ErrUnauthorized       = errors.New("unauthorized")
  ErrInvalidInput       = errors.New("invalid input")
  ErrDuplicateRecord    = errors.New("record already exists")
  ErrExternalServiceDown = errors.New("external service unavailable")
)
```

### Service Layer Error Mapping

```golang
// service/profile_service.go
func (s *ProfileService) GetProfile(ctx context.Context, userID string) (*ProfileDTO, error) {
  profile, err := s.repo.GetByID(ctx, userID)
  
  // Map domain errors to HTTP errors
  if err != nil {
    switch err {
    case domain.ErrNotFound:
      return nil, &HTTPError{Code: 404, Message: "Profile not found"}
    case domain.ErrExternalServiceDown:
      return nil, &HTTPError{Code: 503, Message: "Service unavailable"}
    default:
      return nil, &HTTPError{Code: 500, Message: "Internal server error"}
    }
  }
  
  return profile.ToDTO(), nil
}
```

### Handler Error Response

```golang
// handler/profile_handler.go
func (h *ProfileHandler) GetProfile(c *gin.Context) {
  userID := c.Param("userId")
  
  dto, err := h.service.GetProfile(c.Request.Context(), userID)
  if err != nil {
    httpErr := err.(*HTTPError)
    c.JSON(httpErr.Code, gin.H{"error": httpErr.Message})
    return
  }
  
  c.JSON(http.StatusOK, dto)
}
```

---

## Database & Repository Implementation

### No Raw SQL - Use Query Builder or ORM

❌ **Bad:**
```golang
sql := fmt.Sprintf("SELECT * FROM profiles WHERE id = '%s'", userID)  // SQL injection risk
```

✅ **Good (pgx with named parameters):**
```golang
rows, err := db.Query(ctx, 
  "SELECT * FROM profiles WHERE id = $1", userID)
```

✅ **Better (GORM):**
```golang
var profile Profile
db.WithContext(ctx).Where("id = ?", userID).First(&profile)
```

### Repository Interface

```golang
// domain/repository/profile_repository.go
package repository

import (
  "context"
  "github.com/chs98412/prototype/backend/domain/entity"
)

type ProfileRepository interface {
  GetByID(ctx context.Context, userID string) (*entity.Profile, error)
  Save(ctx context.Context, profile *entity.Profile) error
  Update(ctx context.Context, profile *entity.Profile) error
  Delete(ctx context.Context, userID string) error
}
```

### Repository Implementation

```golang
// infrastructure/repository/profile_repository_impl.go
package repository

import (
  "context"
  "github.com/jackc/pgx/v5"
  "github.com/chs98412/prototype/backend/domain/entity"
)

type ProfileRepositoryImpl struct {
  conn *pgx.Conn
}

func NewProfileRepository(conn *pgx.Conn) *ProfileRepositoryImpl {
  return &ProfileRepositoryImpl{conn: conn}
}

func (r *ProfileRepositoryImpl) GetByID(
  ctx context.Context,
  userID string,
) (*entity.Profile, error) {
  var p entity.Profile
  err := r.conn.QueryRow(ctx,
    "SELECT id, user_id, display_name, bio, avatar_url FROM user_profiles WHERE user_id = $1",
    userID,
  ).Scan(&p.ID, &p.UserID, &p.DisplayName, &p.Bio, &p.AvatarURL)
  
  if err != nil {
    return nil, err
  }
  return &p, nil
}

func (r *ProfileRepositoryImpl) Save(
  ctx context.Context,
  profile *entity.Profile,
) error {
  _, err := r.conn.Exec(ctx,
    `INSERT INTO user_profiles (id, user_id, display_name, bio, avatar_url) 
     VALUES ($1, $2, $3, $4, $5)`,
    profile.ID, profile.UserID, profile.DisplayName, profile.Bio, profile.AvatarURL,
  )
  return err
}
```

---

## External Service Integration

### Service Interface in Service Layer

```golang
// service/interfaces.go
package service

import "context"

type SpotifyClient interface {
  SearchAlbums(ctx context.Context, query string) ([]AlbumDTO, error)
  GetTrackInfo(ctx context.Context, trackID string) (*TrackDTO, error)
}

type iTunesClient interface {
  SearchAlbums(ctx context.Context, query string) ([]AlbumDTO, error)
}
```

### Implementation in Infrastructure Layer

```golang
// infrastructure/external/spotify_client.go
package external

import (
  "context"
  "fmt"
  "net/http"
  "service"  // Interface from service layer
)

type SpotifyClientImpl struct {
  baseURL string
  token   string
  client  *http.Client
}

func NewSpotifyClient(token string) service.SpotifyClient {
  return &SpotifyClientImpl{
    baseURL: "https://api.spotify.com",
    token:   token,
    client:  &http.Client{},
  }
}

func (c *SpotifyClientImpl) SearchAlbums(
  ctx context.Context,
  query string,
) ([]service.AlbumDTO, error) {
  url := fmt.Sprintf("%s/v1/search?q=%s&type=album", c.baseURL, query)
  // ... HTTP request
  return albums, nil
}
```

### Service Uses Interface

```golang
// service/music_service.go
package service

type MusicService struct {
  spotify SpotifyClient    // Interface (not implementation)
  itunes  iTunesClient
}

func NewMusicService(spotify SpotifyClient, itunes iTunesClient) *MusicService {
  return &MusicService{
    spotify: spotify,
    itunes:  itunes,
  }
}

func (s *MusicService) SearchAlbums(ctx context.Context, query string) (*SearchResultsDTO, error) {
  // Can switch implementation without changing service
  spotifyResults, err := s.spotify.SearchAlbums(ctx, query)
  if err != nil {
    // Try iTunes fallback
    itunesResults, _ := s.itunes.SearchAlbums(ctx, query)
    return itunesResults, nil
  }
  return spotifyResults, nil
}
```

---

## Middleware & Interceptors

### Auth Middleware (Presentation Boundary)

```golang
// middleware/auth.go
package middleware

import (
  "context"
  "github.com/gin-gonic/gin"
)

type contextKey string
const UserIDKey contextKey = "userID"

func Auth() gin.HandlerFunc {
  return func(c *gin.Context) {
    token := c.GetHeader("Authorization")
    userID := validateToken(token)  // Validate JWT
    
    if userID == "" {
      c.JSON(401, gin.H{"error": "unauthorized"})
      c.Abort()
      return
    }
    
    // Pass context down
    c.Request = c.Request.WithContext(
      context.WithValue(c.Request.Context(), UserIDKey, userID),
    )
    c.Next()
  }
}

// Extract in handlers
func getUserIDFromContext(ctx context.Context) string {
  return ctx.Value(UserIDKey).(string)
}
```

---

## Testing Strategy

### Unit Test: Service Layer

```golang
// service/profile_service_test.go
package service

import (
  "context"
  "testing"
  "github.com/chs98412/prototype/backend/domain/entity"
)

// Mock repository
type MockProfileRepository struct{}

func (m *MockProfileRepository) GetByID(ctx context.Context, userID string) (*entity.Profile, error) {
  return &entity.Profile{
    UserID:      userID,
    DisplayName: "Test User",
  }, nil
}

func TestUpdateProfile(t *testing.T) {
  mockRepo := &MockProfileRepository{}
  service := NewProfileService(mockRepo)
  
  result, err := service.UpdateProfile(context.Background(), "user1", &UpdateProfileRequest{
    DisplayName: "New Name",
  })
  
  if err != nil {
    t.Fatalf("unexpected error: %v", err)
  }
  if result.DisplayName != "New Name" {
    t.Errorf("expected 'New Name', got '%s'", result.DisplayName)
  }
}
```

### Integration Test: Repository Layer

```golang
// infrastructure/repository/profile_repository_test.go
func TestGetByID_Integration(t *testing.T) {
  conn := setupTestDB(t)
  defer conn.Close(context.Background())
  
  repo := NewProfileRepository(conn)
  profile, err := repo.GetByID(context.Background(), "test-user-id")
  
  if err != nil {
    t.Fatalf("unexpected error: %v", err)
  }
  if profile.UserID != "test-user-id" {
    t.Errorf("expected test-user-id, got %s", profile.UserID)
  }
}
```

---

## Naming Conventions

| Layer | Pattern | Example |
|-------|---------|---------|
| Domain Entity | Singular, PascalCase | `Profile`, `Record`, `Achievement` |
| Repository Interface | `{Entity}Repository` | `ProfileRepository` |
| Repository Impl | `{Entity}RepositoryImpl` | `ProfileRepositoryImpl` |
| Service Interface | `{Domain}Service` | `ProfileService` |
| Service Impl | Package function `New{Service}` | `NewProfileService()` |
| Handler | `{Entity}Handler` | `ProfileHandler` |
| Request DTO | `{Action}{Entity}Request` | `UpdateProfileRequest`, `CreateRecordRequest` |
| Response DTO | `{Entity}DTO` | `ProfileDTO`, `RecordDTO` |
| Domain Service | `{Action}DomainService` | `RecordDomainService` |

---

## Summary: Layer Boundaries

```
┌─────────────────────────────────────────────────────────────┐
│ Presentation                                                │
│ - HTTP Handlers only                                        │
│ - Request/Response DTO                                      │
│ ✓ Uses: Service Interface                                  │
│ ✗ Never: Repository, Domain Entity directly                │
└─────────────────────────────────────────────────────────────┘
                          ↓ (DTO)
┌─────────────────────────────────────────────────────────────┐
│ Service                                                     │
│ - Business Logic                                           │
│ - Orchestrates Domain & Repository                         │
│ - Defines Interfaces (not impl)                            │
│ ✓ Uses: Domain Entity, Repository Interface, Domain Service│
│ ✗ Never: HTTP, DB Query                                    │
└─────────────────────────────────────────────────────────────┘
                          ↓ (Entity)
┌─────────────────────────────────────────────────────────────┐
│ Domain                                                      │
│ - Core Business Logic (Domain Service)                     │
│ - Entity + Repository Interface                            │
│ ✓ Uses: Value Objects, Custom Errors                       │
│ ✗ Never: HTTP, DB, External Services                       │
└─────────────────────────────────────────────────────────────┘
                          ↓ (Interface → Impl)
┌─────────────────────────────────────────────────────────────┐
│ Infrastructure                                              │
│ - Repository Implementation                                │
│ - External Service Clients                                │
│ - Database Connection                                      │
│ ✓ Uses: DB Driver, HTTP Clients                            │
│ ✗ Never: Business Logic, Service Orchestration            │
└─────────────────────────────────────────────────────────────┘
```

---

## Next: Refactor Current Backend

This establishes the pattern. Refactoring steps:
1. Extract entities from handlers
2. Create repository interfaces
3. Implement repositories
4. Build services
5. Update handlers (DI wiring in main.go)
6. Add tests

Ready to start refactoring?
