package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/chs98412/prototype/backend/domain/entity"
	domainrepo "github.com/chs98412/prototype/backend/domain/repository"
	"github.com/chs98412/prototype/backend/pkg/supabase"
)

// StreakRepositoryImpl implements StreakRepository interface
type StreakRepositoryImpl struct {
	db *supabase.Client
}

// NewStreakRepository creates a new streak repository
func NewStreakRepository(db *supabase.Client) domainrepo.StreakRepository {
	return &StreakRepositoryImpl{db: db}
}

// GetStreak retrieves user's current and longest streak
func (r *StreakRepositoryImpl) GetStreak(ctx context.Context, userID string) (*entity.Streak, error) {
	result, err := r.db.Query(
		`SELECT
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
						WHERE user_id = $1
						GROUP BY watch_date
					) t
					GROUP BY grp
					ORDER BY COUNT(*) DESC
					LIMIT 1
				) as longest_streak
			FROM user_records
			WHERE user_id = $1
			ORDER BY watched_at DESC
			LIMIT 1
		 ) t`,
		userID, userID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query streak: %w", err)
	}

	var streaks []map[string]interface{}
	if err := json.Unmarshal(result, &streaks); err != nil {
		return nil, fmt.Errorf("failed to parse streak: %w", err)
	}

	if len(streaks) == 0 {
		return &entity.Streak{
			CurrentStreak: 0,
			LongestStreak: 0,
		}, nil
	}

	streak := &entity.Streak{}
	if v, ok := streaks[0]["current_streak"].(float64); ok {
		streak.CurrentStreak = int(v)
	}
	if v, ok := streaks[0]["longest_streak"].(float64); ok {
		streak.LongestStreak = int(v)
	}

	return streak, nil
}
