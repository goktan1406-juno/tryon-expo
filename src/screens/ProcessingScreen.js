import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, Easing,
  StatusBar, BackHandler, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { runTryOn } from '../services/api';
import { useCredits } from '../hooks/useCredits';
import { colors, fonts, spacing } from '../utils/theme';

const STEPS_WITH_SCRAPE = [
  { id: 'scrape', label: 'Fetching product image',   desc: 'Grabbing clothing from the store page' },
  { id: 'tryon',  label: 'Creating virtual try-on',  desc: 'AI is fitting the outfit on you' },
];

const STEPS_WITHOUT_SCRAPE = [
  { id: 'tryon', label: 'Creating virtual try-on', desc: 'AI is fitting the outfit on you' },
];

const STEP_TIMES_WITH_SCRAPE    = [0, 12]; // saniye
const STEP_TIMES_WITHOUT_SCRAPE = [0];     // saniye

export default function ProcessingScreen({ route, navigation }) {
  const { userImageUri, clothingImageUri, productLink, category } = route.params;
  const { spendCredit } = useCredits();

  const STEPS      = productLink ? STEPS_WITH_SCRAPE : STEPS_WITHOUT_SCRAPE;
  const STEP_TIMES = productLink ? STEP_TIMES_WITH_SCRAPE : STEP_TIMES_WITHOUT_SCRAPE;
  const TOTAL_SECS = productLink ? 100 : 95;

  const [currentStep, setCurrentStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState(null);

  const spinAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  // Spin
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 2500, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Update step based on time
  useEffect(() => {
    for (let i = STEP_TIMES.length - 1; i >= 0; i--) {
      if (elapsed >= STEP_TIMES[i]) { setCurrentStep(i); break; }
    }
    const pct = Math.min((elapsed / TOTAL_SECS) * 100, 90);
    Animated.timing(progressAnim, { toValue: pct, duration: 700, useNativeDriver: false }).start();
  }, [elapsed]);

  // Back button guard (Android)
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert('Cancel?', 'Do you want to stop the process?', [
        { text: 'Continue', style: 'cancel' },
        { text: 'Cancel', style: 'destructive', onPress: () => navigation.goBack() },
      ]);
      return true;
    });
    return () => sub.remove();
  }, []);

  // API call
  useEffect(() => {
    let cancelled = false;
    async function process() {
      try {
        const result = await runTryOn(userImageUri, clothingImageUri, productLink, category);
        if (cancelled) return;
        await spendCredit().catch(() => {}); // düş, hata olsa bile devam et
        clearInterval(timerRef.current);
        Animated.timing(progressAnim, { toValue: 100, duration: 400, useNativeDriver: false }).start();
        setTimeout(() => {
          navigation.replace('Result', {
            resultImage: result.image,
            userImageUri,
            clothingImageUri,
            steps: result.steps,
          });
        }, 500);
      } catch (err) {
        if (cancelled) return;
        clearInterval(timerRef.current);
        setError(err.message || 'Something went wrong.');
      }
    }
    process();
    return () => { cancelled = true; };
  }, []);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const progressWidth = progressAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: spacing.xl }]}>
        <Text style={{ fontSize: 40, marginBottom: spacing.md }}>✗</Text>
        <Text style={[fonts.displayLight, { fontSize: 22, color: colors.ink, marginBottom: spacing.sm }]}>Something went wrong</Text>
        <Text style={{ ...fonts.bodyLight, fontSize: 14, color: colors.ash, textAlign: 'center', lineHeight: 20, marginBottom: spacing.xl }}>
          {error}
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <Text
            style={styles.errBtn}
            onPress={() => navigation.replace('Processing', route.params)}>
            Try Again
          </Text>
          <Text
            style={[styles.errBtn, { backgroundColor: 'transparent', color: colors.ink, borderWidth: 1, borderColor: colors.ink }]}
            onPress={() => navigation.navigate('Upload')}>
            Go Back
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.cream} />

      {/* Spinner */}
      <View style={styles.spinnerWrap}>
        <Animated.View style={[styles.outerRing, { transform: [{ rotate: spin }] }]} />
        <View style={styles.innerRing} />
        <Text style={styles.spinnerLabel}>ai</Text>
      </View>

      <Text style={styles.stepTitle}>{STEPS[currentStep]?.label}</Text>
      <Text style={styles.stepDesc}>{STEPS[currentStep]?.desc}</Text>

      {/* Steps list */}
      <View style={styles.stepsList}>
        {STEPS.map((step, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          return (
            <View key={step.id} style={[styles.stepRow, i > currentStep && { opacity: 0.3 }]}>
              <View style={[styles.dot, done && styles.dotDone, active && styles.dotActive]}>
                {done && <Text style={styles.dotCheck}>✓</Text>}
                {active && <View style={styles.dotPulse} />}
              </View>
              <Text style={[styles.stepText, active && styles.stepTextActive, done && { color: colors.ash }]}>
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Progress bar */}
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: progressWidth }]} />
      </View>
      <Text style={styles.note}>Don't close the app — takes ~1-2 minutes</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.cream,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  spinnerWrap: {
    width: 80, height: 80, alignItems: 'center',
    justifyContent: 'center', marginBottom: spacing.xl,
  },
  outerRing: {
    position: 'absolute', width: 80, height: 80,
    borderWidth: 1.5, borderColor: `${colors.copper}40`,
    borderTopColor: colors.copper,
  },
  innerRing: {
    position: 'absolute', width: 54, height: 54,
    borderWidth: 1, borderColor: `${colors.ash}20`,
  },
  spinnerLabel: { ...fonts.displayItalic, fontSize: 20, color: colors.copper },
  stepTitle: { ...fonts.displayLight, fontSize: 22, color: colors.ink, textAlign: 'center', marginBottom: spacing.xs },
  stepDesc: { ...fonts.bodyLight, fontSize: 13, color: colors.ash, textAlign: 'center', marginBottom: spacing.xl },
  stepsList: { width: '100%', gap: spacing.md, marginBottom: spacing.xl },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  dot: { width: 20, height: 20, borderWidth: 1, borderColor: colors.ash, alignItems: 'center', justifyContent: 'center' },
  dotDone: { backgroundColor: colors.copper, borderColor: colors.copper },
  dotActive: { borderColor: colors.copper },
  dotCheck: { color: colors.cream, fontSize: 10, fontWeight: '700' },
  dotPulse: { width: 6, height: 6, backgroundColor: colors.copper, borderRadius: 3 },
  stepText: { ...fonts.bodyRegular, fontSize: 14, color: colors.ash },
  stepTextActive: { color: colors.ink, fontWeight: '500' },
  track: { width: '100%', height: 1, backgroundColor: colors.sand, overflow: 'hidden', marginBottom: spacing.sm },
  fill: { height: '100%', backgroundColor: colors.copper },
  note: { ...fonts.bodyLight, fontSize: 11, color: colors.ashLight, textAlign: 'center' },
  errBtn: { ...fonts.label, fontSize: 11, color: colors.cream, backgroundColor: colors.ink, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
});
