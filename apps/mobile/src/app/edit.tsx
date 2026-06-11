import { useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ME } from '@/lib/data';
import { Images } from '@/lib/images';
import { Colors } from '@/lib/design';
import SubHeader from '@/components/ui/SubHeader';

const ACCENT = Colors.olive;

type FormState = {
  name: string;
  handle: string;
  lineTag: string;
  listName: string;
  bio: string;
};

export default function EditScreen() {
  const [form, setForm] = useState<FormState>({
    name: ME.name,
    handle: ME.handle,
    lineTag: '영화를 존나게 좋아합니다 진짜루요',
    listName: '내가 뭘 봤게?',
    bio: ME.bio,
  });

  const set = (k: keyof FormState, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <SubHeader
        title="프로필 편집"
        onBack={() => router.back()}
        trailing={
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.doneBtn, { color: ACCENT }]}>완료</Text>
          </Pressable>
        }
      />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {Images.profile && (
              <Image source={Images.profile} style={styles.avatarImage} resizeMode="cover" />
            )}
            <View style={styles.avatarOverlay} />
          </View>
          <View style={styles.avatarBtns}>
            <Pressable style={styles.editBtn}>
              <Text style={styles.editBtnText}>사진 선택</Text>
            </Pressable>
            <Pressable style={styles.editBtn}>
              <Text style={styles.editBtnText}>사진 삭제</Text>
            </Pressable>
          </View>
        </View>

        {/* Fields */}
        <View style={styles.fields}>
          {([
            ['별명', 'name'],
            ['이름', 'handle'],
            ['한 줄 설명', 'lineTag'],
            ['목록 이름', 'listName'],
          ] as [string, keyof FormState][]).map(([label, key]) => (
            <FieldRow key={key} label={label}>
              <TextInput
                value={form[key]}
                onChangeText={v => set(key, v)}
                style={styles.input}
                placeholderTextColor="#999"
              />
            </FieldRow>
          ))}
          <FieldRow label="소개">
            <TextInput
              value={form.bio}
              onChangeText={v => set('bio', v)}
              style={[styles.input, styles.textarea]}
              multiline
              numberOfLines={3}
              placeholderTextColor="#999"
            />
          </FieldRow>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={fieldStyles.row}>
      <Text style={fieldStyles.label}>{label}</Text>
      {children}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  row: { marginBottom: 18 },
  label: {
    fontSize: 10,
    color: '#888',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
    fontWeight: '600',
  },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  doneBtn: {
    fontSize: 12,
    fontWeight: '600',
  },
  avatarSection: {
    paddingTop: 22,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 150,
    height: 200,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  avatarImage: {
    width: 150,
    height: 200,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  avatarBtns: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  editBtn: {
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: Colors.lineSoft,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 1,
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '500',
  },
  fields: {
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 20,
  },
  input: {
    width: '100%',
    fontSize: 13,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lineSoft,
    color: '#1f1f1f',
  },
  textarea: {
    height: 72,
    textAlignVertical: 'top',
    fontFamily: 'NotoSerifKR_500Medium',
  },
});
