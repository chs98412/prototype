package entity

// Streak represents user's viewing streak statistics
type Streak struct {
	CurrentStreak int `json:"current_streak"`
	LongestStreak int `json:"longest_streak"`
}

// StreakDTO is the data transfer object for streak responses
type StreakDTO struct {
	CurrentStreak int `json:"current_streak"`
	LongestStreak int `json:"longest_streak"`
}

// ToDTO converts to DTO
func (s *Streak) ToDTO() *StreakDTO {
	return &StreakDTO{
		CurrentStreak: s.CurrentStreak,
		LongestStreak: s.LongestStreak,
	}
}
