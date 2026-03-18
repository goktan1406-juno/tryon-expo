import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, spacing } from '../utils/theme';
import Logo from '../components/Logo';

const { height } = Dimensions.get('window');

const LETTERS = 'instantly'.split('');
const LETTER_DURATION = 220;  // ms per letter

const CYCLE_PAUSE = 600;

export default function HomeScreen({ navigation }) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const btnAnim   = useRef(new Animated.Value(0)).current;

  // One Animated.Value per letter
  const letterAnims = useRef(LETTERS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // 1. Entrance animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
      Animated.timing(btnAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start(() => {
      // 2. Letter-by-letter loop
      function runWave() {
        const wave = LETTERS.map((_, i) =>
          Animated.sequence([
            Animated.delay(i * LETTER_DURATION),
            Animated.timing(letterAnims[i], {
              toValue: 1, duration: LETTER_DURATION * 0.6,
              useNativeDriver: false,
            }),
            Animated.timing(letterAnims[i], {
              toValue: 0, duration: LETTER_DURATION * 0.6,
              useNativeDriver: false,
            }),
          ])
        );
        Animated.parallel(wave).start(() => {
          setTimeout(runWave, CYCLE_PAUSE);
        });
      }
      runWave();
    });
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.cream} />

      {/* Decorative vertical line */}
      <View style={styles.decorLine} />

      {/* Logo */}
      <Animated.View style={[styles.logoRow, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Logo size="md" />
      </Animated.View>

      {/* Hero text */}
      <Animated.View style={[styles.hero, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.heroLine1}>Try any</Text>
        <Text style={styles.heroLine2}>outfit</Text>

        {/* "instantly" — harf harf yanıp söner */}
        <View style={styles.instantlyRow}>
          {LETTERS.map((letter, i) => (
            <Animated.Text
              key={i}
              style={[styles.heroAccent, {
                color: letterAnims[i].interpolate({
                  inputRange: [0, 1],
                  outputRange: [colors.copper, colors.copperLight],
                }),
              }]}>
              {letter}
            </Animated.Text>
          ))}
        </View>

        <View style={styles.divider} />
        <Text style={styles.subtext}>
          Upload a clothing image,{'\n'}we'll dress it on your photo.
        </Text>
      </Animated.View>

      {/* Steps */}
      <Animated.View style={[styles.steps, { opacity: btnAnim }]}>
        {[
          { n: '01', t: 'Your photo' },
          { n: '02', t: 'Clothing\nscreenshot' },
          { n: '03', t: 'AI\ntry-on' },
        ].map((s, i) => (
          <React.Fragment key={s.n}>
            <View style={styles.stepItem}>
              <Text style={styles.stepNum}>{s.n}</Text>
              <Text style={styles.stepLabel}>{s.t}</Text>
            </View>
            {i < 2 && <View style={styles.stepSep} />}
          </React.Fragment>
        ))}
      </Animated.View>

      {/* CTA */}
      <Animated.View style={{ opacity: btnAnim, gap: spacing.sm }}>
        <TouchableOpacity
          style={styles.ctaBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Upload')}>
          <Text style={styles.ctaText}>GET STARTED</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.collectionBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Collection')}>
          <Text style={styles.collectionText}>MY COLLECTION</Text>
        </TouchableOpacity>
      </Animated.View>

      <Text style={styles.footer}>AI Virtual Fitting Room</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
    paddingHorizontal: spacing.lg,
  },
  decorLine: {
    position: 'absolute', left: 44, top: 0,
    width: 1, height: height * 0.35,
    backgroundColor: colors.ash, opacity: 0.15,
  },
  logoRow: { marginTop: spacing.xl },
  hero: { flex: 1, justifyContent: 'center' },
  heroLine1: { ...fonts.displayLight, fontSize: 50, color: colors.ink, lineHeight: 56 },
  heroLine2: { ...fonts.displayLight, fontSize: 50, color: colors.ink, lineHeight: 56 },
  instantlyRow: { flexDirection: 'row' },
  heroAccent: { ...fonts.displayItalic, fontSize: 50, color: colors.copper, lineHeight: 60 },
  divider: {
    width: 36, height: 1,
    backgroundColor: colors.ash, opacity: 0.4,
    marginTop: spacing.lg, marginBottom: spacing.md,
  },
  subtext: { ...fonts.bodyLight, fontSize: 14, color: colors.ash, lineHeight: 22 },
  steps: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.sand,
    marginBottom: spacing.lg,
  },
  stepItem: { flex: 1, alignItems: 'center' },
  stepNum: { ...fonts.label, fontSize: 9, color: colors.copper, marginBottom: 2 },
  stepLabel: { ...fonts.bodyRegular, fontSize: 11, color: colors.ash, textAlign: 'center' },
  stepSep: { width: 16, height: 1, backgroundColor: colors.ashLight },
  ctaBtn: {
    backgroundColor: colors.ink,
    paddingVertical: spacing.md + 4,
    alignItems: 'center',
  },
  ctaText: { ...fonts.label, fontSize: 13, color: colors.cream, letterSpacing: 5 },
  collectionBtn: {
    borderWidth: 1, borderColor: colors.sand,
    paddingVertical: spacing.md, alignItems: 'center',
    marginBottom: spacing.md,
  },
  collectionText: { ...fonts.label, fontSize: 11, color: colors.ash, letterSpacing: 3 },
  footer: { ...fonts.bodyLight, fontSize: 11, color: colors.ashLight, textAlign: 'center', marginBottom: spacing.sm },
});
