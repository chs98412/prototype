package repository

import (
	"context"
	"fmt"
	"github.com/chs98412/prototype/backend/domain/entity"
	domainrepo "github.com/chs98412/prototype/backend/domain/repository"
	"gorm.io/gorm"
)

// StreakRepositoryImpl implements StreakRepository interface
type StreakRepositoryImpl struct {
	db *gorm.DB
}

// NewStreakRepository creates a new streak repository
func NewStreakRepository(db *gorm.DB) domainrepo.StreakRepository {
	return &StreakRepositoryImpl{db: db}
}

// GetStreak retrieves user's current and longest streak
func (r *StreakRepositoryImpl) GetStreak(ctx context.Context, userID string) (*entity.Streak, error) {
	streak := &entity.Streak{}

	err := r.db.WithContext(ctx).
		Raw(`
			SELECT
				COALESCE(current_streak, 0) as current_streak,
				COALESCE(longest_streak, 0) as longest_streak
			FROM (
				SELECT
					COUNT(*) FILTER (
						WHERE watched_at::DATE >= CURRENT_DATE - INTERVAL '1 day' * (ROW_NUMBER() OVER (ORDER BY watched_at::DATE DESC) - 1)
					) as current_streak,
					(
						SELECT COUNT(*)
						FROM (
							SELECT watched_at::DATE as watch_date,
								ROW_NUMBER() OVER (ORDER BY watched_at::DATE DESC) - ROW_NUMBER() OVER (ORDER BY watched_at::DATE DESC) as grp
							FROM user_records
							WHERE user_id = ?
							GROUP BY watch_date
						) t
						GROUP BY grp
						ORDER BY COUNT(*) DESC
						LIMIT 1
					) as longest_streak
				FROM user_records
				WHERE user_id = ?
				ORDER BY watched_at DESC
				LIMIT 1
			) t
		`, userID, userID).
		Scan(streak).Error

	if err != nil {
		return nil, fmt.Errorf("failed to query streak: %w", err)
	}

	return streak, nil
}
