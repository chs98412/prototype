package repository

import (
	"context"
	"github.com/chs98412/prototype/backend/domain/entity"
)

// ProfileRepository defines repository interface for profile operations
type ProfileRepository interface {
	GetByUserID(ctx context.Context, userID string) (*entity.Profile, error)
	GetByUserIDs(ctx context.Context, userIDs []string) ([]entity.Profile, error)
	Save(ctx context.Context, profile *entity.Profile) error
	Update(ctx context.Context, profile *entity.Profile) error
	Delete(ctx context.Context, userID string) error
}
