package supabase

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
)

type Client struct {
	baseURL    string
	apiKey     string
	serviceKey string
	userID     string
	httpClient *http.Client
}

func NewClient(userID string) *Client {
	baseURL := os.Getenv("SUPABASE_URL")
	serviceKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")
	apiKey := os.Getenv("SUPABASE_ANON_KEY")

	if baseURL == "" {
		baseURL = "http://localhost:54321"
	}

	if serviceKey == "" {
		serviceKey = apiKey
	}

	return &Client{
		baseURL:    baseURL,
		apiKey:     apiKey,
		serviceKey: serviceKey,
		userID:     userID,
		httpClient: &http.Client{},
	}
}

func (c *Client) do(method, path string, body interface{}, params ...string) ([]byte, error) {
	fullURL := c.baseURL + "/rest/v1" + path

	if len(params) > 0 && params[0] != "" {
		fullURL += "?" + params[0]
	}

	var bodyReader io.Reader
	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		bodyReader = bytes.NewReader(jsonBody)
	}

	req, err := http.NewRequest(method, fullURL, bodyReader)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("apikey", c.apiKey)
	req.Header.Set("Authorization", "Bearer "+c.serviceKey)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("supabase error: %s (status: %d)", string(respBody), resp.StatusCode)
	}

	return respBody, nil
}

func (c *Client) RateTrack(trackSpotifyID string, rating int, userID string) error {
	body := map[string]interface{}{
		"track_spotify_id": trackSpotifyID,
		"rating":           rating,
		"user_id":          userID,
		"listened_at":      "now()",
	}

	_, err := c.do("POST", "/track_records", body, "")
	return err
}

func (c *Client) SaveReview(albumSpotifyID, content string, hasSpoiler bool, userID string) (map[string]interface{}, error) {
	body := map[string]interface{}{
		"album_spotify_id": albumSpotifyID,
		"content":          content,
		"has_spoiler":      hasSpoiler,
		"user_id":          userID,
	}

	resp, err := c.do("POST", "/album_reviews", body, "")
	if err != nil {
		return nil, err
	}

	var result []map[string]interface{}
	if err := json.Unmarshal(resp, &result); err != nil {
		return nil, err
	}

	if len(result) > 0 {
		return result[0], nil
	}
	return nil, nil
}

func (c *Client) UpdateReview(reviewID string, content string, hasSpoiler bool) error {
	body := map[string]interface{}{
		"content":     content,
		"has_spoiler": hasSpoiler,
	}

	_, err := c.do("PATCH", "/album_reviews", body, fmt.Sprintf("id=eq.%s", url.QueryEscape(reviewID)))
	return err
}

func (c *Client) DeleteReview(reviewID string) error {
	_, err := c.do("DELETE", "/album_reviews", nil, fmt.Sprintf("id=eq.%s", url.QueryEscape(reviewID)))
	return err
}

func (c *Client) GetReview(albumSpotifyID, userID string) (map[string]interface{}, error) {
	query := fmt.Sprintf("album_spotify_id=eq.%s&user_id=eq.%s", url.QueryEscape(albumSpotifyID), url.QueryEscape(userID))
	resp, err := c.do("GET", "/album_reviews", nil, query)
	if err != nil {
		return nil, err
	}

	var result []map[string]interface{}
	if err := json.Unmarshal(resp, &result); err != nil {
		return nil, err
	}

	if len(result) > 0 {
		return result[0], nil
	}
	return nil, nil
}

func (c *Client) GetAlbumStats(albumSpotifyID, userID string) (map[string]interface{}, error) {
	query := fmt.Sprintf("album_spotify_id=eq.%s&user_id=eq.%s", url.QueryEscape(albumSpotifyID), url.QueryEscape(userID))
	resp, err := c.do("GET", "/user_album_stats", nil, query)
	if err != nil {
		return nil, err
	}

	var result []map[string]interface{}
	if err := json.Unmarshal(resp, &result); err != nil {
		return nil, err
	}

	if len(result) > 0 {
		return result[0], nil
	}

	return map[string]interface{}{
		"rated_tracks":  0,
		"total_tracks":  0,
		"avg_rating":    0,
		"listen_days":   0,
		"last_listened": nil,
	}, nil
}
