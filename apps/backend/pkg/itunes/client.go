package itunes

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const baseURL = "https://itunes.apple.com"

type Client struct {
	httpClient *http.Client
}

func NewClient() *Client {
	return &Client{
		httpClient: &http.Client{Timeout: 10 * time.Second},
	}
}

type searchResponse struct {
	ResultCount int            `json:"resultCount"`
	Results     []searchResult `json:"results"`
}

type searchResult struct {
	WrapperType      string `json:"wrapperType"`
	CollectionID     int64  `json:"collectionId"`
	ArtistID         int64  `json:"artistId"`
	ArtistName       string `json:"artistName"`
	CollectionName   string `json:"collectionName"`
	ArtworkUrl100    string `json:"artworkUrl100"`
	ReleaseDate      string `json:"releaseDate"`
	PrimaryGenreName string `json:"primaryGenreName"`
	TrackID          int64  `json:"trackId"`
	TrackName        string `json:"trackName"`
	TrackTimeMillis  int    `json:"trackTimeMillis"`
	TrackNumber      int    `json:"trackNumber"`
}

type Album struct {
	ID          string
	Title       string
	Artist      string
	ImageURL    string
	ReleaseDate string
	Genres      []string
}

type Track struct {
	ID          string
	Title       string
	Artist      string
	AlbumTitle  string
	AlbumID     string
	DurationMs  int
	TrackNumber int
	ImageURL    string
}

type Artist struct {
	ID    string
	Name  string
	Genre string
}

func (c *Client) SearchAlbums(query string, limit int) ([]Album, error) {
	params := url.Values{}
	params.Set("term", query)
	params.Set("entity", "album")
	params.Set("media", "music")
	params.Set("limit", fmt.Sprintf("%d", limit))

	resp, err := c.httpClient.Get(fmt.Sprintf("%s/search?%s", baseURL, params.Encode()))
	if err != nil {
		return nil, fmt.Errorf("search request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("search failed with status %d: %s", resp.StatusCode, string(body))
	}

	var sr searchResponse
	if err := json.NewDecoder(resp.Body).Decode(&sr); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	albums := make([]Album, 0, len(sr.Results))
	for _, r := range sr.Results {
		if r.WrapperType != "collection" {
			continue
		}
		albums = append(albums, Album{
			ID:          fmt.Sprintf("%d", r.CollectionID),
			Title:       r.CollectionName,
			Artist:      r.ArtistName,
			ImageURL:    highResArtwork(r.ArtworkUrl100),
			ReleaseDate: parseDate(r.ReleaseDate),
			Genres:      []string{r.PrimaryGenreName},
		})
	}

	return albums, nil
}

func (c *Client) SearchTracks(query string, limit int) ([]Track, error) {
	params := url.Values{}
	params.Set("term", query)
	params.Set("entity", "song")
	params.Set("media", "music")
	params.Set("limit", fmt.Sprintf("%d", limit))

	resp, err := c.httpClient.Get(fmt.Sprintf("%s/search?%s", baseURL, params.Encode()))
	if err != nil {
		return nil, fmt.Errorf("track search request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("track search failed with status %d: %s", resp.StatusCode, string(body))
	}

	var sr searchResponse
	if err := json.NewDecoder(resp.Body).Decode(&sr); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	tracks := make([]Track, 0, len(sr.Results))
	for _, r := range sr.Results {
		if r.WrapperType != "track" {
			continue
		}
		tracks = append(tracks, Track{
			ID:          fmt.Sprintf("%d", r.TrackID),
			Title:       r.TrackName,
			Artist:      r.ArtistName,
			AlbumTitle:  r.CollectionName,
			AlbumID:     fmt.Sprintf("%d", r.CollectionID),
			DurationMs:  r.TrackTimeMillis,
			TrackNumber: r.TrackNumber,
			ImageURL:    highResArtwork(r.ArtworkUrl100),
		})
	}

	return tracks, nil
}

func (c *Client) SearchArtists(query string, limit int) ([]Artist, error) {
	params := url.Values{}
	params.Set("term", query)
	params.Set("entity", "musicArtist")
	params.Set("media", "music")
	params.Set("limit", fmt.Sprintf("%d", limit))

	resp, err := c.httpClient.Get(fmt.Sprintf("%s/search?%s", baseURL, params.Encode()))
	if err != nil {
		return nil, fmt.Errorf("artist search request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("artist search failed with status %d: %s", resp.StatusCode, string(body))
	}

	var sr searchResponse
	if err := json.NewDecoder(resp.Body).Decode(&sr); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	artists := make([]Artist, 0, len(sr.Results))
	for _, r := range sr.Results {
		if r.WrapperType != "artist" {
			continue
		}
		artists = append(artists, Artist{
			ID:    fmt.Sprintf("%d", r.ArtistID),
			Name:  r.ArtistName,
			Genre: r.PrimaryGenreName,
		})
	}

	return artists, nil
}

func (c *Client) GetAlbumWithTracks(collectionID string) (*Album, []Track, error) {
	params := url.Values{}
	params.Set("id", collectionID)
	params.Set("entity", "song")

	resp, err := c.httpClient.Get(fmt.Sprintf("%s/lookup?%s", baseURL, params.Encode()))
	if err != nil {
		return nil, nil, fmt.Errorf("lookup request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, nil, fmt.Errorf("lookup failed with status %d: %s", resp.StatusCode, string(body))
	}

	var sr searchResponse
	if err := json.NewDecoder(resp.Body).Decode(&sr); err != nil {
		return nil, nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if len(sr.Results) == 0 {
		return nil, nil, fmt.Errorf("album not found")
	}

	var album *Album
	var tracks []Track

	for _, r := range sr.Results {
		switch r.WrapperType {
		case "collection":
			album = &Album{
				ID:          fmt.Sprintf("%d", r.CollectionID),
				Title:       r.CollectionName,
				Artist:      r.ArtistName,
				ImageURL:    highResArtwork(r.ArtworkUrl100),
				ReleaseDate: parseDate(r.ReleaseDate),
				Genres:      []string{r.PrimaryGenreName},
			}
		case "track":
			tracks = append(tracks, Track{
				ID:          fmt.Sprintf("%d", r.TrackID),
				Title:       r.TrackName,
				Artist:      r.ArtistName,
				DurationMs:  r.TrackTimeMillis,
				TrackNumber: r.TrackNumber,
			})
		}
	}

	if album == nil {
		return nil, nil, fmt.Errorf("album not found in response")
	}

	return album, tracks, nil
}

func highResArtwork(url string) string {
	if url == "" {
		return ""
	}
	return strings.Replace(url, "100x100", "600x600", 1)
}

func parseDate(raw string) string {
	if len(raw) >= 10 {
		return raw[:10]
	}
	return raw
}
