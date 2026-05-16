'use client'

import { useState } from 'react'

interface ReviewSectionProps {
  onSubmitReview: (content: string, hasSpoiler: boolean) => Promise<void>
  allTracksRated: boolean
  totalTracks: number
  ratedCount: number
}

export default function ReviewSection({
  onSubmitReview,
  allTracksRated,
  totalTracks,
  ratedCount,
}: ReviewSectionProps) {
  const [content, setContent] = useState('')
  const [hasSpoiler, setHasSpoiler] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim() || !allTracksRated) return
    setIsLoading(true)
    try {
      await onSubmitReview(content, hasSpoiler)
      setContent('')
      setHasSpoiler(false)
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to submit review:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const remainingChars = 500 - content.length

  if (!allTracksRated) {
    return (
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <p className="text-sm font-semibold text-gray-400 mb-1">리뷰 작성</p>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-400 h-full rounded-full transition-all"
              style={{ width: totalTracks > 0 ? `${(ratedCount / totalTracks) * 100}%` : '0%' }}
            />
          </div>
          <span className="text-xs text-gray-400 flex-shrink-0">
            {ratedCount}/{totalTracks}곡 평가
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-2">모든 곡을 평가하면 리뷰를 작성할 수 있습니다.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border-b border-gray-200">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full text-left px-4 py-4 hover:bg-gray-50 transition-colors"
        >
          <p className="text-sm font-semibold text-gray-900">리뷰 작성</p>
          <p className="text-xs text-gray-500 mt-1">이 음반에 대한 생각을 남겨주세요...</p>
        </button>
      ) : (
        <div className="px-4 py-4">
          <p className="text-sm font-semibold text-gray-900 mb-3">리뷰 작성</p>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, 500))}
            placeholder="이 음반의 느낌을 공유해주세요..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
            disabled={isLoading}
          />

          <div className="text-xs text-gray-400 mt-2">{remainingChars}자 남음</div>

          <label className="flex items-center gap-2 mt-3 mb-4">
            <input
              type="checkbox"
              checked={hasSpoiler}
              onChange={(e) => setHasSpoiler(e.target.checked)}
              disabled={isLoading}
              className="w-4 h-4 accent-blue-500 rounded"
            />
            <span className="text-sm text-gray-700">스포일러 포함</span>
          </label>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || isLoading}
              className="flex-1 h-10 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-sm"
            >
              {isLoading ? '저장 중...' : '저장'}
            </button>
            <button
              onClick={() => { setContent(''); setHasSpoiler(false); setIsOpen(false) }}
              disabled={isLoading}
              className="flex-1 h-10 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg transition-colors text-sm"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
