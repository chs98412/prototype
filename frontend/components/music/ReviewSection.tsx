'use client'

import { useState } from 'react'

interface ReviewSectionProps {
  onSubmitReview: (content: string, hasSpoiler: boolean) => Promise<void>
  isLoading?: boolean
}

export default function ReviewSection({ onSubmitReview, isLoading = false }: ReviewSectionProps) {
  const [content, setContent] = useState('')
  const [hasSpoiler, setHasSpoiler] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) return

    try {
      await onSubmitReview(content, hasSpoiler)
      setContent('')
      setHasSpoiler(false)
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to submit review:', error)
    }
  }

  const remainingChars = 500 - content.length

  return (
    <div className="bg-white border-b border-gray-200">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full text-left px-4 py-4 hover:bg-gray-50 transition-colors"
        >
          <p className="text-sm font-semibold text-gray-900">리뷰 (선택)</p>
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

          <div className="text-xs text-gray-400 mt-2">
            {remainingChars}자 남음
          </div>

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
              onClick={() => {
                setContent('')
                setHasSpoiler(false)
                setIsOpen(false)
              }}
              disabled={isLoading}
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
