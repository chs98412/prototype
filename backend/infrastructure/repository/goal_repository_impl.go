package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/chs98412/prototype/backend/domain/entity"
	domainrepo "github.com/chs98412/prototype/backend/domain/repository"
	"github.com/chs98412/prototype/backend/pkg/supabase"
)

// GoalRepositoryImpl implements GoalRepository interface
type GoalRepositoryImpl struct {
	db *supabase.Client
}

// NewGoalRepository creates a new goal repository
func NewGoalRepository(db *supabase.Client) domainrepo.GoalRepository {
	return &GoalRepositoryImpl{db: db}
}

// GetByUserIDAndYear retrieves a goal by user ID and year
func (r *GoalRepositoryImpl) GetByUserIDAndYear(ctx context.Context, userID string, year int) (*entity.Goal, error) {
	result, err := r.db.Query(
		`SELECT id, user_id, year, movie_goal, drama_goal, created_at, updated_at
		 FROM user_goals WHERE user_id = $1 AND year = $2`,
		userID, year,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query goal: %w", err)
	}

	var goals []map[string]interface{}
	if err := json.Unmarshal(result, &goals); err != nil {
		return nil, fmt.Errorf("failed to parse goal: %w", err)
	}

	if len(goals) == 0 {
		return nil, fmt.Errorf("goal not found")
	}

	return r.mapToEntity(goals[0]), nil
}

// Save creates or updates a goal using upsert semantics
func (r *GoalRepositoryImpl) Save(ctx context.Context, goal *entity.Goal) error {
	result, err := r.db.Query(
		`INSERT INTO user_goals (id, user_id, year, movie_goal, drama_goal, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)
		 ON CONFLICT (user_id, year) DO UPDATE
		 SET movie_goal = EXCLUDED.movie_goal,
		     drama_goal = EXCLUDED.drama_goal,
		     updated_at = EXCLUDED.updated_at
		 RETURNING id`,
		goal.ID, goal.UserID, goal.Year, goal.MovieGoal, goal.DramaGoal, goal.CreatedAt, goal.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to save goal: %w", err)
	}

	var saved []map[string]interface{}
	if err := json.Unmarshal(result, &saved); err != nil {
		return fmt.Errorf("failed to parse result: %w", err)
	}

	if len(saved) == 0 {
		return fmt.Errorf("goal not saved")
	}

	return nil
}

// Update updates an existing goal
func (r *GoalRepositoryImpl) Update(ctx context.Context, goal *entity.Goal) error {
	result, err := r.db.Query(
		`UPDATE user_goals
		 SET movie_goal = $1, drama_goal = $2, updated_at = $3
		 WHERE id = $4 AND user_id = $5 RETURNING id`,
		goal.MovieGoal, goal.DramaGoal, goal.UpdatedAt, goal.ID, goal.UserID,
	)
	if err != nil {
		return fmt.Errorf("failed to update goal: %w", err)
	}

	var updated []map[string]interface{}
	if err := json.Unmarshal(result, &updated); err != nil {
		return fmt.Errorf("failed to parse result: %w", err)
	}

	if len(updated) == 0 {
		return fmt.Errorf("goal not found")
	}

	return nil
}

// Helper: map database result to entity
func (r *GoalRepositoryImpl) mapToEntity(data map[string]interface{}) *entity.Goal {
	goal := &entity.Goal{}

	if v, ok := data["id"].(string); ok {
		goal.ID = v
	}
	if v, ok := data["user_id"].(string); ok {
		goal.UserID = v
	}
	if v, ok := data["year"].(float64); ok {
		goal.Year = int(v)
	}
	if v, ok := data["movie_goal"].(float64); ok {
		goal.MovieGoal = int(v)
	}
	if v, ok := data["drama_goal"].(float64); ok {
		goal.DramaGoal = int(v)
	}

	return goal
}
