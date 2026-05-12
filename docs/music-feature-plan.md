# 음악 평가 기능 (EP04) - 계획 문서

## 📌 개요

현재 영화/드라마 평가 시스템을 음악 음반으로 확장합니다.

**핵심 개념:**
- 🎵 음반의 **수록곡을 개별 평가** → 자동으로 음반 별점 계산
- 📊 영화와 동일한 통계/피드 시스템 통합

---

## 📋 요구사항

### 사용자 입장
1. 음반 검색 및 추가
2. 수록곡 개별 평가 (별점, 리뷰)
3. 자동 음반 평가 (곡들의 평균)
4. 음악 통계 (히트맵, 연간 목표, 취향 분석)
5. 친구 활동 피드에서 음악 활동 조회

### 기술 요구사항
- 무료 API 사용 (Spotify, MusicBrainz, Last.fm 등)
- **아티스트 평가 없음** (음반 + 곡만)
- RLS 기반 데이터 보안
- Backend Go로 RPC 함수 구현

---

## 🏗️ 아키텍처 결정

### API 선택안
| API | 장점 | 단점 | 추천 |
|---|---|---|---|
| **Spotify** | 풍부한 데이터, UI/UX 좋음 | 인증 필요, Rate limit | ⭐⭐⭐ |
| **MusicBrainz** | 완전 무료, 오픈데이터 | 메타데이터 부족 | ⭐⭐ |
| **Last.fm** | 무료 API, 커뮤니티 기반 | 레코드 라벨 데이터 약함 | ⭐⭐ |

**선택: Spotify Web API (Free Tier)**
- Client Credentials Flow 사용 (인증 무관한 데이터 조회)
- 이미지, 장르, 아티스트 정보 풍부

### DB 스키마 (신규)

```sql
-- 음반
CREATE TABLE albums (
  id UUID PRIMARY KEY,
  spotify_id TEXT UNIQUE,
  title TEXT,
  artist TEXT,
  image_url TEXT,
  release_date DATE,
  genres TEXT[], -- ['rock', 'indie']
  created_at TIMESTAMP
);

-- 음반 수록곡
CREATE TABLE album_tracks (
  id UUID PRIMARY KEY,
  album_id UUID REFERENCES albums,
  spotify_id TEXT UNIQUE,
  title TEXT,
  artist TEXT,
  duration_ms INT,
  track_number INT,
  created_at TIMESTAMP
);

-- 곡 청취 기록
CREATE TABLE track_records (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  track_id UUID REFERENCES album_tracks,
  album_id UUID REFERENCES albums,
  listened_at TIMESTAMP,
  rating INT (1-5),
  created_at TIMESTAMP,
  UNIQUE(user_id, track_id, listened_at)
);

-- 곡 리뷰
CREATE TABLE track_reviews (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  track_id UUID REFERENCES album_tracks,
  album_id UUID REFERENCES albums,
  content TEXT,
  rating INT (1-5),
  has_spoiler BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(user_id, track_id)
);

-- 음반 통계 (캐시/뷰)
CREATE VIEW user_album_stats AS
SELECT 
  user_id,
  album_id,
  COUNT(DISTINCT track_id) as rated_tracks,
  AVG(CAST(rating AS FLOAT)) as avg_rating,
  COUNT(DISTINCT DATE(listened_at)) as listen_days,
  MAX(listened_at) as last_listened
FROM track_records
GROUP BY user_id, album_id;
```

---

## 📊 데이터 흐름

```
1. 음반 검색 (Spotify API)
   ↓
2. 음반 + 곡 DB 저장
   ↓
3. 사용자가 곡 평가
   ↓
4. track_records / track_reviews 저장
   ↓
5. 자동 계산 (RPC):
   - 음반 avg_rating = 곡 ratings의 평균
   - 통계 업데이트
   - 피드 추가
```

---

## 🎯 에픽 & 스토리 분해

### EP04: 음악 평가 시스템

#### EP04-S00: 기초 세팅 (Architect + Backend)
- [ ] Spotify API 통합 (검색, 메타데이터 조회)
- [ ] DB 스키마 설계 & 마이그레이션
- [ ] Backend: Spotify 검색 엔드포인트

#### EP04-S01-Design: 음반 검색 UI 스펙 (Designer)
- [ ] 검색 페이지 UX 플로우 (영화 검색 참고)
- [ ] 음반 카드 디자인 (이미지, 제목, 아티스트, 출시일)
- [ ] 곡목 리스트 UI (트랙 번호, 제목, 시간)
- [ ] v0.dev 프롬프트 작성

