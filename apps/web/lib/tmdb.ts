const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_KEY = process.env.REACT_APP_TMDB_KEY || ''

export async function searchMovies(query: string) {
  const res = await fetch(`${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&query=${query}&language=ko-KR`)
  const data = await res.json()
  return data.results || []
}

export async function getMovieDetail(id: number) {
  const res = await fetch(`${TMDB_BASE}/movie/${id}?api_key=${TMDB_KEY}&language=ko-KR`)
  return res.json()
}

export function getImageUrl(path: string) {
  if (!path) return null
  return `https://image.tmdb.org/t/p/w500${path}`
}
