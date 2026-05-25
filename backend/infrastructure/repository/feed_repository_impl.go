package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/chs98412/prototype/backend/domain/entity"
	domainrepo "github.com/chs98412/prototype/backend/domain/repository"
	"github.com/chs98412/prototype/backend/pkg/supabase"
)

// FeedRepositoryImpl implements FeedRepository interface
type FeedRepositoryImpl struct {
	db *supabase.Client
}

// NewFeedRepository creates a new feed repository
func NewFeedRepository(db *supabase.Client) domainrepo.FeedRepository {
	return &FeedRepositoryImpl{db: db}
}

// GetFeed retrieves friend's activity feed
func (r *FeedRepositoryImpl) GetFeed(ctx context.Context, userID string, limit, offset int) ([]entity.FeedItem, error) {
	result, err := r.db.Query(
		`SELECT id, user_id, tmdb_id, media_type, title, poster_path, rating, watched_at
		 FROM user_records
		 WHERE user_id IN (
			SELECT following_id FROM user_follows
			WHERE follower_id = $1
		 )
		 ORDER BY watched_at DESC
		 LIMIT $2 OFFSET $3`,
		userID, limit, offset,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query feed: %w", err)
	}

	var items []map[string]interface{}
	if err := json.Unmarshal(result, &items); err != nil {
		return nil, fmt.Errorf("failed to parse feed: %w", err)
	}

	entities := make([]entity.FeedItem, 0, len(items))
	for _, item := range items {
		entities = append(entities, *r.mapToEntity(item))
	}

	return entities, nil
}

// Helper: map database result to entity
func (r *FeedRepositoryImpl) mapToEntity(data map[string]interface{}) *entity.FeedItem {
	item := &entity.FeedItem{}

	if v, ok := data["id"].(string); ok {
		item.ID = v
	}
	if v, ok := data["user_id"].(string); ok {
		item.UserID = v
	}
	if v, ok := data["tmdb_id"].(string); ok {
		item.TMDBID = v
	}
	if v, ok := data["media_type"].(string); ok {
		item.MediaType = v
	}
	if v, ok := data["title"].(string); ok {
		item.Title = v
	}
	if v, ok := data["poster_path"].(string); ok {
		item.PosterPath = v
	}
	if v, ok := data["rating"].(float64); ok {
		item.Rating = int(v)
	}

	return item
}
