import { useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MOVIES } from '@/lib/data';
import { Colors } from '@/lib/design';
import Poster from '@/components/ui/Poster';
import { SearchIcon, PlusIcon } from '@/components/ui/Icons';

const ACCENT = Colors.olive;
const RECENT = ['스즈메의 문단속', '30일', '에에올', '괴물'];

export default function SearchScreen() {
  const [query, setQuery] = useState('');

  const results = MOVIES.filter(
    m => !query || m.title.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.searchBar}>
          <SearchIcon size={18} color="#666" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="영화, 평론가, 키워드"
            placeholderTextColor="#999"
            style={styles.input}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} style={styles.clearBtn}>
              <Text style={styles.clearText}>×</Text>
            </Pressable>
          )}
        </View>

        {!query && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>최근 검색</Text>
            <View style={styles.recentChips}>
              {RECENT.map(r => (
                <Pressable key={r} onPress={() => setQuery(r)} style={styles.recentChip}>
                  <Text style={styles.recentChipText}>{r}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {!query && (
          <View style={styles.editorialHeader}>
            <Text style={styles.editorialTitle}>이번 주 추천</Text>
            <Text style={[styles.editorialSub, { color: ACCENT }]}>에디터의 픽 · {results.length}편</Text>
          </View>
        )}

        <View style={styles.resultList}>
          {results.map((m, idx) => (
            <Pressable
              key={m.id}
              onPress={() => router.push(`/movie/${m.id}`)}
              style={({ pressed }) => [
                styles.resultItem,
                idx < results.length - 1 && styles.resultBorder,
                pressed && styles.pressed,
              ]}
            >
              <Poster imageKey={m.poster} width={70} height={94} />
              <View style={styles.resultInfo}>
                <Text style={styles.resultTitle}>{m.title}</Text>
                <Text style={[styles.resultMeta, { color: ACCENT }]}>
                  {m.year} · {m.genre} · {m.country}{'\n'}{m.runtime} · {m.rating}
                </Text>
              </View>
              <PlusIcon size={18} color="#9a9a9a" />
            </Pressable>
          ))}
          {results.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>결과가 없습니다.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: { flex: 1 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 18,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: 'rgb(231,231,231)',
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: '#1f1f1f',
    padding: 0,
  },
  clearBtn: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: {
    color: '#fff',
    fontSize: 11,
    lineHeight: 14,
  },
  recentSection: {
    marginTop: 24,
    paddingHorizontal: 22,
  },
  sectionTitle: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  recentChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentChip: {
    borderWidth: 0.5,
    borderColor: Colors.line,
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  recentChipText: {
    fontSize: 12,
    color: '#1f1f1f',
  },
  editorialHeader: {
    marginTop: 32,
    paddingHorizontal: 22,
  },
  editorialTitle: {
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 20,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  editorialSub: {
    marginTop: 4,
    fontSize: 11,
    letterSpacing: 0.6,
  },
  resultList: {
    marginTop: 22,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    paddingHorizontal: 22,
    paddingVertical: 16,
  },
  resultBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.lineSoft,
  },
  pressed: { opacity: 0.85 },
  resultInfo: {
    flex: 1,
    minWidth: 0,
  },
  resultTitle: {
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  resultMeta: {
    marginTop: 8,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '500',
  },
  empty: {
    paddingVertical: 60,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: Colors.mute,
  },
});
