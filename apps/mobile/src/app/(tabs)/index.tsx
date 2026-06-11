import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FEED_ITEMS, ESSAYS, ESSAY_BY_ID } from '@/lib/data';
import { Colors } from '@/lib/design';
import DayDivider from '@/components/cards/DayDivider';
import EssayCard from '@/components/cards/EssayCard';
import RatingCard from '@/components/cards/RatingCard';
import LogCard from '@/components/cards/LogCard';
import QuoteCard from '@/components/cards/QuoteCard';
import ListCard from '@/components/cards/ListCard';
import Pill from '@/components/ui/Pill';
import { PencilIcon } from '@/components/ui/Icons';

const ACCENT = Colors.olive;
const FILTERS = ['전체', '에세이', '한줄평', '로그', '인용', '컬렉션'];

export default function FeedScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Masthead */}
        <View style={styles.masthead}>
          <View>
            <Text style={styles.title}>피드</Text>
            <Text style={[styles.subtitle, { color: ACCENT }]}>essays · ratings · logs · 이번 주</Text>
          </View>
          <Pressable onPress={() => router.push('/editor')} style={styles.writeBtn} hitSlop={8}>
            <PencilIcon />
          </Pressable>
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f, i) => (
            <Pill key={f} dark={i === 0} style={styles.filterChip}>{f}</Pill>
          ))}
        </ScrollView>

        {/* Feed items */}
        <View>
          {FEED_ITEMS.map((item, i) => {
            if (item.kind === 'day') {
              return <DayDivider key={i} when={item.when} accent={ACCENT} />;
            }
            if (item.kind === 'essay') {
              const essay = ESSAY_BY_ID[item.essayId];
              return essay ? <EssayCard key={i} essay={essay} accent={ACCENT} /> : null;
            }
            if (item.kind === 'rating') {
              return <RatingCard key={i} item={item} accent={ACCENT} />;
            }
            if (item.kind === 'log') {
              return <LogCard key={i} item={item} accent={ACCENT} />;
            }
            if (item.kind === 'quote') {
              return <QuoteCard key={i} item={item} accent={ACCENT} />;
            }
            if (item.kind === 'list') {
              return <ListCard key={i} item={item} accent={ACCENT} />;
            }
            return null;
          })}
        </View>

        {/* Footer */}
        <View style={styles.footerMast}>
          <Text style={styles.footerBrand}>L O G G E D</Text>
          <Text style={styles.footerSub}>vol. 014 · 평론 매거진</Text>
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
  scroll: {
    flex: 1,
  },
  masthead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 6,
  },
  title: {
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 28,
    fontWeight: '500',
    letterSpacing: -0.6,
    lineHeight: 32,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  writeBtn: {
    padding: 6,
  },
  filterRow: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    gap: 8,
  },
  filterChip: {
    flexShrink: 0,
  },
  footerMast: {
    marginTop: 20,
    paddingVertical: 30,
    paddingHorizontal: 22,
    borderTopWidth: 1,
    borderTopColor: Colors.lineSoft,
    alignItems: 'center',
  },
  footerBrand: {
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 6,
  },
  footerSub: {
    marginTop: 6,
    fontSize: 10,
    color: Colors.mute,
  },
});
