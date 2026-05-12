# Story: 음반 검색 & 추가

**ID**: EP04-S01
**Epic**: EP04: 음악 평가 시스템
**Sprint**: 5
**Points**: 3
**Status**: Draft
**Assignee**: Developer, Designer
**Created**: 2026-05-12
**Updated**: 2026-05-12

---

## User Story

> As a **Music Listener**,
> I want to **search for albums and add them to my collection**,
> So that **I can start rating tracks in those albums**.

---

## Acceptance Criteria

- [ ] AC1: 프론트엔드 음반 검색 UI 구현 (영화 검색과 동일한 UX)
- [ ] AC2: 검색 결과에 음반 이미지, 제목, 아티스트, 출시일 표시
- [ ] AC3: 음반 클릭 시 곡목 리스트 표시 (트랙 번호, 제목, 가수, 재생시간)
- [ ] AC4: "음반 추가" 버튼으로 내 컬렉션에 저장
- [ ] AC5: 이미 추가한 음반은 표시 변경 (체크마크 또는 "추가됨")
- [ ] AC6: 음반 추가 시 모든 곡도 함께 DB에 저장

---

## Technical Notes

### 프론트엔드 구조

```typescript
// components/music/AlbumSearch.tsx
export function AlbumSearch() {
  const [query, setQuery] = useState('')
  const [albums, setAlbums] = useState<Album[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (q: string) => {
    setIsLoading(true)
    const { data } = await supabase.rpc('search_albums', { query: q })
    setAlbums(data)
    setIsLoading(false)
  }

  return (
    <div>
      <input
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="음반 검색..."
      />
      {albums.map((album) => (
        <AlbumCard key={album.id} album={album} onAdd={handleAddAlbum} />
      ))}
    </div>
  )
}

// components/music/AlbumCard.tsx
export function AlbumCard({ album, onAdd }: Props) {
  const [showTracks, setShowTracks] = useState(false)
  const [isAdded, setIsAdded] = useState(false)

  const handleAdd = async () => {
    const { error } = await supabase.rpc('add_album_to_collection', {
      spotify_id: album.spotify_id,
      album_data: album
    })
    if (!error) setIsAdded(true)
  }

  return (
    <div className="border rounded p-4">
      <img src={album.image_url} alt={album.title} />
      <h3>{album.title}</h3>
      <p>{album.artist}</p>
      <button onClick={() => setShowTracks(!showTracks)}>곡목 보기</button>
      <button onClick={handleAdd} disabled={isAdded}>
        {isAdded ? '추가됨' : '추가'}
      </button>
      {showTracks && (
        <TrackList tracks={album.tracks} />
      )}
    </div>
  )
}
```

### Backend RPC 함수

```sql
CREATE OR REPLACE FUNCTION search_albums(p_query TEXT)
RETURNS TABLE (
  id UUID,
  spotify_id TEXT,
  title TEXT,
  artist TEXT,
  image_url TEXT,
  release_date DATE,
  genres TEXT[]
) AS $$
BEGIN
  -- Backend Go API 호출 결과를 반환
  -- (Spotify API는 서버에서만 호출)
  RETURN QUERY
  SELECT * FROM albums
  WHERE title ILIKE '%' || p_query || '%'
     OR artist ILIKE '%' || p_query || '%';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION add_album_to_collection(
  p_spotify_id TEXT,
  p_album_data JSONB
) RETURNS UUID AS $$
DECLARE
  v_album_id UUID;
BEGIN
  -- 음반 추가 (중복이면 기존 것 반환)
  INSERT INTO albums (
    spotify_id, title, artist, image_url, release_date, genres
  ) VALUES (
    p_spotify_id,
    p_album_data->>'title',
    p_album_data->>'artist',
    p_album_data->>'image_url',
    (p_album_data->>'release_date')::DATE,
    (p_album_data->'genres')::TEXT[]
  )
  ON CONFLICT (spotify_id) DO UPDATE SET updated_at = now()
  RETURNING albums.id INTO v_album_id;

  -- 곡목 추가
  INSERT INTO album_tracks (album_id, spotify_id, title, artist, duration_ms, track_number)
  SELECT v_album_id,
         track->>'spotify_id',
         track->>'title',
         track->>'artist',
         (track->>'duration_ms')::INT,
         (track->>'track_number')::INT
  FROM jsonb_array_elements(p_album_data->'tracks') AS track
  ON CONFLICT (spotify_id) DO NOTHING;

  RETURN v_album_id;
END;
$$ LANGUAGE plpgsql;
```

### UI 스펙

- **검색 페이지**: `/music/search`
- **레이아웃**: 영화 검색과 동일 (그리드, 이미지 카드)
- **모바일**: 2열 그리드 (영화처럼)
- **색상**: 타일 기반 (브랜드 컬러는 미정, Designer 결정)

---

## Dependencies

- EP04-S00: 음악 기능 기초 세팅 완료
- Designer: UI 스펙 제공

---

## Test Cases

| ID | Description | Expected Result | Status |
|---|---|---|---|
| TC01 | "Billie Eilish" 검색 | 최소 5개 음반 표시 | Pending |
| TC02 | 음반 카드 클릭 시 곡목 확장 | 곡목 리스트 표시 (최대 20곡) | Pending |
| TC03 | "추가" 버튼 클릭 | DB에 음반 + 곡 저장, "추가됨" 표시 | Pending |
| TC04 | 추가된 음반 다시 검색 | "추가됨" 표시 상태 유지 | Pending |
| TC05 | 모바일 화면에서 검색 | 2열 그리드 정렬, 터치 가능 | Pending |

---

## Definition of Done

- [ ] AlbumSearch, AlbumCard 컴포넌트 구현
- [ ] 검색 API 통합 (Backend RPC 호출)
- [ ] 음반 추가 로직 구현
- [ ] UI 반응형 디자인 (모바일, 데스크톱)
- [ ] 전체 통합 테스트 통과
- [ ] 코드 푸시
- [ ] Designer & PO 리뷰 및 승인

---

## Blockers

[None]

---

## Dev Notes

[To be filled during implementation]
