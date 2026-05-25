package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/chs98412/prototype/backend/domain/entity"
	domainrepo "github.com/chs98412/prototype/backend/domain/repository"
	"github.com/chs98412/prototype/backend/pkg/supabase"
)

// ChallengeRepositoryImpl implements ChallengeRepository interface
type ChallengeRepositoryImpl struct {
	db *supabase.Client
}

// NewChallengeRepository creates a new challenge repository
func NewChallengeRepository(db *supabase.Client) domainrepo.ChallengeRepository {
	return &ChallengeRepositoryImpl{db: db}
}

// GetChallenges retrieves all challenges
func (r *ChallengeRepositoryImpl) GetChallenges(ctx context.Context, limit, offset int) ([]entity.Challenge, error) {
	result, err := r.db.Query(
		`SELECT id, title, description, target, created_at FROM challenges
		 ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
		limit, offset,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query challenges: %w", err)
	}

	var challenges []map[string]interface{}
	if err := json.Unmarshal(result, &challenges); err != nil {
		return nil, fmt.Errorf("failed to parse challenges: %w", err)
	}

	entities := make([]entity.Challenge, 0, len(challenges))
	for _, challenge := range challenges {
		entities = append(entities, *r.mapToChallengeEntity(challenge))
	}

	return entities, nil
}

// GetChallengeByID retrieves a challenge by ID
func (r *ChallengeRepositoryImpl) GetChallengeByID(ctx context.Context, challengeID string) (*entity.Challenge, error) {
	result, err := r.db.Query(
		"SELECT id, title, description, target, created_at FROM challenges WHERE id = $1",
		challengeID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query challenge: %w", err)
	}

	var challenges []map[string]interface{}
	if err := json.Unmarshal(result, &challenges); err != nil {
		return nil, fmt.Errorf("failed to parse challenge: %w", err)
	}

	if len(challenges) == 0 {
		return nil, fmt.Errorf("challenge not found")
	}

	return r.mapToChallengeEntity(challenges[0]), nil
}

// GetUserChallenges retrieves user's challenge progress
func (r *ChallengeRepositoryImpl) GetUserChallenges(ctx context.Context, userID string, status string, limit, offset int) ([]entity.ChallengeProgress, error) {
	query := `SELECT id, user_id, challenge_id, progress, status, started_at, updated_at
			  FROM user_challenge_progress WHERE user_id = $1`
	args := []interface{}{userID}
	argCount := 2

	if status != "" {
		query += fmt.Sprintf(" AND status = $%d", argCount)
		args = append(args, status)
		argCount++
	}

	query += " ORDER BY started_at DESC"
	query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", argCount, argCount+1)
	args = append(args, limit, offset)

	result, err := r.db.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query user challenges: %w", err)
	}

	var progresses []map[string]interface{}
	if err := json.Unmarshal(result, &progresses); err != nil {
		return nil, fmt.Errorf("failed to parse progresses: %w", err)
	}

	entities := make([]entity.ChallengeProgress, 0, len(progresses))
	for _, progress := range progresses {
		entities = append(entities, *r.mapToProgressEntity(progress))
	}

	return entities, nil
}

// GetProgress retrieves a user's progress for a specific challenge
func (r *ChallengeRepositoryImpl) GetProgress(ctx context.Context, userID, challengeID string) (*entity.ChallengeProgress, error) {
	result, err := r.db.Query(
		`SELECT id, user_id, challenge_id, progress, status, started_at, updated_at
		 FROM user_challenge_progress WHERE user_id = $1 AND challenge_id = $2`,
		userID, challengeID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query progress: %w", err)
	}

	var progresses []map[string]interface{}
	if err := json.Unmarshal(result, &progresses); err != nil {
		return nil, fmt.Errorf("failed to parse progress: %w", err)
	}

	if len(progresses) == 0 {
		return nil, fmt.Errorf("progress not found")
	}

	return r.mapToProgressEntity(progresses[0]), nil
}

// CreateProgress creates a new challenge progress
func (r *ChallengeRepositoryImpl) CreateProgress(ctx context.Context, progress *entity.ChallengeProgress) error {
	result, err := r.db.Query(
		`INSERT INTO user_challenge_progress (id, user_id, challenge_id, progress, status, started_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
		progress.ID, progress.UserID, progress.ChallengeID, progress.Progress,
		progress.Status, progress.StartedAt, progress.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create progress: %w", err)
	}

	var created []map[string]interface{}
	if err := json.Unmarshal(result, &created); err != nil {
		return fmt.Errorf("failed to parse result: %w", err)
	}

	if len(created) == 0 {
		return fmt.Errorf("progress not created")
	}

	return nil
}

// UpdateProgress updates challenge progress
func (r *ChallengeRepositoryImpl) UpdateProgress(ctx context.Context, progress *entity.ChallengeProgress) error {
	result, err := r.db.Query(
		`UPDATE user_challenge_progress
		 SET progress = $1, status = $2, updated_at = $3
		 WHERE id = $4 AND user_id = $5 RETURNING id`,
		progress.Progress, progress.Status, progress.UpdatedAt, progress.ID, progress.UserID,
	)
	if err != nil {
		return fmt.Errorf("failed to update progress: %w", err)
	}

	var updated []map[string]interface{}
	if err := json.Unmarshal(result, &updated); err != nil {
		return fmt.Errorf("failed to parse result: %w", err)
	}

	if len(updated) == 0 {
		return fmt.Errorf("progress not found")
	}

	return nil
}

// DeleteProgress removes challenge progress
func (r *ChallengeRepositoryImpl) DeleteProgress(ctx context.Context, userID, progressID string) error {
	err := r.db.Exec(
		"DELETE FROM user_challenge_progress WHERE id = $1 AND user_id = $2",
		progressID, userID,
	)
	if err != nil {
		return fmt.Errorf("failed to delete progress: %w", err)
	}
	return nil
}

// UpdateProgressByDelta increments progress by delta
func (r *ChallengeRepositoryImpl) UpdateProgressByDelta(ctx context.Context, userID string, challengeID string, delta int) error {
	query := `UPDATE user_challenge_progress
	          SET progress = progress + $1, updated_at = NOW()
	          WHERE user_id = $2 AND challenge_id = $3`

	err := r.db.Exec(query, delta, userID, challengeID)
	if err != nil {
		return fmt.Errorf("failed to update progress: %w", err)
	}
	return nil
}

// Helper: map to Challenge entity
func (r *ChallengeRepositoryImpl) mapToChallengeEntity(data map[string]interface{}) *entity.Challenge {
	challenge := &entity.Challenge{}

	if v, ok := data["id"].(string); ok {
		challenge.ID = v
	}
	if v, ok := data["title"].(string); ok {
		challenge.Title = v
	}
	if v, ok := data["description"].(string); ok {
		challenge.Description = v
	}
	if v, ok := data["target"].(float64); ok {
		challenge.Target = int(v)
	}

	return challenge
}

// Helper: map to ChallengeProgress entity
func (r *ChallengeRepositoryImpl) mapToProgressEntity(data map[string]interface{}) *entity.ChallengeProgress {
	progress := &entity.ChallengeProgress{}

	if v, ok := data["id"].(string); ok {
		progress.ID = v
	}
	if v, ok := data["user_id"].(string); ok {
		progress.UserID = v
	}
	if v, ok := data["challenge_id"].(string); ok {
		progress.ChallengeID = v
	}
	if v, ok := data["progress"].(float64); ok {
		progress.Progress = int(v)
	}
	if v, ok := data["status"].(string); ok {
		progress.Status = entity.ChallengeStatus(v)
	}

	return progress
}
