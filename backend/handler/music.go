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
		log.Println("Warning: SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET not set")
		return
	}

	spotifyClient = spotify.NewClient(clientID, clientSecret)

	// 초기 인증 시도
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

// SearchAlbums 음반 검색
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

	// Spotify API 호출
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

// GetAlbumDetail 음반 상세 정보 (곡목 포함)
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

	// Spotify API 호출
	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	album, tracks, err := spotifyClient.GetAlbumWithTracks(ctx, spotifyID)
	if err != nil {
		log.Printf("Spotify album fetch error: %v\n", err)
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

	c.JSON(http.StatusOK, albumData)
}

// RateTrackRequest 곡 평가 요청
type RateTrackRequest struct {
	TrackSpotifyID string `json:"track_spotify_id" binding:"required"`
	Rating         int    `json:"rating" binding:"required,min=0,max=5"`
}

// RateTrack 곡 평가
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

	sbClient := supabase.NewClient(userID)
	if err := sbClient.RateTrack(req.TrackSpotifyID, req.Rating, userID); err != nil {
		log.Printf("Rate track error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to rate track"})
		return
	}

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
	userID := c.GetString("userID")
	authToken := c.GetString("authToken")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req SaveReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	sbClient := supabase.NewClient(authToken)
	review, err := sbClient.SaveReview(req.AlbumSpotifyID, req.Content, req.HasSpoiler, userID)
	if err != nil {
		log.Printf("Save review error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save review"})
		return
	}

	c.JSON(http.StatusOK, review)
}

// UpdateReviewRequest 리뷰 수정 요청
type UpdateReviewRequest struct {
	Content    string `json:"content" binding:"required"`
	HasSpoiler bool   `json:"has_spoiler"`
}

// UpdateReview 리뷰 수정
func UpdateReview(c *gin.Context) {
	userID := c.GetString("userID")
	authToken := c.GetString("authToken")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	reviewID := c.Param("id")
	if reviewID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Review ID required"})
		return
	}

	var req UpdateReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	sbClient := supabase.NewClient(authToken)
	if err := sbClient.UpdateReview(reviewID, req.Content, req.HasSpoiler); err != nil {
		log.Printf("Update review error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update review"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// DeleteReview 리뷰 삭제
func DeleteReview(c *gin.Context) {
	userID := c.GetString("userID")
	authToken := c.GetString("authToken")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	reviewID := c.Param("id")
	if reviewID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Review ID required"})
		return
	}

	sbClient := supabase.NewClient(authToken)
	if err := sbClient.DeleteReview(reviewID); err != nil {
		log.Printf("Delete review error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete review"})
		return
	}

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
