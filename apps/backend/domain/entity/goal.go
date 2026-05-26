package entity

import (
	"time"
	"github.com/chs98412/prototype/backend/domain"
)

// Goal is the domain entity for user yearly goals
type Goal struct {
	ID        string    `gorm:"primaryKey;column:id"`
	UserID    string    `gorm:"index;column:user_id"`
	Year      int       `gorm:"column:year"`
	MovieGoal int       `gorm:"column:movie_goal"`
	DramaGoal int       `gorm:"column:drama_goal"`
	CreatedAt time.Time `gorm:"autoCreateTime;column:created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime;column:updated_at"`
}

// TableName specifies the table name for GORM
func (g *Goal) TableName() string {
	return "user_goals"
}

// NewGoal creates a new goal entity
func NewGoal(id, userID string, year, movieGoal, dramaGoal int) *Goal {
	now := time.Now()
	return &Goal{
		ID:        id,
		UserID:    userID,
		Year:      year,
		MovieGoal: movieGoal,
		DramaGoal: dramaGoal,
		CreatedAt: now,
		UpdatedAt: now,
	}
}

// Update updates the goal targets
func (g *Goal) Update(movieGoal, dramaGoal int) error {
	if movieGoal < 0 || dramaGoal < 0 {
		return domain.ErrInvalidInput
	}
	g.MovieGoal = movieGoal
	g.DramaGoal = dramaGoal
	g.UpdatedAt = time.Now()
	return nil
}

// ToDTO converts entity to response DTO
func (g *Goal) ToDTO() *GoalDTO {
	return &GoalDTO{
		ID:        g.ID,
		UserID:    g.UserID,
		Year:      g.Year,
		MovieGoal: g.MovieGoal,
		DramaGoal: g.DramaGoal,
		CreatedAt: g.CreatedAt.Format(time.RFC3339),
		UpdatedAt: g.UpdatedAt.Format(time.RFC3339),
	}
}

// GoalDTO is the data transfer object for goal responses
type GoalDTO struct {
	ID        string `json:"id"`
	UserID    string `json:"user_id"`
	Year      int    `json:"year"`
	MovieGoal int    `json:"movie_goal"`
	DramaGoal int    `json:"drama_goal"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}
