package repository

import (
	"context"
	"github.com/chs98412/prototype/backend/domain/entity"
)

// RecordRepository defines repository interface for record operations
type RecordRepository interface {
	GetByID(ctx context.Context, recordID, userID string) (*entity.Record, error)
	GetByTMDBID(ctx context.Context, userID string, tmdbID int) (*entity.Record, error)
	List(ctx context.Context, userID string, filters RecordFilters) ([]entity.Record, error)
	Save(ctx context.Context, record *entity.Record) error
	Update(ctx context.Context, record *entity.Record) error
	Delete(ctx context.Context, recordID, userID string) error
	DeleteByTMDB(ctx context.Context, userID string, tmdbID int) error
	GetStats(ctx context.Context, userID string) (*entity.RecordStatsDTO, error)
}

// RecordFilters for querying records
type RecordFilters struct {
	Status    string
	MediaType string
	Limit     int
	Offset    int
}
