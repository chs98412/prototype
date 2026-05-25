import { logger } from './logger'

/**
 * 서버 컴포넌트 렌더링 시간 측정
 * @example
 * export default async function MyPage() {
 *   return measurePageRender('MyPage', async () => {
 *     // 페이지 렌더링 로직
 *     return <div>...</div>
 *   })
 * }
 */
export async function measurePageRender<T>(
  pageName: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  const startTime = performance.now()

  try {
    const result = await fn()
    const duration = performance.now() - startTime
    logger.logPageRender(pageName, duration, metadata)
    return result
  } catch (error) {
    const duration = performance.now() - startTime
    logger.error(`페이지 렌더링 실패: ${pageName}`, error, {
      duration: `${duration.toFixed(2)}ms`,
      ...metadata,
    })
    throw error
  }
}

/**
 * 개별 작업 시간 측정 (서버에서 사용)
 * @example
 * const data = await measureOperation('fetch-user-profile', async () => {
 *   return await fetchProfile()
 * })
 */
export async function measureOperation<T>(
  operationName: string,
  fn: () => Promise<T>,
  logLevel: 'debug' | 'info' = 'debug'
): Promise<T> {
  const startTime = performance.now()

  try {
    const result = await fn()
    const duration = performance.now() - startTime

    if (logLevel === 'debug') {
      logger.debug(`${operationName} 완료`, { duration: `${duration.toFixed(2)}ms` })
    } else {
      logger.logPerformanceMetric(operationName, duration)
    }

    return result
  } catch (error) {
    const duration = performance.now() - startTime
    logger.error(`${operationName} 실패`, error, {
      duration: `${duration.toFixed(2)}ms`,
    })
    throw error
  }
}

/**
 * 서버 컴포넌트에서 여러 비동기 작업 시간 측정
 * @example
 * const [profile, records] = await measureParallelOperations(
 *   [
 *     { name: 'profile', fn: () => fetchProfile() },
 *     { name: 'records', fn: () => fetchRecords() },
 *   ]
 * )
 */
export async function measureParallelOperations<T extends readonly unknown[]>(
  operations: Array<{
    name: string
    fn: () => Promise<unknown>
  }>
): Promise<T> {
  const startTime = performance.now()

  try {
    const results = await Promise.all(
      operations.map(({ fn }) => fn())
    ) as T

    const duration = performance.now() - startTime
    logger.info(`병렬 작업 완료 (${operations.length}개)`, {
      operations: operations.map(({ name }) => name),
      totalDuration: `${duration.toFixed(2)}ms`,
    })

    return results
  } catch (error) {
    const duration = performance.now() - startTime
    logger.error('병렬 작업 실패', error, {
      operations: operations.map(({ name }) => name),
      duration: `${duration.toFixed(2)}ms`,
    })
    throw error
  }
}

/**
 * 클라이언트에서 성능 지표 수집
 */
export function collectWebVitals() {
  if (typeof window === 'undefined') return

  // Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        logger.logPerformanceMetric('LCP (Largest Contentful Paint)', lastEntry.renderTime || lastEntry.loadTime)
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (e) {
      // 지원하지 않는 브라우저
    }
  }

  // First Input Delay (FID)
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          logger.logPerformanceMetric('FID (First Input Delay)', entry.processingDuration)
        }
      })
      observer.observe({ entryTypes: ['first-input'] })
    } catch (e) {
      // 지원하지 않는 브라우저
    }
  }

  // Cumulative Layout Shift (CLS)
  let clsValue = 0
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
            logger.logPerformanceMetric('CLS (Cumulative Layout Shift)', clsValue)
          }
        }
      })
      observer.observe({ entryTypes: ['layout-shift'] })
    } catch (e) {
      // 지원하지 않는 브라우저
    }
  }
}
