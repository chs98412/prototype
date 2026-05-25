package domain

import "errors"

var (
	ErrNotFound         = errors.New("entity not found")
	ErrUnauthorized     = errors.New("unauthorized")
	ErrInvalidInput     = errors.New("invalid input")
	ErrInvalidRating    = errors.New("rating must be between 0 and 10")
	ErrInvalidMediaType = errors.New("media_type must be 'movie' or 'tv'")
	ErrDuplicate        = errors.New("record already exists")
)
