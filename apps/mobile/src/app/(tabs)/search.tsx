import React, { useState } from 'react'
import { View, Text, TextInput, ScrollView, Pressable, ActivityIndicator, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { searchMovies, getImageUrl } from '../../lib/tmdb'
import { Colors } from '../../lib/design'

const recent = ['스즈메의 문단속', '괴물', '인터스텔라', '어바웃 타임']

export default function SearchScreen() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (text: string) => {
    setQuery(text)
    if (text.length < 2) { setResults([]); return }
    setLoading(true)
    try {
      const movies = await searchMovies(text)
      setResults(movies)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      {/* 검색창 */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.input}
            placeholder="영화, 감독, 키워드"
            placeholderTextColor={Colors.mute}
            value={query}
            onChangeText={handleSearch}
          />
          {query.length > 0 && (
            <Pressable onPress={() => { setQuery(''); setResults([]) }} style={styles.clearBtn}>
              <Text style={styles.clearText}>×</Text>
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {!query && (
          <>
            {/* 최근 검색 */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>최근 검색</Text>
              <View style={styles.recentWrap}>
                {recent.map(r => (
                  <Pressable key={r} onPress={() => handleSearch(r)} style={styles.recentChip}>
                    <Text style={styles.recentText}>{r}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* 이번 주 추천 헤더 */}
            <View style={styles.section}>
              <Text style={styles.editorialTitle}>이번 주 추천</Text>
              <Text style={styles.editorialSub}>에디터의 픽</Text>
            </View>
          </>
        )}

        {/* 검색 결과 */}
        {loading && (
          <View style={styles.center}>
            <ActivityIndicator color={Colors.olive} />
          </View>
        )}

        {results.map((movie, idx) => (
          <Pressable
            key={movie.id}
            onPress={() => router.push(`/movie/${movie.id}`)}
            style={[styles.movieRow, idx < results.length - 1 && styles.movieRowBorder]}
          >
            <View style={styles.moviePoster}>
              {/* 포스터 자리 */}
            </View>
            <View style={styles.movieInfo}>
              <Text style={styles.movieTitle}>{movie.title}</Text>
              <Text style={styles.movieMeta}>
                {movie.release_date?.slice(0, 4)} · {movie.original_language?.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.plusIcon}>＋</Text>
          </Pressable>
        ))}

        {!loading && results.length === 0 && query.length >= 2 && (
          <View style={styles.center}>
            <Text style={styles.noResult}>결과가 없습니다.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  searchWrap: { paddingHorizontal: 18, paddingTop: 60, paddingBottom: 0 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: 'rgb(231,231,231)',
    gap: 10,
  },
  searchIcon: { fontSize: 16 },
  input: { flex: 1, fontSize: 13, color: Colors.inkSoft },
  clearBtn: {
    width: 18,
    height: 18,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: { color: '#fff', fontSize: 13, lineHeight: 18 },
  section: { paddingHorizontal: 22, paddingTop: 28 },
  sectionLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  recentWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  recentChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 0.5,
    borderColor: Colors.line,
    backgroundColor: '#fff',
  },
  recentText: { fontSize: 12, color: Colors.inkSoft },
  editorialTitle: {
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 20,
    letterSpacing: -0.3,
    color: Colors.inkSoft,
  },
  editorialSub: { marginTop: 4, fontSize: 11, color: Colors.olive, fontWeight: '500', letterSpacing: 1 },
  center: { paddingVertical: 60, alignItems: 'center' },
  movieRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    paddingVertical: 16,
    paddingHorizontal: 22,
  },
  movieRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.lineSoft },
  moviePoster: {
    width: 50,
    height: 70,
    borderRadius: 3,
    backgroundColor: Colors.lineSoft,
    flexShrink: 0,
  },
  movieInfo: { flex: 1, minWidth: 0 },
  movieTitle: {
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 15,
    letterSpacing: -0.3,
    color: Colors.inkSoft,
  },
  movieMeta: { marginTop: 6, fontSize: 11, color: Colors.olive, fontWeight: '500', lineHeight: 18 },
  plusIcon: { fontSize: 20, color: '#9a9a9a' },
  noResult: { fontSize: 13, color: Colors.mute },
})
