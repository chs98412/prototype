type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  data?: Record<string, unknown>
  duration?: number
  stack?: string
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development'

  private formatTimestamp(): string {
    return new Date().toISOString()
  }

  private log(level: LogLevel, message: string, data?: Record<string, unknown>, duration?: number, stack?: string) {
    const entry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level,
      message,
      data,
      duration,
      stack,
    }

    // 항상 콘솔에 출력 (프로덕션에서도)
    const logFn = {
      debug: console.debug,
      info: console.info,
      warn: console.warn,
      error: console.error,
    }[level]

    if (data || duration) {
      logFn(`[${entry.timestamp}] [${level.toUpperCase()}] ${message}`, { data, duration: duration ? `${duration.toFixed(2)}ms` : undefined })
    } else {
      logFn(`[${entry.timestamp}] [${level.toUpperCase()}] ${message}`)
    }

    // 프로덕션에서는 에러만 외부 서비스로 전송 (추후 구현)
    if (level === 'error' && !this.isDev) {
      this.reportError(entry)
    }
  }

  debug(message: string, data?: Record<string, unknown>) {
    this.log('debug', message, data)
  }

  info(message: string, data?: Record<string, unknown>) {
    this.log('info', message, data)
  }

  warn(message: string, data?: Record<string, unknown>) {
    this.log('warn', message, data)
  }

  error(message: string, error?: Error | unknown, data?: Record<string, unknown>) {
    const stack = error instanceof Error ? error.stack : undefined
    const errorData = {
      ...data,
      error: error instanceof Error ? error.message : String(error),
    }
    this.log('error', message, errorData, undefined, stack)
  }

  /**
   * API 응답 시간 로깅
   */
  logApiCall(
    method: string,
    endpoint: string,
    statusCode: number,
    duration: number,
    error?: Error
  ) {
    const status = statusCode >= 400 ? 'warn' : 'info'
    const logMessage = error ? 'API 호출 실패' : 'API 호출 완료'

    this.log(
      status,
      logMessage,
      {
        method,
        endpoint,
        statusCode,
        error: error?.message,
      },
      duration
    )
  }

  /**
   * 화면 렌더링 시간 로깅
   */
  logPageRender(pageName: string, duration: number, metadata?: Record<string, unknown>) {
    this.log('info', '페이지 렌더링 완료', {
      page: pageName,
      ...metadata,
    }, duration)
  }

  /**
   * 컴포넌트 렌더링 시간 로깅
   */
  logComponentRender(componentName: string, duration: number, metadata?: Record<string, unknown>) {
    if (this.isDev) {
      this.log('debug', '컴포넌트 렌더링 완료', {
        component: componentName,
        ...metadata,
      }, duration)
    }
  }

  /**
   * 성능 지표 로깅
   */
  logPerformanceMetric(metricName: string, value: number, unit: string = 'ms') {
    this.log('info', '성능 지표', {
      metric: metricName,
      value,
      unit,
    })
  }

  /**
   * 프로덕션에서 에러 보고 (추후 Sentry 등과 연동)
   */
  private reportError(entry: LogEntry) {
    // TODO: Sentry, LogRocket 등과 연동
    // await fetch('/api/logs', { method: 'POST', body: JSON.stringify(entry) })
  }
}

export const logger = new Logger()
