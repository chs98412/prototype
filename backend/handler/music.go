package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/chs98412/prototype/backend/pkg/itunes"
	"github.com/chs98412/prototype/backend/pkg/supabase"
	"github.com/gin-gonic/gin"
)

var itunesClient = itunes.NewClient()

type AlbumSearchRequest struct {
	Query string `json:"query" binding:"required"`
	Limit int    `json:"limit"`
}

type AlbumData struct {
	ID          string      `json:"spotify_id"`
	Title       string      `json:"title"`
	Artist      string      `json:"artist"`
	ImageURL    string      `json:"image_url"`
	ReleaseDate string      `json:"release_date"`
	Genres      []string    `json:"genres"`
	Tracks      []TrackData `json:"tracks"`
}

type TrackData struct {
	ID          string `json:"spotify_id"`
	Title       string `json:"title"`
	Artist      string `json:"artist"`
	DurationMs  int    `json:"duration_ms"`
	TrackNumber int    `json:"track_number"`
}

type SearchTrackData struct {
	ID         string `json:"spotify_id"`
	Title      string `json:"title"`
	Artist     string `json:"artist"`
	AlbumTitle string `json:"album_title"`
	AlbumID    string `json:"album_id"`
	DurationMs int    `json:"duration_ms"`
	ImageURL   string `json:"image_url"`
}

type ArtistData struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Genre string `json:"genre"`
}

func SearchAlbums(c *gin.Context) {
	start := time.Now()

	var req AlbumSearchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("❌ Search: Invalid request - %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Limit == 0 {
		req.Limit = 20
	}

	log.Printf("🔍 Search: query='%s', limit=%d\n", req.Query, req.Limit)

	var (
		albums  []itunes.Album
		tracks  []itunes.Track
		artists []itunes.Artist
		mu      sync.Mutex
		wg      sync.WaitGroup
	)

	wg.Add(3)
	go func() {
		defer wg.Done()
		result, err := itunesClient.SearchAlbums(req.Query, req.Limit)
		if err != nil {
			log.Printf("⚠️  album search error: %v\n", err)
			return
		}
		mu.Lock()
		albums = result
		mu.Unlock()
	}()
	go func() {
		defer wg.Done()
		result, err := itunesClient.SearchTracks(req.Query, req.Limit)
		if err != nil {
			log.Printf("⚠️  track search error: %v\n", err)
			return
		}
		mu.Lock()
		tracks = result
		mu.Unlock()
	}()
	go func() {
		defer wg.Done()
		result, err := itunesClient.SearchArtists(req.Query, 10)
		if err != nil {
			log.Printf("⚠️  artist search error: %v\n", err)
			return
		}
		mu.Lock()
		artists = result
		mu.Unlock()
	}()
	wg.Wait()

	albumResults := make([]AlbumData, len(albums))
	for i, a := range albums {
		albumResults[i] = AlbumData{
			ID:          a.ID,
			Title:       a.Title,
			Artist:      a.Artist,
			ImageURL:    a.ImageURL,
			ReleaseDate: a.ReleaseDate,
			Genres:      a.Genres,
		}
	}

	trackResults := make([]SearchTrackData, len(tracks))
	for i, t := range tracks {
		trackResults[i] = SearchTrackData{
			ID:         t.ID,
			Title:      t.Title,
			Artist:     t.Artist,
			AlbumTitle: t.AlbumTitle,
			AlbumID:    t.AlbumID,
			DurationMs: t.DurationMs,
			ImageURL:   t.ImageURL,
		}
	}

	artistResults := make([]ArtistData, len(artists))
	for i, a := range artists {
		artistResults[i] = ArtistData{
			ID:    a.ID,
			Name:  a.Name,
			Genre: a.Genre,
		}
	}

	log.Printf("✅ Search: %d albums, %d tracks, %d artists in %.2fs\n",
		len(albumResults), len(trackResults), len(artistResults), time.Since(start).Seconds())
	c.JSON(http.StatusOK, gin.H{
		"albums":  albumResults,
		"tracks":  trackResults,
		"artists": artistResults,
	})
}

