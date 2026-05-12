package handler

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/chs98412/prototype/backend/pkg/spotify"
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