#### EP04-S01: 음반 검색 & 추가 (Developer)
- [ ] FE: 음반 검색 UI 구현 (디자인 기반)
- [ ] FE: 곡 목록 표시
- [ ] BE: RPC `add_album` (Spotify 데이터 동기화)

#### EP04-S02-Design: 곡 평가 UI 스펙 (Designer)
- [ ] 음반 상세 페이지 레이아웃
- [ ] 곡 평가 별점 UI (1-5)
- [ ] 자동 계산 음반 평점 표시 방식
- [ ] v0.dev 프롬프트

#### EP04-S02: 곡 평가 시스템 (Developer)
- [ ] FE: 곡별 별점 입력 UI 구현
- [ ] FE: 곡 리뷰 작성
- [ ] BE: RPC `rate_track` (기록 저장)
- [ ] BE: RPC `get_album_rating` (자동 계산)

#### EP04-S03-Design: 리뷰 & 통계 UI 스펙 (Designer)
- [ ] 음반 리뷰 입력 폼 디자인
- [ ] 통계 섹션 레이아웃 (평가 곡, 평균, 청취 일수)
- [ ] v0.dev 프롬프트

#### EP04-S03: 음반 리뷰 & 통계 (Developer)
- [ ] FE: 음반 총평 UI 구현
- [ ] FE: 음반 리뷰 작성/수정/삭제
- [ ] BE: RPC `save_album_review`
- [ ] 통계 계산 RPC

#### EP04-S04-Design: 히트맵 & 대시보드 UI 스펙 (Designer)
- [ ] 히트맵 그리드 디자인 (색상 강도)
- [ ] 통계 카드 레이아웃
- [ ] 모바일 반응형 스펙
- [ ] v0.dev 프롬프트

#### EP04-S04: 음악 통계 & 히트맵 (Developer)
- [ ] FE: 음악 히트맵 컴포넌트 구현
- [ ] BE: RPC `get_music_heatmap`
- [ ] FE: 연간 음악 통계 대시보드

#### EP04-S05: 음악 취향 분석 (Designer + Developer)
- [ ] FE: 선호 장르 분석 UI
- [ ] BE: RPC `get_genre_ratings_music`
- [ ] FE: 취향 궁합 (음악 버전)

#### EP04-S06: 친구 활동 피드 통합 (Developer)
- [ ] BE: RPC `get_friend_music_activity` (음악 활동)
- [ ] FE: FriendFeed에 음악 활동 추가

#### EP04-S07: 음반 컬렉션 (Designer + Developer)
- [ ] FE: "아티스트별 음반" 모아보기
- [ ] FE: 정렬/필터링 UI

---

## 🔌 API 인증 설정

### Spotify Web API (Client Credentials)

```bash
POST https://accounts.spotify.com/api/token
  client_id: env.SPOTIFY_CLIENT_ID
  client_secret: env.SPOTIFY_CLIENT_SECRET
  grant_type: client_credentials
```

**필요 권한:**
- `search`
- `album data` 조회
- Rate limit: 분당 몇 천 요청 (Free tier)

---

## 📈 우선순위 & 실행 순서

**Phase 1 (필수) - Sprint 5-6:**
1. EP04-S00: 기초 세팅 (Architect, Backend)
2. EP04-S01-Design: 음반 검색 UI (Designer) ← **먼저**
3. EP04-S01: 음반 검색 개발 (Developer)
4. EP04-S02-Design: 곡 평가 UI (Designer) ← **먼저**
5. EP04-S02: 곡 평가 개발 (Developer)

**Phase 2 (중요) - Sprint 6-7:**
6. EP04-S03-Design: 리뷰 & 통계 UI (Designer) ← **먼저**
7. EP04-S03: 음반 리뷰 개발 (Developer)
8. EP04-S04-Design: 히트맵 UI (Designer) ← **먼저**
9. EP04-S04: 히트맵 개발 (Developer)

**Phase 3 (선택) - Sprint 8+:**
10. EP04-S05: 취향 분석
11. EP04-S06: 피드 통합
12. EP04-S07: 컬렉션

---

## 🚀 다음 단계

1. **이 문서 승인**
2. **Architecture 업데이트** (docs/architecture.md에 EP04 추가)
3. **스토리 상세화** (각 스토리별 Acceptance Criteria)
4. **Sprint 계획** (어느 것부터 시작할지)
