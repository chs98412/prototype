export const API_URL = process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://logged-backend.fly.dev'
    : 'http://localhost:8080')

export const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || ''
export const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY || ''
