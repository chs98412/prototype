package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/chs98412/prototype/backend/domain"
	"github.com/chs98412/prototype/backend/domain/entity"
	domainrepo "github.com/chs98412/prototype/backend/domain/repository"
	"github.com/chs98412/prototype/backend/pkg/supabase"
)

// RecordRepositoryImpl implements RecordRepository interface
type RecordRepositoryImpl struct {
	db *supabase.Client
}

// NewRecordRepository creates a new record repository
func NewRecordRepository(db *supabase.Client) domainrepo.RecordRepository {
	return &RecordRepositoryImpl{db: db}
}

// GetByID retrieves a record by ID
func (r *RecordRepositoryImpl) GetByID(ctx context.Context, recordID, userID string) (*entity.Record, error) {
	result, err := r.db.Query(
		"SELECT * FROM user_records WHERE id = $1 AND user_id = $2",
		recordID, userID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query record: %w", err)
	}

	var records []map[string]interface{}
	if err := json.Unmarshal(result, &records); err != nil {
		return nil, fmt.Errorf("failed to parse record: %w", err)
	}

	if len(records) == 0 {
		return nil, domain.ErrNotFound
	}

	return r.mapToEntity(records[0]), nil
}

// GetByTMDBID retrieves a record by TMDB ID
func (r *RecordRepositoryImpl) GetByTMDBID(ctx context.Context, userID string, tmdbID int) (*entity.Record, error) {
	result, err := r.db.Query(
		"SELECT * FROM user_records WHERE user_id = $1 AND tmdb_id = $2",
		userID, tmdbID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query record: %w", err)
	}

	var records []map[string]interface{}
	if err := json.Unmarshal(result, &records); err != nil {
		return nil, fmt.Errorf("failed to parse record: %w", err)
	}

	if len(records) == 0 {
		return nil, domain.ErrNotFound
	}

	return r.mapToEntity(records[0]), nil
}

// List retrieves records with filters
func (r *RecordRepositoryImpl) List(ctx context.Context, userID string, filters domainrepo.RecordFilters) ([]entity.Record, error) {
	query := "SELECT * FROM user_records WHERE user_id = $1"
	args := []interface{}{userID}
	argCount := 2

	if filters.Status != "" {
		query += fmt.Sprintf(" AND status = $%d", argCount)
		args = append(args, filters.Status)
		argCount++
	}
	if filters.MediaType != "" {
		query += fmt.Sprintf(" AND media_type = $%d", argCount)
		args = append(args, filters.MediaType)
		argCount++
	}

	query += " ORDER BY updated_at DESC"

	if filters.Limit > 0 {
		query += fmt.Sprintf(" LIMIT $%d", argCount)
		args = append(args, filters.Limit)
		argCount++
	}
	if filters.Offset > 0 {
		query += fmt.Sprintf(" OFFSET $%d", argCount)
		args = append(args, filters.Offset)
	}

	result, err := r.db.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query records: %w", err)
	}

	var records []map[string]interface{}
	if err := json.Unmarshal(result, &records); err != nil {
		return nil, fmt.Errorf("failed to parse records: %w", err)
	}

	entities := make([]entity.Record, 0, len(records))
	for _, record := range records {
		entities = append(entities, *r.mapToEntity(record))
	}

	return entities, nil
}

// Save creates a new record (upsert)
func (r *RecordRepositoryImpl) Save(ctx context.Context, record *entity.Record) error {
	result, err := r.db.Query(
		`INSERT INTO user_records (id, user_id, tmdb_id, media_type, status, rating, watched_at, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		 ON CONFLICT (user_id, tmdb_id) DO UPDATE SET
		   status = $5, rating = $6, watched_at = $7, updated_at = $9
		 RETURNING id`,
		record.ID, record.UserID, record.TMDBID, record.MediaType, record.Status,
		record.Rating, record.WatchedAt, record.CreatedAt, record.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to save record: %w", err)
	}

	var saved []map[string]interface{}
	if err := json.Unmarshal(result, &saved); err != nil {
		return fmt.Errorf("failed to parse result: %w", err)
	}

	if len(saved) == 0 {
		return fmt.Errorf("record not created")
	}

	return nil
}

