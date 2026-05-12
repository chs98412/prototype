package spotify

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
)

const (
	SpotifyAuthURL   = "https://accounts.spotify.com/api/token"
	SpotifyAPIURL    = "https://api.spotify.com/v1"
	SearchEndpoint   = "/search"
	AlbumEndpoint    = "/albums"
)

type Client struct {
	httpClient   *http.Client
	clientID     string
	clientSecret string
	accessToken  string
}

type TokenResponse struct {
	AccessToken string `json:"access_token"`
	ExpiresIn   int    `json:"expires_in"`
	TokenType   string `json:"token_type"`
}

type Album struct {
	ID           string   `json:"id"`
	URI          string   `json:"uri"`
	Name         string   `json:"name"`
	Artists      []Artist `json:"artists"`
	ReleaseDate  string   `json:"release_date"`
	Images       []Image  `json:"images"`
	Genres       []string `json:"genres"`
	TotalTracks  int      `json:"total_tracks"`
	ExternalURLs struct {
		Spotify string `json:"spotify"`
	} `json:"external_urls"`
}

type Artist struct {
	Name string `json:"name"`
}

type Image struct {
	URL    string `json:"url"`
	Height int    `json:"height"`
	Width  int    `json:"width"`
}

type Track struct {
	ID       string `json:"id"`
	URI      string `json:"uri"`
	Name     string `json:"name"`
	Artists  []Artist `json:"artists"`
	Duration int    `json:"duration_ms"`
	TrackNumber int `json:"track_number"`
}

type Tracks struct {
	Items []Track `json:"items"`
}

type AlbumDetail struct {
	Album
	Tracks Tracks `json:"tracks"`
}

type SearchResponse struct {
	Albums struct {
		Items []Album `json:"items"`
	} `json:"albums"`
}

// NewClient 초기화
func NewClient(clientID, clientSecret string) *Client {
	return &Client{
		httpClient:   &http.Client{},
		clientID:     clientID,
		clientSecret: clientSecret,
	}
}

// Authenticate Spotify API 토큰 획득
func (c *Client) Authenticate(ctx context.Context) error {
	auth := c.clientID + ":" + c.clientSecret
	encoded := base64.StdEncoding.EncodeToString([]byte(auth))

	data := url.Values{}
	data.Set("grant_type", "client_credentials")

	req, err := http.NewRequestWithContext(ctx, "POST", SpotifyAuthURL, strings.NewReader(data.Encode()))
	if err != nil {
		return fmt.Errorf("failed to create auth request: %w", err)
	}

	req.Header.Add("Authorization", "Basic "+encoded)
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("auth request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("auth failed with status %d: %s", resp.StatusCode, string(body))
	}

	var tokenResp TokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return fmt.Errorf("failed to decode token response: %w", err)
	}

	c.accessToken = tokenResp.AccessToken
	return nil
}

// SearchAlbums 음반 검색
func (c *Client) SearchAlbums(ctx context.Context, query string, limit int) ([]Album, error) {
	if c.accessToken == "" {
		return nil, fmt.Errorf("not authenticated")
	}

	params := url.Values{}
	params.Add("q", query)
	params.Add("type", "album")
	params.Add("limit", fmt.Sprintf("%d", limit))

	url := fmt.Sprintf("%s%s?%s", SpotifyAPIURL, SearchEndpoint, params.Encode())

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create search request: %w", err)
	}

	req.Header.Add("Authorization", "Bearer "+c.accessToken)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("search request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("search failed with status %d: %s", resp.StatusCode, string(body))
	}

	var searchResp SearchResponse
	if err := json.NewDecoder(resp.Body).Decode(&searchResp); err != nil {
		return nil, fmt.Errorf("failed to decode search response: %w", err)
	}

	return searchResp.Albums.Items, nil
}

// GetAlbumWithTracks 음반과 곡목 조회
func (c *Client) GetAlbumWithTracks(ctx context.Context, spotifyID string) (*Album, []Track, error) {
	if c.accessToken == "" {
		return nil, nil, fmt.Errorf("not authenticated")
	}

	url := fmt.Sprintf("%s%s/%s", SpotifyAPIURL, AlbumEndpoint, spotifyID)

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to create album request: %w", err)
	}

	req.Header.Add("Authorization", "Bearer "+c.accessToken)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, nil, fmt.Errorf("album request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, nil, fmt.Errorf("album request failed with status %d: %s", resp.StatusCode, string(body))
	}

	var albumDetail AlbumDetail
	if err := json.NewDecoder(resp.Body).Decode(&albumDetail); err != nil {
		return nil, nil, fmt.Errorf("failed to decode album response: %w", err)
	}

	return &albumDetail.Album, albumDetail.Tracks.Items, nil
}

// GetAlbum 음반만 조회
func (c *Client) GetAlbum(ctx context.Context, spotifyID string) (*Album, error) {
	album, _, err := c.GetAlbumWithTracks(ctx, spotifyID)
	return album, err
}
