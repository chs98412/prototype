package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/chs98412/prototype/backend/domain/entity"
	"github.com/chs98412/prototype/backend/domain/repository"
	"github.com/chs98412/prototype/backend/pkg/supabase"
)

// ProfileRepositoryImpl implements ProfileRepository interface
type ProfileRepositoryImpl struct {
	db *supabase.Client
}

// NewProfileRepository creates a new profile repository
func NewProfileRepository(db *supabase.Client) repository.ProfileRepository {
	return &ProfileRepositoryImpl{db: db}
}

// GetByUserID retrieves a profile by user ID
func (r *ProfileRepositoryImpl) GetByUserID(ctx context.Context, userID string) (*entity.Profile, error) {
	result, err := r.db.Query(
		"SELECT id, user_id, display_name, bio, avatar_url, created_at, updated_at FROM user_profiles WHERE user_id = $1",
		userID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query profile: %w", err)
	}

	var profiles []map[string]interface{}
	if err := json.Unmarshal(result, &profiles); err != nil {
		return nil, fmt.Errorf("failed to parse profile: %w", err)
	}

	if len(profiles) == 0 {
		return nil, fmt.Errorf("profile not found")
	}

	return r.mapToEntity(profiles[0]), nil
}

// Save creates a new profile
func (r *ProfileRepositoryImpl) Save(ctx context.Context, profile *entity.Profile) error {
	result, err := r.db.Query(
		`INSERT INTO user_profiles (id, user_id, display_name, bio, avatar_url, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
		profile.ID, profile.UserID, profile.DisplayName, profile.Bio, profile.AvatarURL,
		profile.CreatedAt, profile.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to save profile: %w", err)
	}

	var saved []map[string]interface{}
	if err := json.Unmarshal(result, &saved); err != nil {
		return fmt.Errorf("failed to parse result: %w", err)
	}

	if len(saved) == 0 {
		return fmt.Errorf("profile not created")
	}

	return nil
}

// Update updates an existing profile
func (r *ProfileRepositoryImpl) Update(ctx context.Context, profile *entity.Profile) error {
	result, err := r.db.Query(
		`UPDATE user_profiles
		 SET display_name = $1, bio = $2, avatar_url = $3, updated_at = $4
		 WHERE user_id = $5 RETURNING id`,
		profile.DisplayName, profile.Bio, profile.AvatarURL, profile.UpdatedAt, profile.UserID,
	)
	if err != nil {
		return fmt.Errorf("failed to update profile: %w", err)
	}

	var updated []map[string]interface{}
	if err := json.Unmarshal(result, &updated); err != nil {
		return fmt.Errorf("failed to parse result: %w", err)
	}

	if len(updated) == 0 {
		return fmt.Errorf("profile not found")
	}

	return nil
}

// Delete removes a profile
func (r *ProfileRepositoryImpl) Delete(ctx context.Context, userID string) error {
	err := r.db.Exec("DELETE FROM user_profiles WHERE user_id = $1", userID)
	if err != nil {
		return fmt.Errorf("failed to delete profile: %w", err)
	}
	return nil
}

// Helper: map database result to entity
func (r *ProfileRepositoryImpl) mapToEntity(data map[string]interface{}) *entity.Profile {
	profile := &entity.Profile{}

	if v, ok := data["id"].(string); ok {
		profile.ID = v
	}
	if v, ok := data["user_id"].(string); ok {
		profile.UserID = v
	}
	if v, ok := data["display_name"].(string); ok {
		profile.DisplayName = v
	}
	if v, ok := data["bio"].(string); ok {
		profile.Bio = v
	}
	if v, ok := data["avatar_url"].(string); ok {
		profile.AvatarURL = v
	}

	return profile
}
