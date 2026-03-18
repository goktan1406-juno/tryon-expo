import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, ScrollView, Share, Alert,
  StatusBar, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCollection } from '../hooks/useCollection';
import { colors, fonts, spacing } from '../utils/theme';

const { width } = Dimensions.get('window');

export default function ResultScreen({ route, navigation }) {
  const { resultImage, userImageUri, clothingImageUri } = route.params;
  const [view, setView] = useState('result');
  const [saved, setSaved] = useState(false);
  const { addItem } = useCollection();

  const handleSave = async () => {
    try {
      await addItem({ resultImage, clothingImageUri });
      setSaved(true);
    } catch (e) {
      Alert.alert('Error', 'Could not save: ' + e.message);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: 'Check out my AI virtual try-on! 👗', url: resultImage });
    } catch (err) {
      Alert.alert('Paylaşım hatası', err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.cream} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={styles.homeBtn}>Home</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>RESULT</Text>
        <TouchableOpacity onPress={handleShare}>
          <Text style={styles.shareBtn}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* Title */}
        <View style={styles.titleWrap}>
          <Text style={styles.titleA}>Your new</Text>
          <Text style={styles.titleB}>look.</Text>
        </View>

        {/* Toggle */}
        <View style={styles.toggle}>
          {[{ id: 'result', label: 'Result' }, { id: 'compare', label: 'Compare' }].map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.toggleTab, view === tab.id && styles.toggleTabActive]}
              onPress={() => setView(tab.id)}>
              <Text style={[styles.toggleText, view === tab.id && styles.toggleTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Images */}
        {view === 'result' ? (
          <View>
            <ScrollView
              maximumZoomScale={4}
              minimumZoomScale={1}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              centerContent
              style={styles.resultImgWrap}>
              <Image source={{ uri: resultImage }} style={styles.resultImg} resizeMode="contain" />
            </ScrollView>
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>AI GENERATED · Pinch to zoom</Text>
            </View>
          </View>
        ) : (
          <View style={styles.compareGrid}>
            {[
              { label: 'You', uri: userImageUri },
              { label: 'Outfit', uri: clothingImageUri },
              { label: 'Result', uri: resultImage },
            ].map(item => (
              <View key={item.label} style={styles.compareItem}>
                <Text style={styles.compareLabel}>{item.label}</Text>
                <Image source={{ uri: item.uri }} style={styles.compareImg} resizeMode="cover" />
              </View>
            ))}
          </View>
        )}

        <Text style={styles.disclaimer}>
          Results are AI-generated. Actual product color and fabric may vary.
        </Text>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.bottomBar}>
        <View style={styles.topActions}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleShare} activeOpacity={0.85}>
            <Text style={styles.primaryText}>SHARE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveBtn, saved && styles.saveBtnDone]}
            onPress={handleSave}
            disabled={saved}
            activeOpacity={0.85}>
            <Text style={[styles.saveBtnText, saved && styles.saveBtnTextDone]}>
              {saved ? '✓ SAVED' : 'SAVE'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => navigation.navigate('Upload')}
            activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>NEW</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.replace('Processing', route.params)}
            activeOpacity={0.85}>
            <Text style={styles.secondaryText}>TRY AGAIN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('Collection')}
            activeOpacity={0.85}>
            <Text style={styles.secondaryText}>COLLECTION</Text>
          </TouchableOpacity>
        </View>
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
  homeBtn: { ...fonts.bodyMedium, fontSize: 14, color: colors.ash },
  headerTitle: { ...fonts.label, fontSize: 10, color: colors.ash },
  shareBtn: { ...fonts.bodyMedium, fontSize: 14, color: colors.copper },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg },
  titleWrap: { alignItems: 'center' },
  titleA: { ...fonts.displayLight, fontSize: 30, color: colors.ink },
  titleB: { ...fonts.displayItalic, fontSize: 30, color: colors.copper },
  toggle: { flexDirection: 'row', borderWidth: 1, borderColor: colors.sand, alignSelf: 'center' },
  toggleTab: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm + 2 },
  toggleTabActive: { backgroundColor: colors.ink },
  toggleText: { ...fonts.label, fontSize: 10, color: colors.ash, letterSpacing: 2 },
  toggleTextActive: { color: colors.cream },
  resultImgWrap: { width: '100%', height: width * 1.2, backgroundColor: colors.sand },
  resultImg: { width: '100%', height: width * 1.2 },
  aiBadge: {
    position: 'absolute', bottom: spacing.sm, right: spacing.sm,
    backgroundColor: `${colors.ink}CC`, paddingHorizontal: spacing.sm, paddingVertical: 4,
  },
  aiBadgeText: { ...fonts.label, fontSize: 9, color: colors.cream },
  compareGrid: { flexDirection: 'row', gap: spacing.sm },
  compareItem: { flex: 1 },
  compareLabel: { ...fonts.label, fontSize: 8, color: colors.ash, textAlign: 'center', marginBottom: 4 },
  compareImg: { width: '100%', height: 180, backgroundColor: colors.sand },
  disclaimer: { ...fonts.bodyLight, fontSize: 11, color: colors.ashLight, textAlign: 'center', lineHeight: 16 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.cream, borderTopWidth: 1, borderTopColor: colors.sand,
    padding: spacing.lg, paddingBottom: spacing.xl, flexDirection: 'column', gap: spacing.sm,
  },
  topActions: { flexDirection: 'row', gap: spacing.sm },
  bottomActions: { flexDirection: 'row', gap: spacing.sm },
  primaryBtn: { flex: 1, backgroundColor: colors.ink, paddingVertical: spacing.md + 2, alignItems: 'center' },
  primaryText: { ...fonts.label, fontSize: 11, color: colors.cream, letterSpacing: 3 },
  saveBtn: { borderWidth: 1, borderColor: colors.ink, paddingVertical: spacing.md + 2, paddingHorizontal: spacing.lg, alignItems: 'center' },
  saveBtnDone: { backgroundColor: colors.copper, borderColor: colors.copper },
  saveBtnText: { ...fonts.label, fontSize: 11, color: colors.ink, letterSpacing: 2 },
  saveBtnTextDone: { color: colors.cream },
  secondaryBtn: { flex: 1, borderWidth: 1, borderColor: colors.sand, paddingVertical: spacing.md, alignItems: 'center' },
  secondaryText: { ...fonts.label, fontSize: 10, color: colors.ash, letterSpacing: 2 },
});
