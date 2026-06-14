package repository

import (
	"context"
	"errors"
	"fmt"
	"github.com/chs98412/prototype/backend/domain"
	"github.com/chs98412/prototype/backend/domain/entity"
	domainrepo "github.com/chs98412/prototype/backend/domain/repository"
	"gorm.io/gorm"
)

// RecordRepositoryImpl implements RecordRepository interface
type RecordRepositoryImpl struct {
	db *gorm.DB
}

// NewRecordRepository creates a new record repository
func NewRecordRepository(db *gorm.DB) domainrepo.RecordRepository {
	return &RecordRepositoryImpl{db: db}
}

// GetByID retrieves a record by ID
func (r *RecordRepositoryImpl) GetByID(ctx context.Context, recordID, userID string) (*entity.Record, error) {
	record := &entity.Record{}
	if err := r.db.WithContext(ctx).Where("id = ? AND user_id = ?", recordID, userID).First(record).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("failed to query record: %w", err)
	}
	return record, nil
}

// GetByTMDBID retrieves a record by TMDB ID
func (r *RecordRepositoryImpl) GetByTMDBID(ctx context.Context, userID string, tmdbID int) (*entity.Record, error) {
	record := &entity.Record{}
	if err := r.db.WithContext(ctx).Where("user_id = ? AND tmdb_id = ?", userID, tmdbID).First(record).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("failed to query record: %w", err)
	}
	return record, nil
}

// List retrieves records with filters
func (r *RecordRepositoryImpl) List(ctx context.Context, userID string, filters domainrepo.RecordFilters) ([]entity.Record, error) {
	var records []entity.Record

	whereClause := "ur.user_id = ?"
	args := []interface{}{userID}

	if filters.Status != "" {
		whereClause += " AND ur.status = ?"
		args = append(args, filters.Status)
	}
	if filters.MediaType != "" {
		whereClause += " AND ur.media_type = ?"
		args = append(args, filters.MediaType)
	}

	orderClause := "ur.updated_at DESC"
	limitClause := ""
	offsetClause := ""

	if filters.Limit > 0 {
		limitClause = fmt.Sprintf(" LIMIT %d", filters.Limit)
	}
	if filters.Offset > 0 {
		offsetClause = fmt.Sprintf(" OFFSET %d", filters.Offset)
	}

	sql := fmt.Sprintf(`
		SELECT
			ur.id, ur.user_id, ur.tmdb_id, ur.media_type, ur.status,
			CAST(ur.rating AS INTEGER) as rating,
			COALESCE(m.title, '') as title,
			COALESCE(m.poster_path, '') as poster_path,
			ur.created_at, ur.updated_at
		FROM user_records ur
		LEFT JOIN movies m ON m.id = ur.tmdb_id
		WHERE %s
		ORDER BY %s%s%s
	`, whereClause, orderClause, limitClause, offsetClause)

	if err := r.db.WithContext(ctx).Raw(sql, args...).Scan(&records).Error; err != nil {
		return nil, fmt.Errorf("failed to query records: %w", err)
	}

	return records, nil
}

// Save creates a new record (upsert)
func (r *RecordRepositoryImpl) Save(ctx context.Context, record *entity.Record) error {
	if err := r.db.WithContext(ctx).Save(record).Error; err != nil {
		return fmt.Errorf("failed to save record: %w", err)
	}
	return nil
}

// Update updates an existing record
func (r *RecordRepositoryImpl) Update(ctx context.Context, record *entity.Record) error {
	result := r.db.WithContext(ctx).Where("id = ? AND user_id = ?", record.ID, record.UserID).
		Updates(record)
	if result.Error != nil {
		return fmt.Errorf("failed to update record: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("record not found")
	}
	return nil
}

// Delete removes a record
func (r *RecordRepositoryImpl) Delete(ctx context.Context, recordID, userID string) error {
	if err := r.db.WithContext(ctx).Where("id = ? AND user_id = ?", recordID, userID).Delete(&entity.Record{}).Error; err != nil {
		return fmt.Errorf("failed to delete record: %w", err)
	}
	return nil
}

// DeleteByTMDB removes a record by TMDB ID
func (r *RecordRepositoryImpl) DeleteByTMDB(ctx context.Context, userID string, tmdbID int) error {
	if err := r.db.WithContext(ctx).Where("user_id = ? AND tmdb_id = ?", userID, tmdbID).Delete(&entity.Record{}).Error; err != nil {
		return fmt.Errorf("failed to delete record: %w", err)
	}
	return nil
}

// GetStats retrieves user's watch statistics
func (r *RecordRepositoryImpl) GetStats(ctx context.Context, userID string) (*entity.RecordStatsDTO, error) {
	stats := &entity.RecordStatsDTO{}
	err := r.db.WithContext(ctx).
		Table("user_records").
		Select(
			"COUNT(*)::INTEGER as total_records",
			"COUNT(CASE WHEN media_type = 'movie' THEN 1 END)::INTEGER as movies_watched",
			"COUNT(CASE WHEN media_type = 'tv' THEN 1 END)::INTEGER as shows_watched",
			"COALESCE(AVG(CASE WHEN rating > 0 THEN CAST(rating AS NUMERIC) ELSE NULL END), 0)::NUMERIC as average_rating",
			"COALESCE(MAX(CAST(rating AS INTEGER)), 0)::INTEGER as highest_rating",
			"COUNT(CASE WHEN rating > 0 THEN 1 END)::INTEGER as rated_count",
		).
		Where("user_id = ?", userID).
		Scan(stats).Error

	if err != nil {
		return nil, fmt.Errorf("failed to query stats: %w", err)
	}

	return stats, nil
}
