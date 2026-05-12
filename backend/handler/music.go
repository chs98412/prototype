package handler

import (
	"context"
	"encoding/json"
	"fmt"
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
		log.Println("Warning: SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET not set")
		return
	}

	spotifyClient = spotify.NewClient(clientID, clientSecret)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	if err := spotifyClient.Authenticate(ctx); err != nil {
		log.Printf("Warning: Spotify authentication failed: %v\n", err)
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
	if spotifyClient == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Spotify client not initialized"})
		return
	}

	var req AlbumSearchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Limit == 0 {
		req.Limit = 10
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	albums, err := spotifyClient.SearchAlbums(ctx, req.Query, req.Limit)
	if err != nil {
		log.Printf("Spotify search error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Search failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"albums": albums})
}

func GetAlbumDetail(c *gin.Context) {
	if spotifyClient == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Spotify client not initialized"})
		return
	}

	spotifyID := c.Param("id")
	if spotifyID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Album ID required"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	album, tracks, err := spotifyClient.GetAlbumWithTracks(ctx, spotifyID)
	if err != nil {
		log.Printf("Spotify album fetch error: %v\n", err)
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

	c.JSON(http.StatusOK, albumData)
}

type RateTrackRequest struct {
	TrackSpotifyID string `json:"track_spotify_id" binding:"required"`
	Rating         int    `json:"rating" binding:"required,min=0,max=5"`
}

func RateTrack(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req RateTrackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := supabase.NewClient()
	sql := `INSERT INTO track_records (user_id, track_spotify_id, rating, listened_at)
		VALUES ($1, $2, $3, NOW())
		ON CONFLICT (user_id, track_spotify_id)
		DO UPDATE SET rating = $3, listened_at = NOW()`

	if err := db.Exec(sql, userID, req.TrackSpotifyID, req.Rating); err != nil {
		log.Printf("Rate track error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to rate track"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

type SaveAlbumReviewRequest struct {
	AlbumSpotifyID string `json:"album_spotify_id" binding:"required"`
	Content        string `json:"content" binding:"required"`
	HasSpoiler     bool   `json:"has_spoiler"`
}

func SaveAlbumReview(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req SaveAlbumReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := supabase.NewClient()
	sql := `INSERT INTO album_reviews (user_id, album_spotify_id, content, has_spoiler)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at, updated_at`

	result, err := db.Query(sql, userID, req.AlbumSpotifyID, req.Content, req.HasSpoiler)
	if err != nil {
		log.Printf("Save album review error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save review"})
		return
	}

	var rows []map[string]interface{}
	if err := json.Unmarshal(result, &rows); err != nil || len(rows) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse response"})
		return
	}

	c.JSON(http.StatusOK, rows[0])
}

type UpdateAlbumReviewRequest struct {
	Content    string `json:"content" binding:"required"`
	HasSpoiler bool   `json:"has_spoiler"`
}

func UpdateAlbumReview(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	reviewID := c.Param("id")

	var req UpdateAlbumReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := supabase.NewClient()
	sql := `UPDATE album_reviews SET content = $1, has_spoiler = $2, updated_at = NOW()
		WHERE id = $3 AND user_id = $4`

	if err := db.Exec(sql, req.Content, req.HasSpoiler, reviewID, userID); err != nil {
		log.Printf("Update album review error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update review"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

func DeleteAlbumReview(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	reviewID := c.Param("id")

	db := supabase.NewClient()
	sql := `DELETE FROM album_reviews WHERE id = $1 AND user_id = $2`

	if err := db.Exec(sql, reviewID, userID); err != nil {
		log.Printf("Delete album review error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete review"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

func GetAlbumReview(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	albumSpotifyID := c.Param("albumId")

	db := supabase.NewClient()
	sql := fmt.Sprintf(`SELECT id, content, has_spoiler, created_at, updated_at
		FROM album_reviews
		WHERE album_spotify_id = '%s' AND user_id = '%s'
		LIMIT 1`, albumSpotifyID, userID)

	result, err := db.Query(sql)
	if err != nil {
		log.Printf("Get album review error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get review"})
		return
	}

	var rows []map[string]interface{}
	if err := json.Unmarshal(result, &rows); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse response"})
		return
	}

	if len(rows) == 0 {
		c.JSON(http.StatusOK, nil)
		return
	}

	c.JSON(http.StatusOK, rows[0])
}

func GetAlbumStats(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	albumSpotifyID := c.Param("albumId")

	db := supabase.NewClient()
	sql := fmt.Sprintf(`SELECT
		COUNT(*) as rated_tracks,
		AVG(rating) as avg_rating,
		COUNT(DISTINCT DATE(listened_at)) as listen_days,
		MAX(listened_at) as last_listened
		FROM track_records tr
		JOIN album_tracks at ON tr.track_spotify_id = at.spotify_id
		WHERE tr.user_id = '%s' AND at.album_spotify_id = '%s'`, userID, albumSpotifyID)

	result, err := db.Query(sql)
	if err != nil {
		log.Printf("Get album stats error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get stats"})
		return
	}

	var rows []map[string]interface{}
	if err := json.Unmarshal(result, &rows); err != nil || len(rows) == 0 {
		c.JSON(http.StatusOK, gin.H{"rated_tracks": 0, "avg_rating": 0, "listen_days": 0})
		return
	}

	c.JSON(http.StatusOK, rows[0])
}
