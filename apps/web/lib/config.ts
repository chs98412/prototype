export const API_URL = process.env.NEXT_PUBLIC_API_URL ||
  (typeof window === 'undefined' && process.env.NODE_ENV === 'production'
    ? 'https://logged-backend.fly.dev'
    : 'http://localhost:8080')
export const TMDB_BASE = 'https://api.themoviedb.org/3'
export const IMG_BASE = 'https://image.tmdb.org/t/p'
