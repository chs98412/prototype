'use client'

import { useState } from 'react'

interface Review {
  id: string
  content: string
  hasSpoiler: boolean
  createdAt: Date
  updatedAt: Date
}

interface AlbumReviewDisplayProps {
  review?: Review
  isOwnReview?: boolean
  onEdit?: () => void
  onDelete?: () => Promise<void>
  onSubmitEdit?: (content: string, hasSpoiler: boolean) => Promise<void>
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}.${month}.${day} ${hours}:${minutes}`
}

export default function AlbumReviewDisplay({
  review,
  isOwnReview = false,
  onEdit,
  onDelete,
  onSubmitEdit,
}: AlbumReviewDisplayProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(review?.content || '')
  const [editHasSpoiler, setEditHasSpoiler] = useState(review?.hasSpoiler || false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleDelete = async () => {
    if (!onDelete) return

    setIsDeleting(true)
    try {
      await onDelete()
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!onSubmitEdit || !editContent.trim()) return

    setIsSaving(true)
    try {
      await onSubmitEdit(editContent, editHasSpoiler)
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  if (!review) {
    return (
      <div className="bg-white border-b border-gray-200">
        <button
          onClick={onEdit}
          className="w-full text-left px-4 py-4 hover:bg-gray-50 transition-colors"
        >
          <p className="text-sm font-semibold text-gray-900">리뷰 (선택)</p>
          <p className="text-xs text-gray-500 mt-1">이 음반에 대한 생각을 남겨주세요...</p>
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white border-b border-gray-200">
      {!isEditing ? (
        <div className="px-4 py-4">
          {/* 헤더 */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <p className="text-sm font-semibold text-gray-900">리뷰</p>
            {isOwnReview && (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-blue-500 hover:underline font-semibold"
                >
                  수정
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-sm text-red-500 hover:underline font-semibold disabled:text-gray-400"
                >
                  {isDeleting ? '삭제 중...' : '삭제'}
                </button>
              </div>
            )}
          </div>

          {/* 스포일러 배지 */}
          {review.hasSpoiler && (
            <div className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold mb-3">
              ⚠ 스포일러 포함
            </div>
          )}

          {/* 리뷰 본문 */}
          <p className="text-sm text-gray-900 whitespace-pre-wrap break-words mb-3">
            {review.content}
          </p>

          {/* 메타데이터 */}
          <p className="text-xs text-gray-500">
            작성일: {formatDate(review.createdAt)}
            {review.updatedAt !== review.createdAt && (
              <> (수정됨: {formatDate(review.updatedAt)})</>
            )}
          </p>
        </div>
      ) : (
        /* 편집 모드 */
        <div className="px-4 py-4">
          <p className="text-sm font-semibold text-gray-900 mb-3">리뷰 편집</p>

          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value.slice(0, 500))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
            disabled={isSaving}
          />

          <div className="text-xs text-gray-400 mt-2">
            {500 - editContent.length}자 남음
          </div>

          <label className="flex items-center gap-2 mt-3 mb-4">
            <input
              type="checkbox"
              checked={editHasSpoiler}
              onChange={(e) => setEditHasSpoiler(e.target.checked)}
              disabled={isSaving}
              className="w-4 h-4 accent-blue-500 rounded"
            />
            <span className="text-sm text-gray-700">스포일러 포함</span>
          </label>

          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              disabled={!editContent.trim() || isSaving}
              className="flex-1 h-10 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-sm"
            >
              {isSaving ? '저장 중...' : '저장'}
            </button>
            <button
              onClick={() => {
                setIsEditing(false)
                setEditContent(review.content)
                setEditHasSpoiler(review.hasSpoiler)
              }}
              disabled={isSaving}
              className="flex-1 h-10 bg-gray-200 hover:bg-gray-300 disabled:cursor-not-allowed text-gray-900 font-semibold rounded-lg transition-colors text-sm"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
