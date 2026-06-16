package dto

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