// Update updates an existing record
func (r *RecordRepositoryImpl) Update(ctx context.Context, record *entity.Record) error {
	result, err := r.db.Query(
		`UPDATE user_records
		 SET status = $1, rating = $2, watched_at = $3, updated_at = $4
		 WHERE id = $5 AND user_id = $6 RETURNING id`,
		record.Status, record.Rating, record.WatchedAt, record.UpdatedAt, record.ID, record.UserID,
	)
	if err != nil {
		return fmt.Errorf("failed to update record: %w", err)
	}

	var updated []map[string]interface{}
	if err := json.Unmarshal(result, &updated); err != nil {
		return fmt.Errorf("failed to parse result: %w", err)
	}

	if len(updated) == 0 {
		return fmt.Errorf("record not found")
	}

	return nil
}

// Delete removes a record
func (r *RecordRepositoryImpl) Delete(ctx context.Context, recordID, userID string) error {
	err := r.db.Exec("DELETE FROM user_records WHERE id = $1 AND user_id = $2", recordID, userID)
	if err != nil {
		return fmt.Errorf("failed to delete record: %w", err)
	}
	return nil
}

// DeleteByTMDB removes a record by TMDB ID
func (r *RecordRepositoryImpl) DeleteByTMDB(ctx context.Context, userID string, tmdbID int) error {
	err := r.db.Exec("DELETE FROM user_records WHERE user_id = $1 AND tmdb_id = $2", userID, tmdbID)
	if err != nil {
		return fmt.Errorf("failed to delete record: %w", err)
	}
	return nil
}

// GetStats retrieves user's watch statistics
func (r *RecordRepositoryImpl) GetStats(ctx context.Context, userID string) (*entity.RecordStatsDTO, error) {
	query := `
		SELECT
			COUNT(*) as total_records,
			COUNT(CASE WHEN media_type = 'movie' THEN 1 END) as movies_watched,
			COUNT(CASE WHEN media_type = 'tv' THEN 1 END) as shows_watched,
			COALESCE(AVG(CASE WHEN rating > 0 THEN rating ELSE NULL END), 0) as average_rating,
			COALESCE(MAX(rating), 0) as highest_rating,
			COUNT(CASE WHEN rating > 0 THEN 1 END) as rated_count
		FROM user_records
		WHERE user_id = $1
	`

	result, err := r.db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to query stats: %w", err)
	}

	var stats []map[string]interface{}
	if err := json.Unmarshal(result, &stats); err != nil {
		return nil, fmt.Errorf("failed to parse stats: %w", err)
	}

	if len(stats) == 0 {
		return &entity.RecordStatsDTO{}, nil
	}

	return r.mapStatsToDTO(stats[0]), nil
}

// Helper: map database result to entity
func (r *RecordRepositoryImpl) mapToEntity(data map[string]interface{}) *entity.Record {
	record := &entity.Record{}

	if v, ok := data["id"].(string); ok {
		record.ID = v
	}
	if v, ok := data["user_id"].(string); ok {
		record.UserID = v
	}
	if v, ok := data["tmdb_id"].(float64); ok {
		record.TMDBID = int(v)
	}
	if v, ok := data["media_type"].(string); ok {
		record.MediaType = v
	}
	if v, ok := data["status"].(string); ok {
		record.Status = entity.RecordStatus(v)
	}
	if v, ok := data["rating"].(float64); ok {
		record.Rating = int(v)
	}

	return record
}

// Helper: map stats result to DTO
func (r *RecordRepositoryImpl) mapStatsToDTO(data map[string]interface{}) *entity.RecordStatsDTO {
	stats := &entity.RecordStatsDTO{}

	if v, ok := data["total_records"].(float64); ok {
		stats.TotalRecords = int(v)
	}
	if v, ok := data["movies_watched"].(float64); ok {
		stats.MoviesWatched = int(v)
	}
	if v, ok := data["shows_watched"].(float64); ok {
		stats.ShowsWatched = int(v)
	}
	if v, ok := data["average_rating"].(float64); ok {
		stats.AverageRating = v
	}
	if v, ok := data["highest_rating"].(float64); ok {
		stats.HighestRating = int(v)
	}
	if v, ok := data["rated_count"].(float64); ok {
		stats.RatedCount = int(v)
	}

	return stats
}
