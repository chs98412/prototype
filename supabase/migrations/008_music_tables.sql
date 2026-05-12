-- EP04: 음악 평가 시스템 테이블
-- Created: 2026-05-12

-- 음반 테이블
CREATE TABLE IF NOT EXISTS albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spotify_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  image_url TEXT,
  release_date DATE,
  genres TEXT[],
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_albums_spotify_id ON albums(spotify_id);
CREATE INDEX IF NOT EXISTS idx_albums_artist ON albums(artist);

-- 음반 수록곡
CREATE TABLE IF NOT EXISTS album_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  album_spotify_id TEXT NOT NULL,
  spotify_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  duration_ms INT,
  track_number INT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_album_tracks_album_id ON album_tracks(album_id);
CREATE INDEX IF NOT EXISTS idx_album_tracks_spotify_id ON album_tracks(spotify_id);
CREATE INDEX IF NOT EXISTS idx_album_tracks_album_spotify_id ON album_tracks(album_spotify_id);

-- 곡 평가 기록 (spotify_id 기반)
CREATE TABLE IF NOT EXISTS track_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_spotify_id TEXT NOT NULL,
  rating INT CHECK (rating >= 0 AND rating <= 5),
  listened_at TIMESTAMP NOT NULL DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, track_spotify_id)
);

CREATE INDEX IF NOT EXISTS idx_track_records_user_id ON track_records(user_id);
CREATE INDEX IF NOT EXISTS idx_track_records_listened_at ON track_records(listened_at);

-- 음반 리뷰 (spotify_id 기반)
CREATE TABLE IF NOT EXISTS album_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  album_spotify_id TEXT NOT NULL,
  content TEXT NOT NULL,
  has_spoiler BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, album_spotify_id)
);

CREATE INDEX IF NOT EXISTS idx_album_reviews_user_id ON album_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_album_reviews_album_spotify_id ON album_reviews(album_spotify_id);

-- RLS
ALTER TABLE track_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE album_reviews ENABLE ROW LEVEL SECURITY;

-- track_records 정책
CREATE POLICY "Users can view their own track records"
  ON track_records FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own track records"
  ON track_records FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own track records"
  ON track_records FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own track records"
  ON track_records FOR DELETE USING (auth.uid() = user_id);

-- album_reviews 정책
CREATE POLICY "Anyone can view album reviews"
  ON album_reviews FOR SELECT USING (true);

CREATE POLICY "Users can insert their own album reviews"
  ON album_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own album reviews"
  ON album_reviews FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own album reviews"
  ON album_reviews FOR DELETE USING (auth.uid() = user_id);

-- VIEW: 사용자별 음반 통계 (track_records + album_tracks 조인)
CREATE OR REPLACE VIEW user_album_stats AS
SELECT
  tr.user_id,
  at.album_spotify_id,
  COUNT(DISTINCT tr.track_spotify_id) AS rated_tracks,
  ROUND(AVG(tr.rating::numeric), 1) AS avg_rating,
  COUNT(DISTINCT DATE(tr.listened_at)) AS listen_days,
  MAX(tr.listened_at) AS last_listened
FROM track_records tr
JOIN album_tracks at ON tr.track_spotify_id = at.spotify_id
WHERE tr.rating IS NOT NULL
GROUP BY tr.user_id, at.album_spotify_id;
