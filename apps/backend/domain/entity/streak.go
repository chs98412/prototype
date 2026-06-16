package entity

import dto "github.com/chs98412/prototype/backend/domain/dto"

// Streak represents user's viewing streak statistics
type Streak struct {
	CurrentStreak int `json:"current_streak"`
	LongestStreak int `json:"longest_streak"`
}

// ToDTO converts to DTO
func (s *Streak) ToDTO() *dto.StreakDTO {
	return &dto.StreakDTO{
		CurrentStreak: s.CurrentStreak,
		LongestStreak: s.LongestStreak,
	}
}
