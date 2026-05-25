type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  data?: Record<string, unknown>
  duration?: number
  stack?: string
  source: 'client' | 'server'
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development'
  private isServer = typeof window === 'undefined'

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
      source: this.isServer ? 'server' : 'client',
    }

    // 항상 콘솔에 출력 (프로덕션에서도)
    const logFn = {
      debug: console.debug,
      info: console.info,
      warn: console.warn,
      error: console.error,
    }[level]

    if (data || duration) {
      logFn(`[${entry.timestamp}] [${level.toUpperCase()}] [${entry.source}] ${message}`, { data, duration: duration ? `${duration.toFixed(2)}ms` : undefined })
    } else {
      logFn(`[${entry.timestamp}] [${level.toUpperCase()}] [${entry.source}] ${message}`)
    }

    // 로그를 서버로 전송 (프로덕션에서 에러만, 개발에서는 모두)
    if (this.isDev || level === 'error' || level === 'warn') {
      this.sendToServer(entry)
    }
  }

  /**
   * 로그를 서버로 전송
   * 서버에서 외부 서비스(Sentry 등)로 다시 전송
   */
  private async sendToServer(entry: LogEntry) {
    // 서버에서는 로그 전송 불필요 (이미 외부 서비스로 보내짐)
    if (this.isServer) return

    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      })
    } catch (error) {
      // 로그 전송 실패해도 조용히 무시 (무한 루프 방지)
      // console.error('Failed to send log to server:', error)
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

}

export const logger = new Logger()
