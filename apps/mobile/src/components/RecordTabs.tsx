import React, { useState, useEffect } from 'react'
import {
  View, Text, FlatList, Pressable, Image, ActivityIndicator, StyleSheet
} from 'react-native'
import { useRouter } from 'expo-router'
import { apiCall } from '../lib/api-client'
import { getImageUrl } from '../lib/tmdb'

type Status = 'watched' | 'watching' | 'want'

const TABS: { id: Status; label: string }[] = [
  { id: 'watched', label: '봄' },
  { id: 'watching', label: '보는 중' },
  { id: 'want', label: '보고 싶음' },
]

interface Record {
  id: string
  tmdb_id: number
  media_type: string
  status: Status
  rating?: number
  poster_path?: string
}

export function RecordTabs() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Status>('watched')
  const [records, setRecords] = useState<Record[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecords()
  }, [activeTab])

  const loadRecords = async () => {
    setLoading(true)
    const { data } = await apiCall<Record[]>(`/v1/records?status=${activeTab}&limit=100`)
    setRecords(data || [])
    setLoading(false)
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0a0a0a" style={styles.loader} />
      ) : records.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🎬</Text>
          <Text style={styles.emptyText}>아직 기록이 없어요</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          numColumns={3}
          keyExtractor={(item) => `${item.media_type}-${item.tmdb_id}`}
          columnWrapperStyle={styles.row}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <Pressable
              style={styles.cell}
              onPress={() => router.push(`/movie/${item.tmdb_id}`)}
            >
              <View style={styles.poster}>
                {item.poster_path ? (
                  <Image
                    source={{ uri: getImageUrl(item.poster_path)! }}
                    style={StyleSheet.absoluteFill}
                  />
                ) : (
                  <Text style={styles.fallbackIcon}>🎬</Text>
                )}
                {item.rating != null && activeTab === 'watched' && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>⭐{item.rating}</Text>
                  </View>
                )}
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabs: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  tabActive: { backgroundColor: '#0a0a0a' },
  tabText: { fontSize: 13, fontWeight: '500', color: '#666' },
  tabTextActive: { color: '#fff' },
  loader: { marginTop: 32 },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyIcon: { fontSize: 32 },
  emptyText: { fontSize: 14, color: '#666' },
  row: { gap: 6, marginBottom: 6 },
  cell: { flex: 1 / 3 },
  poster: {
    aspectRatio: 2 / 3,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackIcon: { fontSize: 24 },
  badge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
})
