import { apiCall, ApiResponse } from './client'

export async function getRecords(limit = 20, offset = 0) {
  return apiCall<any>(`/v1/records?limit=${limit}&offset=${offset}`)
}

export async function createRecord(data: {
  tmdb_id: number
  record_type: 'movie' | 'tv'
  rating: number
}): Promise<ApiResponse<any>> {
  return apiCall<any>('/v1/records', {
    method: 'POST',
    body: data,
  })
}

export async function deleteRecord(recordId: string): Promise<ApiResponse<any>> {
  return apiCall<any>(`/v1/records/${recordId}`, {
    method: 'DELETE',
  })
}

export async function deleteRecordByTmdbId(tmdbId: number): Promise<ApiResponse<any>> {
  return apiCall<any>(`/v1/records/tmdb/${tmdbId}`, {
    method: 'DELETE',
  })
}

export async function getRecordStats() {
  return apiCall<any>('/v1/records/stats')
}
