import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Image, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useImagePicker } from '../hooks/useImagePicker';
import { useProfile } from '../hooks/useProfile';
import { useCredits } from '../hooks/useCredits';
import { colors, fonts, spacing } from '../utils/theme';

export default function UploadScreen({ navigation }) {
  const { profile } = useProfile();
  const { hasCredits } = useCredits();
  const clothing = useImagePicker();

  const [category, setCategory] = useState('tops');

  const canGenerate = !!profile?.photoUri && !!clothing.image;

  const handleGenerate = () => {
    if (!hasCredits) {
      navigation.navigate('Paywall', { returnTo: 'Upload' });
      return;
    }
    navigation.navigate('Processing', {
      userImageUri:     profile.photoUri,
      clothingImageUri: clothing.image?.uri,
      productLink:      null,
      category,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.cream} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ADD CLOTHING</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* Profile strip */}
        <TouchableOpacity
          style={styles.profileStrip}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Profile', { returnTo: 'Upload' })}>
          {profile?.photoUri ? (
            <Image source={{ uri: profile.photoUri }} style={styles.profileThumb} resizeMode="cover" />
          ) : (
            <View style={styles.profileThumbEmpty}>
              <Text style={styles.profileThumbPlus}>+</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>
              {profile?.name || (profile?.photoUri ? 'My Profile' : 'No profile created')}
            </Text>
            <Text style={styles.profileSub}>
              {profile?.photoUri
                ? (profile?.size ? `Size ${profile.size}  ·  Tap to edit` : 'Tap to edit')
                : 'Tap to add your photo'}
            </Text>
          </View>
          <Text style={styles.profileArrow}>›</Text>
        </TouchableOpacity>

        {/* Clothing card */}
        <View style={card.container}>
          <View style={card.header}>
            <View style={card.badge}>
              <Text style={card.badgeText}>01</Text>
            </View>
            <Text style={card.title}>Clothing</Text>
          </View>

          {clothing.image ? (
            <View>
              <Image source={{ uri: clothing.image.uri }} style={card.image} resizeMode="cover" />
              <TouchableOpacity style={card.clearBtn} onPress={clothing.clear}>
                <Text style={card.clearText}>✕</Text>
              </TouchableOpacity>
              <View style={card.successBadge}>
                <Text style={card.successText}>✓ UPLOADED</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={card.placeholder} onPress={clothing.showPicker} activeOpacity={0.7}>
              <Text style={card.plusIcon}>+</Text>
              <Text style={card.placeholderTitle}>Clothing Image</Text>
              <Text style={card.placeholderHint}>Take a screenshot from the product page</Text>
              <View style={styles.tipList}>
                {['Zara, H&M, ASOS, Shein...', 'Any store works', 'Single item gives best results'].map(t => (
                  <Text key={t} style={styles.tipText}>— {t}</Text>
                ))}
              </View>
              <View style={card.uploadBtn}>
                <Text style={card.uploadBtnText}>ADD IMAGE</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Category selector */}
        <View style={styles.catCard}>
          <Text style={styles.catLabel}>CLOTHING TYPE</Text>
          <View style={styles.catRow}>
            {[
              { id: 'tops',       icon: '👕', label: 'Top' },
              { id: 'bottoms',    icon: '👖', label: 'Bottom' },
              { id: 'one-pieces', icon: '👗', label: 'One-piece' },
            ].map(c => (
              <TouchableOpacity
                key={c.id}
                style={[styles.catItem, category === c.id && styles.catItemActive]}
                onPress={() => setCategory(c.id)}
                activeOpacity={0.8}>
                <Text style={styles.catIcon}>{c.icon}</Text>
                <Text style={[styles.catText, category === c.id && styles.catTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.generateBtn, !canGenerate && styles.generateBtnDisabled]}
          disabled={!canGenerate}
          activeOpacity={0.85}
          onPress={handleGenerate}>
          <Text style={[styles.generateText, !canGenerate && styles.generateTextDisabled]}>
            {!profile?.photoUri
              ? 'Create a profile first'
              : !clothing.image
              ? 'Add a clothing item'
              : !hasCredits
              ? 'BUY CREDITS'
              : 'CREATE TRY-ON'}
          </Text>
        </TouchableOpacity>
        {canGenerate && <Text style={styles.timeHint}>~30-60 seconds</Text>}
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
  scroll: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg },

  profileStrip: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    borderWidth: 1, borderColor: colors.sand, backgroundColor: colors.white,
    padding: spacing.md,
  },
  profileThumb: { width: 56, height: 56 },
  profileThumbEmpty: {
    width: 56, height: 56, backgroundColor: `${colors.sand}80`,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.sand,
  },
  profileThumbPlus: { fontSize: 22, color: colors.ashLight },
  profileName: { ...fonts.bodyMedium, fontSize: 13, color: colors.ink, marginBottom: 2 },
  profileSub: { ...fonts.bodyLight, fontSize: 11, color: colors.ash },
  profileArrow: { fontSize: 22, color: colors.ashLight, marginRight: 4 },

  tipList: { gap: 3, marginTop: spacing.xs },
  tipText: { ...fonts.bodyLight, fontSize: 11, color: colors.ashLight },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.cream,
    borderTopWidth: 1, borderTopColor: colors.sand,
    padding: spacing.lg, paddingBottom: spacing.xl, gap: spacing.sm,
  },
  generateBtn: { backgroundColor: colors.ink, paddingVertical: spacing.md + 2, alignItems: 'center' },
  generateBtnDisabled: { backgroundColor: colors.sand },
  generateText: { ...fonts.label, fontSize: 11, color: colors.cream, letterSpacing: 3 },
  generateTextDisabled: { color: colors.ash },
  timeHint: { ...fonts.bodyLight, fontSize: 11, color: colors.ash, textAlign: 'center' },

  catCard: {
    borderWidth: 1, borderColor: colors.sand, backgroundColor: colors.white,
    padding: spacing.md, gap: spacing.sm,
  },
  catLabel: { ...fonts.label, fontSize: 9, color: colors.ash },
  catRow: { flexDirection: 'row', gap: spacing.sm },
  catItem: {
    flex: 1, alignItems: 'center', paddingVertical: spacing.sm + 2,
    borderWidth: 1, borderColor: colors.sand, gap: 4,
  },
  catItemActive: { borderColor: colors.copper, backgroundColor: `${colors.copper}10` },
  catIcon: { fontSize: 20 },
  catText: { ...fonts.label, fontSize: 9, color: colors.ash },
  catTextActive: { color: colors.copper },
});

const card = StyleSheet.create({
  container: { borderWidth: 1, borderColor: colors.sand, backgroundColor: colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.sand,
  },
  badge: {
    width: 24, height: 24, backgroundColor: colors.ink,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { ...fonts.label, fontSize: 9, color: colors.cream },
  title: { ...fonts.bodyMedium, fontSize: 14, color: colors.ink },
  image: { width: '100%', height: 280 },
  clearBtn: {
    position: 'absolute', top: spacing.sm, right: spacing.sm,
    width: 32, height: 32, backgroundColor: `${colors.ink}CC`,
    alignItems: 'center', justifyContent: 'center',
  },
  clearText: { color: colors.cream, fontSize: 14, fontWeight: '600' },
  successBadge: {
    position: 'absolute', bottom: spacing.sm, left: spacing.sm,
    backgroundColor: `${colors.ink}CC`, paddingHorizontal: spacing.sm, paddingVertical: 4,
  },
  successText: { ...fonts.label, fontSize: 9, color: colors.cream },
  placeholder: {
    height: 240, alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, padding: spacing.lg, backgroundColor: `${colors.sand}40`,
  },
  plusIcon: { fontSize: 32, color: colors.ashLight },
  placeholderTitle: { ...fonts.displayLight, fontSize: 20, color: colors.ink },
  placeholderHint: { ...fonts.bodyLight, fontSize: 12, color: colors.ash, textAlign: 'center' },
  uploadBtn: {
    marginTop: spacing.sm, borderWidth: 1, borderColor: colors.ash,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
  },
  uploadBtnText: { ...fonts.label, fontSize: 10, color: colors.ink, letterSpacing: 3 },
});
