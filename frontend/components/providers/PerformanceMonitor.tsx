'use client'

import { useEffect } from 'react'
import { logger } from '@/lib/logger'

export function PerformanceMonitor() {
  useEffect(() => {
    // 페이지 로드 완료 후 성능 지표 수집
    const collectMetrics = () => {
      if (typeof window === 'undefined') return

      // Navigation Timing
      if ('performance' in window && 'navigation' in window.performance) {
        const perfData = window.performance.timing
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
        const connectTime = perfData.responseEnd - perfData.requestStart
        const renderTime = perfData.domComplete - perfData.domLoading
        const domContentLoadedTime = perfData.domContentLoadedEventEnd - perfData.navigationStart

        logger.info('페이지 로드 완료', {
          'Total Page Load Time': `${pageLoadTime}ms`,
          'DOM Content Loaded': `${domContentLoadedTime}ms`,
          'Connect Time': `${connectTime}ms`,
          'Render Time': `${renderTime}ms`,
        })
      }

      // 미들웨어에서 추가한 응답 시간
      const responseTime = window.performance.getEntriesByType('navigation')[0] as any
      if (responseTime?.serverTiming) {
        logger.info('서버 응답 시간', {
          'Server Processing': responseTime.serverTiming,
        })
      }

      // Resource Timing (API 호출들)
      const resources = window.performance.getEntriesByType('resource')
      const apiCalls = resources.filter((r) => r.name.includes('/api') || r.name.includes('/v1'))

      if (apiCalls.length > 0) {
        const slowestApi = apiCalls.reduce((prev, current) =>
          current.duration > prev.duration ? current : prev
        )
        logger.info(`${apiCalls.length}개 API 호출 기록됨`, {
          'Slowest API': slowestApi.name,
          'Duration': `${slowestApi.duration.toFixed(2)}ms`,
        })
      }

      // 메모리 사용량 (지원하는 경우)
      if ('memory' in performance) {
        const memory = (performance as any).memory
        const usedMemory = Math.round(memory.usedJSHeapSize / 1048576) // MB
        const totalMemory = Math.round(memory.totalJSHeapSize / 1048576) // MB

        logger.debug('메모리 사용량', {
          'Used': `${usedMemory}MB`,
          'Total': `${totalMemory}MB`,
        })
      }
    }

    // 페이지 로드 완료 후 수집
    window.addEventListener('load', collectMetrics)

    return () => {
      window.removeEventListener('load', collectMetrics)
    }
  }, [])

  useEffect(() => {
    // 페이지 언로드 시 기록
    const handleBeforeUnload = () => {
      const navigationStart = window.performance.timing.navigationStart
      const unloadTime = Date.now() - navigationStart
      logger.debug('페이지 언로드', {
        'Session Duration': `${unloadTime}ms`,
      })
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  return null
}