func GetAlbumDetail(c *gin.Context) {
	start := time.Now()

	albumID := c.Param("id")
	if albumID == "" {
		log.Println("❌ GetAlbumDetail: Album ID required")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Album ID required"})
		return
	}

	log.Printf("📀 GetAlbumDetail: id=%s\n", albumID)

	album, tracks, err := itunesClient.GetAlbumWithTracks(albumID)
	if err != nil {
		log.Printf("❌ GetAlbumDetail failed after %.2fs: %v\n", time.Since(start).Seconds(), err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch album"})
		return
	}

	trackData := make([]TrackData, len(tracks))
	for i, t := range tracks {
		trackData[i] = TrackData{
			ID:          t.ID,
			Title:       t.Title,
			Artist:      t.Artist,
			DurationMs:  t.DurationMs,
			TrackNumber: t.TrackNumber,
		}
	}

	albumData := AlbumData{
		ID:          album.ID,
		Title:       album.Title,
		Artist:      album.Artist,
		ImageURL:    album.ImageURL,
		ReleaseDate: album.ReleaseDate,
		Genres:      album.Genres,
		Tracks:      trackData,
	}

	log.Printf("✅ GetAlbumDetail: '%s' (%d tracks) in %.2fs\n", album.Title, len(trackData), time.Since(start).Seconds())
	c.JSON(http.StatusOK, albumData)
}

type RateTrackRequest struct {
	TrackSpotifyID string `json:"track_spotify_id" binding:"required"`
	Rating         int    `json:"rating" binding:"required,min=0,max=5"`
}

func RateTrack(c *gin.Context) {
	start := time.Now()
	userID := c.GetString("userID")

	if userID == "" {
		log.Println("❌ RateTrack: Unauthorized")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req RateTrackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("❌ RateTrack: Invalid request - %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Printf("⭐ RateTrack: track=%s, rating=%d, user=%.8s\n", req.TrackSpotifyID, req.Rating, userID)

	db := supabase.NewClient()
	sql := `INSERT INTO track_records (user_id, track_spotify_id, rating, listened_at)
		VALUES ($1, $2, $3, NOW())
		ON CONFLICT (user_id, track_spotify_id)
		DO UPDATE SET rating = $3, listened_at = NOW()`

	if err := db.Exec(sql, userID, req.TrackSpotifyID, req.Rating); err != nil {
		log.Printf("❌ RateTrack failed after %.2fs: %v\n", time.Since(start).Seconds(), err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to rate track"})
		return
	}

	log.Printf("✅ RateTrack: rated in %.2fs\n", time.Since(start).Seconds())
	c.JSON(http.StatusOK, gin.H{"success": true})
}

type SaveAlbumReviewRequest struct {
	AlbumSpotifyID string `json:"album_spotify_id" binding:"required"`
	Content        string `json:"content" binding:"required"`
	HasSpoiler     bool   `json:"has_spoiler"`
}

func SaveAlbumReview(c *gin.Context) {
	start := time.Now()
	userID := c.GetString("userID")

	if userID == "" {
		log.Println("❌ SaveAlbumReview: Unauthorized")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req SaveAlbumReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("❌ SaveAlbumReview: Invalid request - %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Printf("📝 SaveAlbumReview: album=%s, hasSpoiler=%v, user=%.8s\n", req.AlbumSpotifyID, req.HasSpoiler, userID)

	db := supabase.NewClient()
	sql := `INSERT INTO album_reviews (user_id, album_spotify_id, content, has_spoiler)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at, updated_at`

	result, err := db.Query(sql, userID, req.AlbumSpotifyID, req.Content, req.HasSpoiler)
	if err != nil {
		log.Printf("❌ SaveAlbumReview failed after %.2fs: %v\n", time.Since(start).Seconds(), err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save review"})
		return
	}

	var rows []map[string]interface{}
	if err := json.Unmarshal(result, &rows); err != nil || len(rows) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse response"})
		return
	}

	log.Printf("✅ SaveAlbumReview: saved in %.2fs\n", time.Since(start).Seconds())
	c.JSON(http.StatusOK, rows[0])
}

type UpdateAlbumReviewRequest struct {
	Content    string `json:"content" binding:"required"`
	HasSpoiler bool   `json:"has_spoiler"`
}

func UpdateAlbumReview(c *gin.Context) {
	start := time.Now()
	userID := c.GetString("userID")

	if userID == "" {
		log.Println("❌ UpdateAlbumReview: Unauthorized")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	reviewID := c.Param("id")

	var req UpdateAlbumReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("❌ UpdateAlbumReview: Invalid request - %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Printf("✏️  UpdateAlbumReview: reviewID=%s, user=%.8s\n", reviewID, userID)

	db := supabase.NewClient()
	sql := `UPDATE album_reviews SET content = $1, has_spoiler = $2, updated_at = NOW()
		WHERE id = $3 AND user_id = $4`

	if err := db.Exec(sql, req.Content, req.HasSpoiler, reviewID, userID); err != nil {
		log.Printf("❌ UpdateAlbumReview failed after %.2fs: %v\n", time.Since(start).Seconds(), err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update review"})
		return
	}

	log.Printf("✅ UpdateAlbumReview: updated in %.2fs\n", time.Since(start).Seconds())
	c.JSON(http.StatusOK, gin.H{"success": true})
}

func DeleteAlbumReview(c *gin.Context) {
	start := time.Now()
	userID := c.GetString("userID")

	if userID == "" {
		log.Println("❌ DeleteAlbumReview: Unauthorized")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	reviewID := c.Param("id")

	log.Printf("🗑️  DeleteAlbumReview: reviewID=%s, user=%.8s\n", reviewID, userID)

	db := supabase.NewClient()
	sql := `DELETE FROM album_reviews WHERE id = $1 AND user_id = $2`

	if err := db.Exec(sql, reviewID, userID); err != nil {
		log.Printf("❌ DeleteAlbumReview failed after %.2fs: %v\n", time.Since(start).Seconds(), err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete review"})
		return
	}

	log.Printf("✅ DeleteAlbumReview: deleted in %.2fs\n", time.Since(start).Seconds())
	c.JSON(http.StatusOK, gin.H{"success": true})
}
