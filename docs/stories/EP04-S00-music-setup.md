# Story: 음악 기능 기초 세팅

**ID**: EP04-S00
**Epic**: EP04: 음악 평가 시스템
**Sprint**: 5
**Points**: 5
**Status**: Draft
**Assignee**: Developer, Architect
**Created**: 2026-05-12
**Updated**: 2026-05-12

---

## User Story

> As an **Engineer**,
> I want to **set up Spotify API integration and music database schema**,
> So that **subsequent stories can use the music data infrastructure**.

---

## Acceptance Criteria

- [ ] AC1: Spotify Web API 클라이언트 구현 (Client Credentials flow)
- [ ] AC2: 환경변수 설정 (SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET)
- [ ] AC3: DB 마이그레이션 실행 (albums, album_tracks, track_records, track_reviews 테이블)
- [ ] AC4: Backend `/music/search` RPC 구현 (Spotify 프록시)
- [ ] AC5: Spotify 응답 캐싱 (Redis, 24h TTL)
- [ ] AC6: 유닛 테스트 작성 (Spotify API, 캐싱)

---

## Technical Notes

### Spotify Web API 선택 이유
- **Client Credentials Flow**: 사용자 인증 불필요 (공개 데이터만 조회)
- **Rate Limit**: 분당 수천 요청 (Free tier)
- **데이터**: 음반, 곡, 이미지, 메타데이터 모두 포함
- **비용**: 무료

### DB 스키마

```sql
CREATE TABLE albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spotify_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  image_url TEXT,
  release_date DATE,
  genres TEXT[],
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE album_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES albums(id),
  spotify_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  duration_ms INT,
  track_number INT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE track_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  track_id UUID NOT NULL REFERENCES album_tracks(id),
  album_id UUID NOT NULL REFERENCES albums(id),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  listened_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, track_id, listened_at)
);

CREATE TABLE track_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  track_id UUID NOT NULL REFERENCES album_tracks(id),
  album_id UUID NOT NULL REFERENCES albums(id),
  content TEXT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  has_spoiler BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, track_id)
);

-- RLS 정책
ALTER TABLE track_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own track records"
  ON track_records FOR SELECT
  USING (auth.uid() = user_id);

ALTER TABLE track_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see track reviews"
  ON track_reviews FOR SELECT
  USING (true);
CREATE POLICY "Users can only modify their own reviews"
  ON track_reviews FOR UPDATE
  USING (auth.uid() = user_id);
```

### Backend 구현 (Go)

```go
// pkg/spotify/client.go
type SpotifyClient struct {
  baseURL      string
  clientID     string
  clientSecret string
  accessToken  string
  cache        *redis.Client
}

// 음반 검색
func (c *SpotifyClient) SearchAlbums(ctx context.Context, query string) ([]Album, error)

// 음반 상세 + 곡목
func (c *SpotifyClient) GetAlbumWithTracks(ctx context.Context, spotifyID string) (*Album, []Track, error)
```

### RPC 함수 (Supabase)

```sql
CREATE OR REPLACE FUNCTION add_album(
  p_spotify_id TEXT,
  p_title TEXT,
  p_artist TEXT,
  p_image_url TEXT,
  p_release_date DATE,
  p_genres TEXT[]
) RETURNS albums AS $$
BEGIN
  INSERT INTO albums (spotify_id, title, artist, image_url, release_date, genres)
  VALUES (p_spotify_id, p_title, p_artist, p_image_url, p_release_date, p_genres)
  ON CONFLICT (spotify_id) DO UPDATE SET updated_at = now()
  RETURNING *;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION add_album_tracks(
  p_album_id UUID,
  p_tracks JSONB -- [{ spotify_id, title, artist, duration_ms, track_number }]
) RETURNS setof album_tracks AS $$
BEGIN
  RETURN QUERY
  INSERT INTO album_tracks (album_id, spotify_id, title, artist, duration_ms, track_number)
  SELECT p_album_id, track->>'spotify_id', track->>'title', track->>'artist',
         (track->>'duration_ms')::INT, (track->>'track_number')::INT
  FROM jsonb_array_elements(p_tracks) AS track
  RETURNING *;
END;
$$ LANGUAGE plpgsql;
```

---

## Dependencies

- Supabase CLI 설치 필요
- Spotify 개발자 계정 (무료)

---

## Test Cases

| ID | Description | Expected Result | Status |
|---|---|---|---|
| TC01 | Spotify API에서 "Taylor Swift"로 음반 검색 | 최소 10개 음반 반환 | Pending |
| TC02 | 음반 상세 조회 시 곡목 리스트 포함 | 곡 객체 배열 반환 | Pending |
| TC03 | 동일 음반 재요청 시 캐시에서 조회 | Redis hit (2초 이내) | Pending |
| TC04 | RLS 정책 확인 | 자신의 기록만 조회 가능 | Pending |

---

## Definition of Done

- [ ] Spotify API 클라이언트 구현 및 테스트
- [ ] DB 마이그레이션 스크립트 작성 및 실행
- [ ] RPC 함수 테스트 (add_album, add_album_tracks)
- [ ] 환경변수 문서화 (SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET)
- [ ] 캐싱 로직 테스트 (Hit rate 확인)
- [ ] 코드 푸시
- [ ] Architect 검토 및 승인

---

## Blockers

[None]

---

## Dev Notes

[To be filled during implementation]
