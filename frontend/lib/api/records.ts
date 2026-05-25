import { apiCall, ApiResponse } from './client'
import type { Record, CreateRecordRequest, CreateRecordResponse, DeleteRecordResponse, RecordStats } from '@/lib/types/records'

export async function getRecords(limit = 20, offset = 0): Promise<ApiResponse<Record[]>> {
  return apiCall<Record[]>(`/v1/records?limit=${limit}&offset=${offset}`)
}

export async function createRecord(
  data: CreateRecordRequest
): Promise<ApiResponse<CreateRecordResponse>> {
  return apiCall<CreateRecordResponse>('/v1/records', {
    method: 'POST',
    body: data,
  })
}

export async function deleteRecord(recordId: string): Promise<ApiResponse<DeleteRecordResponse>> {
  return apiCall<DeleteRecordResponse>(`/v1/records/${recordId}`, {
    method: 'DELETE',
  })
}

export async function deleteRecordByTmdbId(tmdbId: number): Promise<ApiResponse<DeleteRecordResponse>> {
  return apiCall<DeleteRecordResponse>(`/v1/records/tmdb/${tmdbId}`, {
    method: 'DELETE',
  })
}

export async function getRecordStats(): Promise<ApiResponse<RecordStats>> {
  return apiCall<RecordStats>('/v1/records/stats')
}
