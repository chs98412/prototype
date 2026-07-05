package repository

import (
	"context"
	"fmt"

	"github.com/chs98412/prototype/backend/domain/entity"
	domainrepo "github.com/chs98412/prototype/backend/domain/repository"
	"gorm.io/gorm"
)

// FeedRepositoryImpl implements FeedRepository interface
type FeedRepositoryImpl struct {
	db *gorm.DB
}

// NewFeedRepository creates a new feed repository
func NewFeedRepository(db *gorm.DB) domainrepo.FeedRepository {
	return &FeedRepositoryImpl{db: db}
}

// GetFeed retrieves friend's activity feed (legacy)
func (r *FeedRepositoryImpl) GetFeed(ctx context.Context, userID string, limit, offset int) ([]entity.FeedItem, error) {
	var items []entity.FeedItem
	if err := r.db.WithContext(ctx).
		Where("user_id IN (SELECT following_id FROM user_follows WHERE follower_id = ?)", userID).
		Order("watched_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&items).Error; err != nil {
		return nil, fmt.Errorf("failed to query feed: %w", err)
	}
	return items, nil
}

// GetSocialFeed retrieves a mixed social feed of reviews and records from followed users
func (r *FeedRepositoryImpl) GetSocialFeed(ctx context.Context, userID string, limit, offset int) ([]entity.SocialFeedItem, error) {
	var items []entity.SocialFeedItem

	query := `
		SELECT
			r.kind,
			r.id,
			r.user_id,
			COALESCE(p.display_name, '') AS display_name,
			COALESCE(p.avatar_url, '') AS avatar_url,
			r.tmdb_id,
			COALESCE(m.title, '') AS title,
			COALESCE(r.title, '') AS review_title,
			COALESCE(m.poster_path, '') AS poster_path,
			r.content,
			r.like_count,
			COALESCE(CAST(rec.rating AS INTEGER), 0) AS rating,
			r.is_spoiler AS spoiler,
			r.created_at AS event_time
		FROM reviews r
		LEFT JOIN user_records rec ON rec.user_id = r.user_id AND rec.tmdb_id = r.tmdb_id
		LEFT JOIN user_profiles p ON p.user_id = r.user_id
		LEFT JOIN movies m ON m.id = r.tmdb_id
		WHERE r.user_id = ? OR r.user_id IN (
			SELECT following_id FROM user_follows WHERE follower_id = ?
		)

		UNION ALL

		SELECT
			'log' AS kind,
			rec.id,
			rec.user_id,
			COALESCE(p.display_name, '') AS display_name,
			COALESCE(p.avatar_url, '') AS avatar_url,
			rec.tmdb_id,
			COALESCE(m.title, '') AS title,
			'' AS review_title,
			COALESCE(m.poster_path, '') AS poster_path,
			NULL AS content,
			0 AS like_count,
			CAST(rec.rating AS INTEGER) AS rating,
			NULL::bool AS spoiler,
			rec.created_at AS event_time
		FROM user_records rec
		LEFT JOIN user_profiles p ON p.user_id = rec.user_id
		LEFT JOIN movies m ON m.id = rec.tmdb_id
		WHERE (rec.user_id = ? OR rec.user_id IN (
			SELECT following_id FROM user_follows WHERE follower_id = ?
		))
		AND NOT EXISTS (
			SELECT 1 FROM reviews r WHERE r.user_id = rec.user_id AND r.tmdb_id = rec.tmdb_id
		)

		ORDER BY event_time DESC
		LIMIT ? OFFSET ?
	`

	if err := r.db.WithContext(ctx).Raw(query, userID, userID, userID, userID, limit, offset).Scan(&items).Error; err != nil {
		return nil, fmt.Errorf("failed to query social feed: %w", err)
	}
	return items, nil
}
