-- EP04: 음악 평가 시스템 테이블
-- Created: 2026-05-12

-- 음반 테이블
CREATE TABLE albums (
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

-- 인덱스
CREATE INDEX idx_albums_spotify_id ON albums(spotify_id);
CREATE INDEX idx_albums_artist ON albums(artist);

-- 음반 수록곡
CREATE TABLE album_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  spotify_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  duration_ms INT,
  track_number INT,
  created_at TIMESTAMP DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_album_tracks_album_id ON album_tracks(album_id);
CREATE INDEX idx_album_tracks_spotify_id ON album_tracks(spotify_id);

-- 곡 청취 기록
CREATE TABLE track_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES album_tracks(id) ON DELETE CASCADE,
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  listened_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, track_id, DATE(listened_at))
);

-- 인덱스
CREATE INDEX idx_track_records_user_id ON track_records(user_id);
CREATE INDEX idx_track_records_album_id ON track_records(album_id);
CREATE INDEX idx_track_records_listened_at ON track_records(listened_at);

-- 곡 리뷰
CREATE TABLE track_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id UUID REFERENCES album_tracks(id) ON DELETE CASCADE,
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  content TEXT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  has_spoiler BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, album_id, track_id)
);

-- 인덱스
CREATE INDEX idx_track_reviews_user_id ON track_reviews(user_id);
CREATE INDEX idx_track_reviews_album_id ON track_reviews(album_id);

-- RLS (Row Level Security) 정책
ALTER TABLE track_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE track_reviews ENABLE ROW LEVEL SECURITY;

-- track_records 정책
CREATE POLICY "Users can view their own track records"
  ON track_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own track records"
  ON track_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own track records"
  ON track_records FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own track records"
  ON track_records FOR DELETE
  USING (auth.uid() = user_id);

-- track_reviews 정책 (모두 읽기 가능, 본인만 쓰기/수정)
CREATE POLICY "Anyone can view track reviews"
  ON track_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own reviews"
  ON track_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON track_reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON track_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- VIEW: 사용자별 음반 통계
CREATE VIEW user_album_stats AS
SELECT
  user_id,
  album_id,
  COUNT(DISTINCT track_id) as rated_tracks,
  ROUND(AVG(rating::numeric), 1) as avg_rating,
  COUNT(DISTINCT DATE(listened_at)) as listen_days,
  MAX(listened_at) as last_listened
FROM track_records
WHERE rating IS NOT NULL
GROUP BY user_id, album_id;

-- RPC: 음반 추가
CREATE OR REPLACE FUNCTION add_album(
  p_spotify_id TEXT,
  p_title TEXT,
  p_artist TEXT,
  p_image_url TEXT,
  p_release_date DATE,
  p_genres TEXT[]
) RETURNS SETOF albums AS $$
BEGIN
  RETURN QUERY
  INSERT INTO albums (spotify_id, title, artist, image_url, release_date, genres)
  VALUES (p_spotify_id, p_title, p_artist, p_image_url, p_release_date, p_genres)
  ON CONFLICT (spotify_id) DO UPDATE SET updated_at = now()
  RETURNING *;
END;
$$ LANGUAGE plpgsql;

-- RPC: 음반 곡목 추가
CREATE OR REPLACE FUNCTION add_album_tracks(
  p_album_id UUID,
  p_tracks JSONB
) RETURNS SETOF album_tracks AS $$
BEGIN
  RETURN QUERY
  INSERT INTO album_tracks (album_id, spotify_id, title, artist, duration_ms, track_number)
  SELECT
    p_album_id,
    track->>'spotify_id',
    track->>'title',
    track->>'artist',
    (track->>'duration_ms')::INT,
    (track->>'track_number')::INT
  FROM jsonb_array_elements(p_tracks) AS track
  ON CONFLICT (spotify_id) DO NOTHING
  RETURNING *;
END;
$$ LANGUAGE plpgsql;

-- RPC: 곡 평가 저장
CREATE OR REPLACE FUNCTION rate_track(
  p_track_id UUID,
  p_rating INT,
  p_listened_at TIMESTAMP
) RETURNS UUID AS $$
DECLARE
  v_record_id UUID;
BEGIN
  INSERT INTO track_records (user_id, track_id, album_id, rating, listened_at)
  SELECT
    auth.uid(),
    p_track_id,
    album_tracks.album_id,
    p_rating,
    p_listened_at
  FROM album_tracks
  WHERE album_tracks.id = p_track_id
  RETURNING id INTO v_record_id;

  RETURN v_record_id;
EXCEPTION WHEN unique_violation THEN
  -- 중복된 (user, track, date)에 대해 UPDATE
  UPDATE track_records
  SET rating = p_rating, updated_at = now()
  WHERE user_id = auth.uid()
    AND track_id = p_track_id
    AND DATE(listened_at) = DATE(p_listened_at)
  RETURNING id INTO v_record_id;

  RETURN v_record_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: 음반 음악 히트맵 조회
CREATE OR REPLACE FUNCTION get_music_heatmap(p_year INT)
RETURNS TABLE (
  date DATE,
  count INT,
  rating_avg NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(listened_at)::DATE,
    COUNT(*)::INT,
    ROUND(AVG(rating::numeric), 1)
  FROM track_records
  WHERE user_id = auth.uid()
    AND EXTRACT(YEAR FROM listened_at) = p_year
  GROUP BY DATE(listened_at)
  ORDER BY date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: 음악 통계 조회
CREATE OR REPLACE FUNCTION get_music_stats(p_year INT)
RETURNS TABLE (
  total_albums INT,
  total_tracks_rated INT,
  avg_rating NUMERIC,
  listen_days INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT album_id)::INT,
    COUNT(*)::INT,
    ROUND(AVG(rating::numeric), 1),
    COUNT(DISTINCT DATE(listened_at))::INT
  FROM track_records
  WHERE user_id = auth.uid()
    AND EXTRACT(YEAR FROM listened_at) = p_year;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: 특정 날짜의 음악 기록 조회
CREATE OR REPLACE FUNCTION get_music_by_date(p_date DATE)
RETURNS TABLE (
  album_title TEXT,
  track_title TEXT,
  rating INT,
  listened_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    albums.title,
    album_tracks.title,
    track_records.rating,
    track_records.listened_at
  FROM track_records
  JOIN album_tracks ON track_records.track_id = album_tracks.id
  JOIN albums ON track_records.album_id = albums.id
  WHERE track_records.user_id = auth.uid()
    AND DATE(track_records.listened_at) = p_date
  ORDER BY track_records.listened_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
