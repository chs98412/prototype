import React, { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { getMovieDetail, getImageUrl } from '../../lib/tmdb'
import { apiCall } from '../../lib/api-client'

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [movie, setMovie] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)

  useEffect(() => {
    getMovieDetail(Number(id)).then((data) => {
      setMovie(data)
      setLoading(false)
    })
  }, [id])

  const handleSaveRating = async (value: number) => {
    setRating(value)
    await apiCall('/v1/records', {
      method: 'POST',
      body: { tmdb_id: Number(id), media_type: 'movie', status: 'watched', rating: value },
    })
  }

  if (loading) return <View style={styles.container}><ActivityIndicator size="large" color="#0a0a0a" /></View>
  if (!movie) return <View style={styles.container}><Text style={styles.error}>영화를 불러올 수 없습니다</Text></View>

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← 뒤로</Text>
      </Pressable>
      <ScrollView contentContainerStyle={styles.content}>
        {getImageUrl(movie.backdrop_path) && (
          <Image source={{ uri: getImageUrl(movie.backdrop_path)! }} style={styles.backdrop} />
        )}
        <View style={styles.header}>
          {getImageUrl(movie.poster_path) && (
            <Image source={{ uri: getImageUrl(movie.poster_path)! }} style={styles.poster} />
          )}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{movie.title}</Text>
            <Text style={styles.year}>{movie.release_date?.slice(0, 4)}</Text>
            <Text style={styles.tmdbRating}>⭐ {movie.vote_average.toFixed(1)}</Text>
          </View>
        </View>
        <View style={styles.overview}>
          <Text style={styles.overviewText}>{movie.overview}</Text>
        </View>
        <View style={styles.ratingSection}>
          <Text style={styles.ratingLabel}>내 별점</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => handleSaveRating(star)}>
                <Text style={[styles.star, { color: rating >= star ? '#FFD700' : '#ddd' }]}>★</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  backButton: { padding: 16 },
  backText: { fontSize: 16, color: '#0a0a0a', fontWeight: '600' },
  content: { paddingBottom: 32 },
  backdrop: { width: '100%', height: 200, backgroundColor: '#e0e0e0' },
  header: { flexDirection: 'row', padding: 16, gap: 16 },
  poster: { width: 100, height: 150, borderRadius: 8, backgroundColor: '#e0e0e0' },
  titleSection: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0a0a0a', marginBottom: 4 },
  year: { fontSize: 14, color: '#666', marginBottom: 8 },
  tmdbRating: { fontSize: 16, color: '#FFD700' },
  overview: { paddingHorizontal: 16, marginBottom: 24 },
  overviewText: { fontSize: 14, color: '#666', lineHeight: 20 },
  ratingSection: { paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 16 },
  ratingLabel: { fontSize: 16, fontWeight: '600', color: '#0a0a0a', marginBottom: 12 },
  stars: { flexDirection: 'row', gap: 8 },
  star: { fontSize: 32 },
  error: { color: '#666', textAlign: 'center', marginTop: 32 },
})
