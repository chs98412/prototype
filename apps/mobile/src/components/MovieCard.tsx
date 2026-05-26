import React from 'react'
import { View, Text, Image, Pressable, StyleSheet } from 'react-native'
import { getImageUrl } from '../lib/tmdb'

interface MovieCardProps {
  id: number
  title: string
  posterPath: string
  rating: number
  onPress: (id: number) => void
}

export function MovieCard({ id, title, posterPath, rating, onPress }: MovieCardProps) {
  const imageUrl = getImageUrl(posterPath)

  return (
    <Pressable onPress={() => onPress(id)} style={styles.card}>
      {imageUrl && <Image source={{ uri: imageUrl }} style={styles.poster} />}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        {rating > 0 && <Text style={styles.rating}>⭐ {rating.toFixed(1)}</Text>}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  poster: {
    width: '100%',
    height: 300,
    backgroundColor: '#e0e0e0',
  },
  info: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0a0a0a',
    marginBottom: 8,
  },
  rating: {
    fontSize: 12,
    color: '#666',
  },
})
