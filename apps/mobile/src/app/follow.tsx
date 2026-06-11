import { useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { FOLLOWS, ME } from '@/lib/data';
import { Colors } from '@/lib/design';
import SubHeader from '@/components/ui/SubHeader';
import Avatar from '@/components/ui/Avatar';

type FollowTab = 'following' | 'followers';

export default function FollowScreen() {
  const { tab: initialTab } = useLocalSearchParams<{ tab?: FollowTab }>();
  const [tab, setTab] = useState<FollowTab>(initialTab ?? 'following');
  const [list, setList] = useState(FOLLOWS);

  const toggle = (id: string) =>
    setList(l => l.map(u => (u.id === id ? { ...u, following: !u.following } : u)));

  const visible = tab === 'following' ? list.filter(u => u.following) : list;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <SubHeader title={ME.name} />

      {/* Tabs */}
      <View style={styles.tabRow}>
        {([
          ['following', '팔로잉', ME.stats.following],
          ['followers', '팔로워', ME.stats.followers],
        ] as const).map(([k, label, count]) => (
          <Pressable key={k} onPress={() => setTab(k)} style={styles.tabItem}>
            <Text style={[styles.tabLabel, tab === k && styles.tabLabelActive]}>{label}</Text>
            <Text style={[styles.tabCount, tab === k && styles.tabCountActive]}>{count}</Text>
            <View style={[styles.tabLine, tab === k && styles.tabLineActive]} />
          </Pressable>
        ))}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {visible.map(u => (
          <View key={u.id} style={styles.row}>
            <Avatar size={42} />
            <View style={styles.info}>
              <Text style={styles.name}>{u.name}</Text>
              <Text style={styles.handle}>{u.handle}</Text>
              <Text style={[styles.bio, { color: Colors.olive }]}>{u.bio}</Text>
            </View>
            <Pressable
              onPress={() => toggle(u.id)}
              style={[styles.btn, u.following ? styles.btnFollowing : styles.btnFollow]}
            >
              <Text style={[styles.btnText, u.following ? styles.btnTextFollowing : styles.btnTextFollow]}>
                {u.following ? '팔로잉' : '팔로우'}
              </Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.lineSoft,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  tabLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  tabLabelActive: { color: '#000' },
  tabCount: {
    marginTop: 2,
    fontFamily: 'NotoSerifKR_500Medium',
    fontSize: 14,
    color: '#999',
  },
  tabCountActive: { color: '#000' },
  tabLine: {
    height: 2,
    width: '80%',
    backgroundColor: 'transparent',
    marginTop: 4,
    borderRadius: 1,
  },
  tabLineActive: { backgroundColor: '#000' },
  scroll: { flex: 1 },
  row: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lineSoft,
  },
  info: { flex: 1, minWidth: 0 },
  name: { fontSize: 14, fontWeight: '600' },
  handle: { fontSize: 11, color: Colors.mute, marginTop: 1 },
  bio: {
    marginTop: 2,
    fontSize: 11,
    fontFamily: 'NotoSerifKR_500Medium',
  },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 0.5,
  },
  btnFollowing: {
    backgroundColor: '#fff',
    borderColor: Colors.lineSoft,
  },
  btnFollow: {
    backgroundColor: '#1f1f1f',
    borderColor: '#1f1f1f',
  },
  btnText: { fontSize: 10, fontWeight: '500' },
  btnTextFollowing: { color: '#1f1f1f' },
  btnTextFollow: { color: '#fff' },
});
