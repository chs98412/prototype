package handler

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/chs98412/prototype/backend/pkg/spotify"
	"github.com/chs98412/prototype/backend/pkg/supabase"
	"github.com/gin-gonic/gin"
)

var spotifyClient *spotify.Client

func init() {
	clientID := os.Getenv("SPOTIFY_CLIENT_ID")
	clientSecret := os.Getenv("SPOTIFY_CLIENT_SECRET")

	if clientID == "" || clientSecret == "" {
		log.Println("⚠️  WARNING: SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET not set")
		return
	}

	spotifyClient = spotify.NewClient(clientID, clientSecret)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	log.Println("🔐 Attempting Spotify authentication...")
	if err := spotifyClient.Authenticate(ctx); err != nil {
		log.Printf("❌ Spotify authentication failed: %v\n", err)
	} else {
		log.Println("✅ Spotify authentication successful")
	}
	cancel()
}

type AlbumSearchRequest struct {
	Query string `json:"query" binding:"required"`
	Limit int    `json:"limit"`
}

type AlbumData struct {
	SpotifyID   string      `json:"spotify_id"`
	Title       string      `json:"title"`
	Artist      string      `json:"artist"`
	ImageURL    string      `json:"image_url"`
	ReleaseDate string      `json:"release_date"`
	Genres      []string    `json:"genres"`
	Tracks      []TrackData `json:"tracks"`
}

type TrackData struct {
	SpotifyID   string `json:"spotify_id"`
	Title       string `json:"title"`
	Artist      string `json:"artist"`
	DurationMs  int    `json:"duration_ms"`
	TrackNumber int    `json:"track_number"`
}

func SearchAlbums(c *gin.Context) {
	start := time.Now()

	if spotifyClient == nil {
		log.Println("❌ SearchAlbums: Spotify client not initialized")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Spotify client not initialized"})
		return
	}

	var req AlbumSearchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("❌ SearchAlbums: Invalid request - %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Limit == 0 {
		req.Limit = 10
	}

	log.Printf("🔍 SearchAlbums: query='%s', limit=%d\n", req.Query, req.Limit)

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	albums, err := spotifyClient.SearchAlbums(ctx, req.Query, req.Limit)
	if err != nil {
		log.Printf("❌ SearchAlbums failed after %.2fs: %v\n", time.Since(start).Seconds(), err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Search failed"})
		return
	}

	log.Printf("✅ SearchAlbums: found %d albums in %.2fs\n", len(albums), time.Since(start).Seconds())
	c.JSON(http.StatusOK, gin.H{"albums": albums})
}

func GetAlbumDetail(c *gin.Context) {
	start := time.Now()

	if spotifyClient == nil {
		log.Println("❌ GetAlbumDetail: Spotify client not initialized")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Spotify client not initialized"})
		return
	}

	spotifyID := c.Param("id")
	if spotifyID == "" {
		log.Println("❌ GetAlbumDetail: Album ID required")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Album ID required"})
		return
	}

	log.Printf("📀 GetAlbumDetail: spotifyID=%s\n", spotifyID)

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	album, tracks, err := spotifyClient.GetAlbumWithTracks(ctx, spotifyID)
	if err != nil {
		log.Printf("❌ GetAlbumDetail failed after %.2fs: %v\n", time.Since(start).Seconds(), err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch album"})
		return
	}

	artistName := ""
	if len(album.Artists) > 0 {
		artistName = album.Artists[0].Name
	}

	imageURL := ""
	if len(album.Images) > 0 {
		imageURL = album.Images[0].URL
	}

	trackData := make([]TrackData, len(tracks))
	for i, track := range tracks {
		trackArtist := ""
		if len(track.Artists) > 0 {
			trackArtist = track.Artists[0].Name
		}
		trackData[i] = TrackData{
			SpotifyID:   track.ID,
			Title:       track.Name,
			Artist:      trackArtist,
			DurationMs:  track.Duration,
			TrackNumber: track.TrackNumber,
		}
	}

	albumData := AlbumData{
		SpotifyID:   album.ID,
		Title:       album.Name,
		Artist:      artistName,
		ImageURL:    imageURL,
		ReleaseDate: album.ReleaseDate,
		Genres:      album.Genres,
		Tracks:      trackData,
	}

	log.Printf("✅ GetAlbumDetail: '%s' (%d tracks) in %.2fs\n", album.Name, len(trackData), time.Since(start).Seconds())
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

	log.Printf("✏️  UpdateAlbumReview: reviewID=%s, hasSpoiler=%v, user=%.8s\n", reviewID, req.HasSpoiler, userID)

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
