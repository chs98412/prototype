import React, { useState } from 'react'
import { View, Text, TextInput, ScrollView, ActivityIndicator, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { searchMovies } from '../../lib/tmdb'
import { MovieCard } from '../../components/MovieCard'

export default function SearchScreen() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (text: string) => {
    setQuery(text)
    if (text.length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const movies = await searchMovies(text)
      setResults(movies)
    } catch (error) {
      console.error('검색 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          placeholder="영화 검색..."
          placeholderTextColor="#999"
          value={query}
          onChangeText={handleSearch}
        />
      </View>
      <ScrollView style={styles.results}>
        {loading && <ActivityIndicator size="large" color="#0a0a0a" />}
        {results.map((movie) => (
          <MovieCard
            key={movie.id}
            id={movie.id}
            title={movie.title}
            posterPath={movie.poster_path}
            rating={movie.vote_average}
            onPress={(id) => router.push(`/movie/${id}`)}
          />
        ))}
        {!loading && results.length === 0 && query.length >= 2 && (
          <Text style={styles.noResults}>검색 결과가 없습니다</Text>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchBox: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0a0a0a',
  },
  results: { padding: 16 },
  noResults: { textAlign: 'center', color: '#666', marginTop: 24 },
})
