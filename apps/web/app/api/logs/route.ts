import { NextRequest, NextResponse } from 'next/server'

interface LogEntry {
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  data?: Record<string, unknown>
  duration?: number
  stack?: string
  source: 'client' | 'server'
  userAgent?: string
  url?: string
}

/**
 * 클라이언트와 서버에서 보낸 로그를 수집하고 외부 서비스로 전송
 * POST /api/logs
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LogEntry

    // 클라이언트 정보 추가
    const enrichedLog: LogEntry = {
      ...body,
      userAgent: request.headers.get('user-agent') ?? undefined,
      url: request.headers.get('referer') ?? undefined,
      timestamp: body.timestamp || new Date().toISOString(),
    }

    // 개발 환경에서는 콘솔에만 출력
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${enrichedLog.source.toUpperCase()}] ${enrichedLog.message}`, enrichedLog)
      return NextResponse.json({ success: true })
    }

    // 프로덕션: 에러만 외부 서비스로 전송
    if (enrichedLog.level === 'error' && process.env.EXTERNAL_LOGGING_ENABLED === 'true') {
      await sendToExternalService(enrichedLog)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('로그 전송 실패:', error)
    return NextResponse.json(
      { error: 'Failed to process log' },
      { status: 500 }
    )
  }
}

/**
 * 외부 로깅 서비스로 로그 전송 (Sentry, LogRocket 등)
 */
async function sendToExternalService(log: LogEntry) {
  const sentryDsn = process.env.SENTRY_DSN
  if (!sentryDsn) return

  try {
    // Sentry 예시
    await fetch('https://sentry.io/api/123456/store/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sentry-Auth': `Sentry sentry_key=${process.env.SENTRY_KEY}`,
      },
      body: JSON.stringify({
        event_id: crypto.randomUUID(),
        message: log.message,
        level: log.level,
        logger: `logged.${log.source}`,
        timestamp: log.timestamp,
        extra: {
          ...log.data,
          duration: log.duration,
          userAgent: log.userAgent,
          url: log.url,
        },
        tags: {
          source: log.source,
        },
        exception:
          log.stack ?
            [{
              type: log.message,
              value: log.stack,
              stacktrace: { frames: [] },
            }]
          : undefined,
      }),
    })
  } catch (error) {
    console.error('외부 로깅 서비스 전송 실패:', error)
  }
}
