package service

import (
	"context"

	"github.com/chs98412/prototype/backend/domain"
	dto "github.com/chs98412/prototype/backend/domain/dto"
	"github.com/chs98412/prototype/backend/domain/entity"
	"github.com/chs98412/prototype/backend/domain/repository"
	"github.com/google/uuid"
)

// RecordService interface
type RecordService interface {
	GetRecord(ctx context.Context, userID, recordID string) (*dto.RecordDTO, error)
	ListRecords(ctx context.Context, userID string, status, mediaType string, limit, offset int) ([]dto.RecordDTO, error)
	CreateRecord(ctx context.Context, userID string, tmdbID int, mediaType string, rating int) (*dto.RecordDTO, error)
	UpdateRecordRating(ctx context.Context, userID, recordID string, rating int) (*dto.RecordDTO, error)
	DeleteRecord(ctx context.Context, userID, recordID string) error
	DeleteRecordByTMDB(ctx context.Context, userID string, tmdbID int) error
	GetStats(ctx context.Context, userID string) (*dto.RecordStatsDTO, error)
}

// RecordServiceImpl implements RecordService
type RecordServiceImpl struct {
	repo      repository.RecordRepository
	movieSvc  MovieService
	movieRepo repository.MovieRepository
}

// NewRecordService creates a new record service
func NewRecordService(repo repository.RecordRepository, movieSvc MovieService, movieRepo repository.MovieRepository) RecordService {
	return &RecordServiceImpl{
		repo:      repo,
		movieSvc:  movieSvc,
		movieRepo: movieRepo,
	}
}

// enrichRecordDTO populates title and poster_path for a single item
func (s *RecordServiceImpl) enrichRecordDTO(ctx context.Context, d *dto.RecordDTO) {
	movie, err := s.movieRepo.GetByID(ctx, d.TMDBID)
	if err == nil && movie != nil {
		d.Title = movie.Title
		d.PosterPath = movie.PosterPath
	}
}

// enrichRecordDTOs batch-fetches movies to avoid N+1 queries
func (s *RecordServiceImpl) enrichRecordDTOs(ctx context.Context, dtos []dto.RecordDTO) {
	if len(dtos) == 0 {
		return
	}
	tmdbIDs := make([]int, 0, len(dtos))
	seen := map[int]bool{}
	for _, d := range dtos {
		if !seen[d.TMDBID] {
			tmdbIDs = append(tmdbIDs, d.TMDBID)
			seen[d.TMDBID] = true
		}
	}
	movies, err := s.movieRepo.GetByIDs(ctx, tmdbIDs)
	if err != nil {
		return
	}
	movieMap := map[int]entity.Movie{}
	for _, m := range movies {
		movieMap[m.ID] = m
	}
	for i := range dtos {
		if m, ok := movieMap[dtos[i].TMDBID]; ok {
			dtos[i].Title = m.Title
			dtos[i].PosterPath = m.PosterPath
		}
	}
}

// GetRecord retrieves a single record
func (s *RecordServiceImpl) GetRecord(ctx context.Context, userID, recordID string) (*dto.RecordDTO, error) {
	record, err := s.repo.GetByID(ctx, recordID, userID)
	if err != nil {
		return nil, err
	}
	d := record.ToDTO()
	s.enrichRecordDTO(ctx, d)
	return d, nil
}

// ListRecords retrieves records with filters
func (s *RecordServiceImpl) ListRecords(ctx context.Context, userID string, status, mediaType string, limit, offset int) ([]dto.RecordDTO, error) {
	if limit == 0 {
		limit = 100
	}
	if limit > 500 {
		limit = 500
	}

	filters := repository.RecordFilters{
		Status:    status,
		MediaType: mediaType,
		Limit:     limit,
		Offset:    offset,
	}

	records, err := s.repo.List(ctx, userID, filters)
	if err != nil {
		return nil, err
	}

	dtos := make([]dto.RecordDTO, 0, len(records))
	for _, r := range records {
		dtos = append(dtos, *r.ToDTO())
	}
	s.enrichRecordDTOs(ctx, dtos)
	return dtos, nil
}

// CreateRecord creates a new watch record (or updates existing)
func (s *RecordServiceImpl) CreateRecord(ctx context.Context, userID string, tmdbID int, mediaType string, rating int) (*dto.RecordDTO, error) {
	// Validate input
	if tmdbID == 0 {
		return nil, domain.ErrInvalidInput
	}
	if mediaType != "movie" && mediaType != "tv" {
		return nil, domain.ErrInvalidMediaType
	}
	if rating < 0 || rating > 10 {
		return nil, domain.ErrInvalidRating
	}

	// Check if record exists
	existingRecord, _ := s.repo.GetByTMDBID(ctx, userID, tmdbID)
	if existingRecord != nil {
		// Update existing record
		existingRecord.SetWatched(rating)
		if err := s.repo.Update(ctx, existingRecord); err != nil {
			return nil, err
		}
		d := existingRecord.ToDTO()
		s.enrichRecordDTO(ctx, d)
		return d, nil
	}

	// Create new record
	record := entity.NewRecord(uuid.New().String(), userID, tmdbID, mediaType)
	record.SetWatched(rating)

	if err := s.repo.Save(ctx, record); err != nil {
		return nil, err
	}

	// Best-effort: cache movie metadata from TMDB
	go s.movieSvc.UpsertFromTMDB(context.Background(), tmdbID)

	d := record.ToDTO()
	s.enrichRecordDTO(ctx, d)
	return d, nil
}

// UpdateRecordRating updates the rating of a record
func (s *RecordServiceImpl) UpdateRecordRating(ctx context.Context, userID, recordID string, rating int) (*dto.RecordDTO, error) {
	record, err := s.repo.GetByID(ctx, recordID, userID)
	if err != nil {
		return nil, err
	}

	if err := record.UpdateRating(rating); err != nil {
		return nil, err
	}

	if err := s.repo.Update(ctx, record); err != nil {
		return nil, err
	}

	d := record.ToDTO()
	s.enrichRecordDTO(ctx, d)
	return d, nil
}

// DeleteRecord deletes a watch record
func (s *RecordServiceImpl) DeleteRecord(ctx context.Context, userID, recordID string) error {
	// Verify ownership first
	_, err := s.repo.GetByID(ctx, recordID, userID)
	if err != nil {
		return err
	}

	return s.repo.Delete(ctx, recordID, userID)
}

// DeleteRecordByTMDB deletes a record by TMDB ID
func (s *RecordServiceImpl) DeleteRecordByTMDB(ctx context.Context, userID string, tmdbID int) error {
	return s.repo.DeleteByTMDB(ctx, userID, tmdbID)
}

// GetStats retrieves watch statistics
func (s *RecordServiceImpl) GetStats(ctx context.Context, userID string) (*dto.RecordStatsDTO, error) {
	return s.repo.GetStats(ctx, userID)
}
