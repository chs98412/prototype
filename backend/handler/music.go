package handler

import (
	"context"
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

	// 초기 인증 시도
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

// SearchAlbums 음반 검색
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

	// Spotify API 호출
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

// GetAlbumDetail 음반 상세 정보 (곡목 포함)
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

	// Spotify API 호출
	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	album, tracks, err := spotifyClient.GetAlbumWithTracks(ctx, spotifyID)
	if err != nil {
		log.Printf("❌ GetAlbumDetail failed after %.2fs: %v\n", time.Since(start).Seconds(), err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch album"})
		return
	}

	// 응답 포맷팅
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

// RateTrackRequest 곡 평가 요청
type RateTrackRequest struct {
	TrackSpotifyID string `json:"track_spotify_id" binding:"required"`
	Rating         int    `json:"rating" binding:"required,min=0,max=5"`
}

// RateTrack 곡 평가
func RateTrack(c *gin.Context) {
	start := time.Now()
	userID := c.GetString("userID")

	if userID == "" {
		log.Println("❌ RateTrack: Unauthorized - userID missing")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req RateTrackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("❌ RateTrack: Invalid request - %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Printf("⭐ RateTrack: trackID=%s, rating=%d, user=%s\n", req.TrackSpotifyID, req.Rating, userID[:8])

	sbClient := supabase.NewClient(userID)
	if err := sbClient.RateTrack(req.TrackSpotifyID, req.Rating, userID); err != nil {
		log.Printf("❌ RateTrack failed after %.2fs: %v\n", time.Since(start).Seconds(), err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to rate track"})
		return
	}

	log.Printf("✅ RateTrack: rated in %.2fs\n", time.Since(start).Seconds())
	c.JSON(http.StatusOK, gin.H{"success": true})
}

// SaveReviewRequest 리뷰 저장 요청
type SaveReviewRequest struct {
	AlbumSpotifyID string `json:"album_spotify_id" binding:"required"`
	Content        string `json:"content" binding:"required"`
	HasSpoiler     bool   `json:"has_spoiler"`
}

// SaveReview 리뷰 저장
func SaveReview(c *gin.Context) {
	start := time.Now()
	userID := c.GetString("userID")
	authToken := c.GetString("authToken")

	if userID == "" {
		log.Println("❌ SaveReview: Unauthorized - userID missing")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req SaveReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("❌ SaveReview: Invalid request - %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Printf("📝 SaveReview: albumID=%s, hasSpoiler=%v, user=%s\n", req.AlbumSpotifyID, req.HasSpoiler, userID[:8])

	sbClient := supabase.NewClient(authToken)
	review, err := sbClient.SaveReview(req.AlbumSpotifyID, req.Content, req.HasSpoiler, userID)
	if err != nil {
		log.Printf("❌ SaveReview failed after %.2fs: %v\n", time.Since(start).Seconds(), err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save review"})
		return
	}

	log.Printf("✅ SaveReview: saved in %.2fs\n", time.Since(start).Seconds())
	c.JSON(http.StatusOK, review)
}

// UpdateReviewRequest 리뷰 수정 요청
type UpdateReviewRequest struct {
	Content    string `json:"content" binding:"required"`
	HasSpoiler bool   `json:"has_spoiler"`
}

// UpdateReview 리뷰 수정
func UpdateReview(c *gin.Context) {
	start := time.Now()
	userID := c.GetString("userID")
	authToken := c.GetString("authToken")

	if userID == "" {
		log.Println("❌ UpdateReview: Unauthorized - userID missing")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	reviewID := c.Param("id")
	if reviewID == "" {
		log.Println("❌ UpdateReview: Review ID required")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Review ID required"})
		return
	}

	var req UpdateReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("❌ UpdateReview: Invalid request - %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Printf("✏️  UpdateReview: reviewID=%s, hasSpoiler=%v, user=%s\n", reviewID, req.HasSpoiler, userID[:8])

	sbClient := supabase.NewClient(authToken)
	if err := sbClient.UpdateReview(reviewID, req.Content, req.HasSpoiler); err != nil {
		log.Printf("❌ UpdateReview failed after %.2fs: %v\n", time.Since(start).Seconds(), err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update review"})
		return
	}

	log.Printf("✅ UpdateReview: updated in %.2fs\n", time.Since(start).Seconds())
	c.JSON(http.StatusOK, gin.H{"success": true})
}

// DeleteReview 리뷰 삭제
func DeleteReview(c *gin.Context) {
	start := time.Now()
	userID := c.GetString("userID")
	authToken := c.GetString("authToken")

	if userID == "" {
		log.Println("❌ DeleteReview: Unauthorized - userID missing")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	reviewID := c.Param("id")
	if reviewID == "" {
		log.Println("❌ DeleteReview: Review ID required")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Review ID required"})
		return
	}

	log.Printf("🗑️  DeleteReview: reviewID=%s, user=%s\n", reviewID, userID[:8])

	sbClient := supabase.NewClient(authToken)
	if err := sbClient.DeleteReview(reviewID); err != nil {
		log.Printf("❌ DeleteReview failed after %.2fs: %v\n", time.Since(start).Seconds(), err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete review"})
		return
	}

	log.Printf("✅ DeleteReview: deleted in %.2fs\n", time.Since(start).Seconds())
	c.JSON(http.StatusOK, gin.H{"success": true})
}

// GetReview 리뷰 조회
func GetReview(c *gin.Context) {
	userID := c.GetString("userID")
	authToken := c.GetString("authToken")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	albumSpotifyID := c.Param("albumId")
	if albumSpotifyID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Album ID required"})
		return
	}

	sbClient := supabase.NewClient(authToken)
	review, err := sbClient.GetReview(albumSpotifyID, userID)
	if err != nil {
		log.Printf("Get review error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get review"})
		return
	}

	c.JSON(http.StatusOK, review)
}

// GetAlbumStats 음반 통계 조회
func GetAlbumStats(c *gin.Context) {
	userID := c.GetString("userID")
	authToken := c.GetString("authToken")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	albumSpotifyID := c.Param("albumId")
	if albumSpotifyID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Album ID required"})
		return
	}

	sbClient := supabase.NewClient(authToken)
	stats, err := sbClient.GetAlbumStats(albumSpotifyID, userID)
	if err != nil {
		log.Printf("Get album stats error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get album stats"})
		return
	}

	c.JSON(http.StatusOK, stats)
}
