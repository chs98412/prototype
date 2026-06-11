import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { NOTIFICATIONS } from '@/lib/data';
import { Colors } from '@/lib/design';
import Avatar from '@/components/ui/Avatar';
import Pill from '@/components/ui/Pill';
import { EllipsisIcon } from '@/components/ui/Icons';

const ACCENT = Colors.olive;
const FILTERS = ['전체', '좋아요', '코멘트', '팔로우'];

export default function AlertsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>알림</Text>
          <Text style={[styles.subtitle, { color: ACCENT }]}>{NOTIFICATIONS.length} new · 이번 주</Text>
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          {FILTERS.map((f, i) => (
            <Pill key={f} dark={i === 0}>{f}</Pill>
          ))}
        </View>

        {/* Notifications */}
        <View style={styles.list}>
          {NOTIFICATIONS.map(n => (
            <Pressable
              key={n.id}
              onPress={() => n.essayId && router.push(`/essay/${n.essayId}`)}
              style={[styles.item, n.id === 'n1' && styles.itemNew]}
            >
              <Avatar size={38} />
              <View style={styles.itemContent}>
                <Text style={styles.itemText}>
                  <Text style={styles.itemWho}>{n.who}</Text>
                  {n.body}
                </Text>
                <View style={styles.itemMeta}>
                  <View style={[styles.dot, { backgroundColor: dotColor(n.kind) }]} />
                  <Text style={styles.itemWhen}>{n.when}</Text>
                </View>
              </View>
              {n.kind === 'follow' ? (
                <Pressable style={styles.followBtn}>
                  <Text style={styles.followBtnText}>팔로우</Text>
                </Pressable>
              ) : (
                <EllipsisIcon />
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function dotColor(kind: string) {
  if (kind === 'like') return '#c44444';
  if (kind === 'comment') return Colors.olive;
  return '#5887d6';
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  header: {
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
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 4,
  },
  list: { marginTop: 12 },
  item: {
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lineSoft,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  itemNew: {
    backgroundColor: 'rgba(106,112,64,0.04)',
  },
  itemContent: {
    flex: 1,
    minWidth: 0,
  },
  itemText: {
    fontSize: 12.5,
    lineHeight: 19,
    color: '#1f1f1f',
  },
  itemWho: {
    fontWeight: '600',
  },
  itemMeta: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  itemWhen: {
    fontSize: 10,
    color: Colors.mute,
  },
  followBtn: {
    borderWidth: 0.5,
    borderColor: '#1f1f1f',
    backgroundColor: '#1f1f1f',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  followBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
});
