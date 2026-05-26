export function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-6 h-6 border-3',
  }

  return (
    <div
      className={`${sizeClasses[size]} border-blue-500 border-t-transparent rounded-full animate-spin ${className}`}
      role="status"
      aria-label="로딩 중"
    />
  )
}

export function LoadingMessage({ message = '로드 중...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <LoadingSpinner size="md" />
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  )
}

export function SkeletonLine({ width = 'w-full', height = 'h-4' }: { width?: string; height?: string }) {
  return <div className={`${width} ${height} bg-gray-200 rounded animate-pulse`} />
}

export function SkeletonCircle({ size = 'w-10 h-10' }: { size?: string }) {
  return <div className={`${size} bg-gray-200 rounded-full animate-pulse`} />
}

export function AlbumDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10 flex items-center gap-3">
        <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
        <SkeletonLine width="w-24" height="h-4" />
      </div>

      {/* 컨텐츠 */}
      <div className="flex-1 p-4 space-y-4">
        {/* 앨범 이미지 */}
        <div className="w-full aspect-square bg-gray-200 rounded-lg animate-pulse" />

        {/* 앨범 정보 */}
        <div className="space-y-3">
          <SkeletonLine width="w-3/4" height="h-5" />
          <SkeletonLine width="w-1/2" height="h-4" />
          <SkeletonLine width="w-2/3" height="h-4" />
        </div>

        {/* 통계 카드들 */}
        <div className="grid grid-cols-3 gap-2 py-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-3 space-y-2">
              <SkeletonLine width="w-full" height="h-4" />
              <SkeletonLine width="w-3/4" height="h-3" />
            </div>
          ))}
        </div>

        {/* 트랙 리스트 */}
        <div className="space-y-3 pt-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <SkeletonLine width="w-8" height="h-4" />
              <div className="flex-1 space-y-2">
                <SkeletonLine width="w-full" height="h-4" />
                <SkeletonLine width="w-2/3" height="h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function TrackDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10 flex items-center gap-3">
        <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
        <SkeletonLine width="w-24" height="h-4" />
      </div>

      {/* 컨텐츠 */}
      <div className="flex-1 p-4 space-y-6">
        {/* 트랙 정보 */}
        <div className="space-y-4">
          <SkeletonLine width="w-3/4" height="h-6" />
          <SkeletonLine width="w-1/2" height="h-4" />
          <SkeletonLine width="w-2/3" height="h-4" />
        </div>

        {/* 재생 제어 */}
        <div className="flex gap-4 justify-center py-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
          ))}
        </div>

        {/* 상세 정보 섹션 */}
        <div className="space-y-4">
          <SkeletonLine width="w-1/3" height="h-5" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <SkeletonLine width="w-1/3" height="h-4" />
                <SkeletonLine width="w-1/3" height="h-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
