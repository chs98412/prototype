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

	query := "SELECT id, user_id, tmdb_id, media_type, status, CAST(rating AS INTEGER)::INTEGER as rating, created_at, updated_at FROM user_records WHERE user_id = ?"
	args := []interface{}{userID}

	if filters.Status != "" {
		query += " AND status = ?"
		args = append(args, filters.Status)
	}
	if filters.MediaType != "" {
		query += " AND media_type = ?"
		args = append(args, filters.MediaType)
	}

	query += " ORDER BY updated_at DESC"

	if filters.Limit > 0 {
		query += " LIMIT ?"
		args = append(args, filters.Limit)
	}
	if filters.Offset > 0 {
		query += " OFFSET ?"
		args = append(args, filters.Offset)
	}

	if err := r.db.WithContext(ctx).Raw(query, args...).Scan(&records).Error; err != nil {
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
