package dto

// StreakDTO is the data transfer object for streak responses
type StreakDTO struct {
	CurrentStreak int `json:"current_streak"`
	LongestStreak int `json:"longest_streak"`
}
