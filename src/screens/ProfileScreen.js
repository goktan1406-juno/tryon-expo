import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, StatusBar, Alert, ScrollView, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useImagePicker } from '../hooks/useImagePicker';
import { useProfile } from '../hooks/useProfile';
import { colors, fonts, spacing } from '../utils/theme';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const TIPS = [
  {
    icon: '🧍',
    title: 'Face forward, stand straight',
    desc: 'Keep your arms slightly away from your body',
    good: '✓',
    bad: '✗',
  },
  {
    icon: '👕',
    title: 'Wear simple clothing',
    desc: 'Fitted, not baggy or layered',
    good: '✓',
    bad: '✗',
  },
  {
    icon: '🌿',
    title: 'Plain background',
    desc: 'White wall or solid floor is ideal',
    good: '✓',
    bad: '✗',
  },
  {
    icon: '☀️',
    title: 'Good lighting',
    desc: 'Natural light, no shadows or backlighting',
    good: '✓',
    bad: '✗',
  },
];

export default function ProfileScreen({ navigation, route }) {
  const returnTo = route?.params?.returnTo;
  const { profile, saveProfile, clearProfile } = useProfile();
  const picker = useImagePicker();
  const [name, setName] = useState('');
  const [size, setSize] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.photoUri) picker.setExternalImage({ uri: profile.photoUri });
    if (profile?.name)     setName(profile.name);
    if (profile?.size)     setSize(profile.size);
  }, [profile]);

  const handleSave = async () => {
    if (!picker.image) return;
    setSaving(true);
    try {
      await saveProfile({ photoUri: picker.image.uri, name: name.trim(), size });
      navigation.navigate(returnTo || 'Upload');
    } catch (e) {
      Alert.alert('Error', 'Could not save profile: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    Alert.alert('Delete Profile', 'Are you sure you want to delete all profile data?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await clearProfile();
          picker.clear();
          setName('');
          setSize('');
        },
      },
    ]);
  };

  const hasPhoto = !!picker.image;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.cream} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MY PROFILE</Text>
        {profile?.photoUri ? (
          <TouchableOpacity onPress={handleClear}>
            <Text style={styles.deleteBtn}>Delete</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Photo + info row */}
        <View style={styles.photoRow}>
          {/* Photo */}
          <TouchableOpacity style={styles.photoBox} onPress={picker.showPicker} activeOpacity={0.85}>
            {hasPhoto ? (
              <>
                <Image source={{ uri: picker.image.uri }} style={styles.photo} resizeMode="cover" />
                <View style={styles.editOverlay}>
                  <Text style={styles.editText}>CHANGE</Text>
                </View>
              </>
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.plusIcon}>+</Text>
                <Text style={styles.addPhotoText}>Add{'\n'}Photo</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Name + size */}
          <View style={styles.infoCol}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>NAME (optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Your name"
                placeholderTextColor={colors.ashLight}
                value={name}
                onChangeText={setName}
                returnKeyType="done"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>SIZE</Text>
              <View style={styles.sizeRow}>
                {SIZES.map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.sizeBtn, size === s && styles.sizeBtnActive]}
                    onPress={() => setSize(s)}
                    activeOpacity={0.7}>
                    <Text style={[styles.sizeBtnText, size === s && styles.sizeBtnTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Tips section */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsSectionTitle}>For best results</Text>
          <Text style={styles.tipsSectionSub}>Photos matching these criteria produce much more realistic results</Text>

          <View style={styles.tipsGrid}>
            {TIPS.map((tip) => (
              <View key={tip.title} style={styles.tipCard}>
                <Text style={styles.tipIcon}>{tip.icon}</Text>
                <Text style={styles.tipCardTitle}>{tip.title}</Text>
                <Text style={styles.tipCardDesc}>{tip.desc}</Text>
              </View>
            ))}
          </View>

          {/* Do / Don't visual */}
          <View style={styles.dosDonts}>
            <View style={styles.dosDontCol}>
              <View style={[styles.dosDontBadge, { backgroundColor: '#2d6a4f' }]}>
                <Text style={styles.dosDontBadgeText}>✓  IDEAL</Text>
              </View>
              {['Face forward', 'Plain background', 'Good lighting', 'Fitted clothing'].map(t => (
                <Text key={t} style={styles.dosDontItem}>— {t}</Text>
              ))}
            </View>
            <View style={styles.dosDontDivider} />
            <View style={styles.dosDontCol}>
              <View style={[styles.dosDontBadge, { backgroundColor: colors.error }]}>
                <Text style={styles.dosDontBadgeText}>✗  AVOID</Text>
              </View>
              {['Side profile', 'Busy background', 'Dark environment', 'Baggy clothing'].map(t => (
                <Text key={t} style={styles.dosDontItem}>— {t}</Text>
              ))}
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Save button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.saveBtn, !hasPhoto && styles.saveBtnDisabled]}
          disabled={!hasPhoto || saving}
          activeOpacity={0.85}
          onPress={handleSave}>
          <Text style={[styles.saveBtnText, !hasPhoto && styles.saveBtnTextDisabled]}>
            {saving ? 'SAVING...' : 'SAVE PROFILE'}
          </Text>
        </TouchableOpacity>
        {!hasPhoto && (
          <Text style={styles.saveHint}>A photo is required to save your profile</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.sand,
  },
  backBtn: { ...fonts.bodyMedium, fontSize: 14, color: colors.copper },
  headerTitle: { ...fonts.label, fontSize: 10, color: colors.ash },
  deleteBtn: { ...fonts.bodyMedium, fontSize: 13, color: colors.error },

  scroll: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg },

  /* Photo row */
  photoRow: { flexDirection: 'row', gap: spacing.md },
  photoBox: {
    width: 130, height: 170,
    borderWidth: 1, borderColor: colors.sand,
    backgroundColor: colors.white, overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%' },
  editOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: `${colors.ink}CC`, paddingVertical: 6, alignItems: 'center',
  },
  editText: { ...fonts.label, fontSize: 8, color: colors.cream },
  photoPlaceholder: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: `${colors.sand}40`,
  },
  plusIcon: { fontSize: 28, color: colors.ashLight },
  addPhotoText: { ...fonts.bodyLight, fontSize: 12, color: colors.ash, textAlign: 'center' },

  infoCol: { flex: 1, gap: spacing.md, justifyContent: 'center' },
  inputGroup: { gap: 6 },
  inputLabel: { ...fonts.label, fontSize: 8, color: colors.ash },
  textInput: {
    borderWidth: 1, borderColor: colors.sand,
    paddingHorizontal: spacing.sm + 4, paddingVertical: spacing.sm,
    ...fonts.bodyRegular, fontSize: 14, color: colors.ink,
    backgroundColor: colors.white,
  },
  sizeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  sizeBtn: {
    borderWidth: 1, borderColor: colors.sand,
    paddingHorizontal: 10, paddingVertical: 5,
    backgroundColor: colors.white,
  },
  sizeBtnActive: { borderColor: colors.copper, backgroundColor: colors.copper },
  sizeBtnText: { ...fonts.label, fontSize: 9, color: colors.ash },
  sizeBtnTextActive: { color: colors.cream },

  divider: { height: 1, backgroundColor: colors.sand },

  /* Tips */
  tipsSection: { gap: spacing.md },
  tipsSectionTitle: { ...fonts.displayLight, fontSize: 20, color: colors.ink },
  tipsSectionSub: { ...fonts.bodyLight, fontSize: 12, color: colors.ash, lineHeight: 18, marginTop: -spacing.sm },

  tipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tipCard: {
    width: '47%',
    borderWidth: 1, borderColor: colors.sand,
    backgroundColor: colors.white,
    padding: spacing.md, gap: 6,
  },
  tipIcon: { fontSize: 24 },
  tipCardTitle: { ...fonts.bodyMedium, fontSize: 13, color: colors.ink },
  tipCardDesc: { ...fonts.bodyLight, fontSize: 11, color: colors.ash, lineHeight: 16 },

  dosDonts: {
    flexDirection: 'row',
    borderWidth: 1, borderColor: colors.sand,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  dosDontCol: { flex: 1, gap: 6, padding: spacing.md },
  dosDontDivider: { width: 1, backgroundColor: colors.sand },
  dosDontBadge: {
    paddingHorizontal: spacing.sm, paddingVertical: 4, alignSelf: 'flex-start',
  },
  dosDontBadgeText: { ...fonts.label, fontSize: 8, color: colors.cream },
  dosDontItem: { ...fonts.bodyLight, fontSize: 11, color: colors.ash },

  /* Bottom */
  bottomBar: {
    padding: spacing.lg, paddingBottom: spacing.xl,
    borderTopWidth: 1, borderTopColor: colors.sand,
    backgroundColor: colors.cream, gap: spacing.sm,
  },
  saveBtn: { backgroundColor: colors.ink, paddingVertical: spacing.md + 2, alignItems: 'center' },
  saveBtnDisabled: { backgroundColor: colors.sand },
  saveBtnText: { ...fonts.label, fontSize: 11, color: colors.cream, letterSpacing: 3 },
  saveBtnTextDisabled: { color: colors.ash },
  saveHint: { ...fonts.bodyLight, fontSize: 11, color: colors.ashLight, textAlign: 'center' },
});
