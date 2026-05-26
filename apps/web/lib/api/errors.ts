export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = '인증이 필요합니다') {
    super(401, 'UNAUTHORIZED', message)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = '접근 권한이 없습니다') {
    super(403, 'FORBIDDEN', message)
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends ApiError {
  constructor(message = '요청한 리소스를 찾을 수 없습니다') {
    super(404, 'NOT_FOUND', message)
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends ApiError {
  constructor(
    public fields?: Record<string, string>,
    message = '입력값이 올바르지 않습니다'
  ) {
    super(400, 'VALIDATION_ERROR', message)
    this.name = 'ValidationError'
  }
}

export class NetworkError extends ApiError {
  constructor(message = '네트워크 오류가 발생했습니다') {
    super(0, 'NETWORK_ERROR', message)
    this.name = 'NetworkError'
  }
}

export function parseApiError(status: number, data: any): ApiError {
  const message = data?.error || data?.message || `HTTP ${status}`

  switch (status) {
    case 400:
      return new ValidationError(data?.fields, message)
    case 401:
      return new UnauthorizedError(message)
    case 403:
      return new ForbiddenError(message)
    case 404:
      return new NotFoundError(message)
    default:
      return new ApiError(status, `HTTP_${status}`, message)
  }
}
