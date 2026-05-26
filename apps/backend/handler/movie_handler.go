package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"

	"github.com/gin-gonic/gin"
)

const tmdbBase = "https://api.themoviedb.org/3"

func tmdbGet(path string) (*http.Response, error) {
	key := os.Getenv("TMDB_API_KEY")
	sep := "?"
	if len(path) > 0 {
		for _, c := range path {
			if c == '?' {
				sep = "&"
				break
			}
		}
	}
	return http.Get(fmt.Sprintf("%s%s%sapi_key=%s&language=ko-KR", tmdbBase, path, sep, key))
}

func SearchMovies(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "q is required"})
		return
	}

	resp, err := tmdbGet("/search/movie?query=" + url.QueryEscape(query))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer resp.Body.Close()

	var result map[string]any
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, result)
}

func GetMovieDetail(c *gin.Context) {
	tmdbId := c.Param("tmdbId")

	resp, err := tmdbGet("/movie/" + tmdbId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer resp.Body.Close()

	var result map[string]any
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, result)
}
