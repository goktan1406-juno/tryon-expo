import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Alert, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCredits } from '../hooks/useCredits';
import { colors, fonts, spacing } from '../utils/theme';
import Logo from '../components/Logo';

const { width } = Dimensions.get('window');

const PLANS = {
  monthly: { label: 'Monthly', price: '180', period: '/mo', credits: 10, saving: null },
  annual:  { label: 'Annual', price: '1,800', period: '/yr', credits: 10, saving: '17% off' },
};

const CREDIT_PACKS = [
  { amount: 10, price: '180', perCredit: '18' },
  { amount: 20, price: '340', perCredit: '17', popular: true },
  { amount: 40, price: '600', perCredit: '15', best: true },
];

const FEATURES = [
  '10 virtual try-on credits per month',
  'Realistic AI fitting technology',
  'Works with model-worn garments',
  'Try-on via store product link',
  'Save & share your results',
];

export default function PaywallScreen({ navigation, route }) {
  const returnTo = route?.params?.returnTo || 'Upload';
  const { purchasePlan, purchaseCredits } = useCredits();
  const [plan, setPlan] = useState('annual');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      // TODO: Gerçek ödeme entegrasyonu (RevenueCat / Stripe)
      await purchasePlan(plan);
      Alert.alert(
        'Subscription Active!',
        `${PLANS[plan].credits} credits have been added to your account.`,
        [{ text: 'Great!', onPress: () => navigation.navigate(returnTo) }]
      );
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreditPack = async (pack) => {
    setLoading(true);
    try {
      // TODO: Gerçek ödeme entegrasyonu
      await purchaseCredits(pack.amount);
      Alert.alert(
        'Credits Added!',
        `${pack.amount} credits have been added to your account.`,
        [{ text: 'Great!', onPress: () => navigation.navigate(returnTo) }]
      );
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const selected = PLANS[plan];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.cream} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
        <Logo size="sm" />
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>PREMIUM</Text>
          <Text style={styles.heroTitle}>Explore your{'\n'}wardrobe.</Text>
          <Text style={styles.heroSub}>
            Try on any outfit in seconds with AI.
          </Text>
        </View>

        {/* Plan toggle */}
        <View style={styles.planToggle}>
          {Object.entries(PLANS).map(([key, p]) => (
            <TouchableOpacity
              key={key}
              style={[styles.planTab, plan === key && styles.planTabActive]}
              onPress={() => setPlan(key)}
              activeOpacity={0.8}>
              <Text style={[styles.planTabText, plan === key && styles.planTabTextActive]}>
                {p.label}
              </Text>
              {p.saving && (
                <View style={styles.savingBadge}>
                  <Text style={styles.savingText}>{p.saving}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Main subscription card */}
        <View style={styles.subscriptionCard}>
          <View style={styles.cardTop}>
            <View>
              <Text style={styles.cardCredits}>{selected.credits} credits</Text>
              <Text style={styles.cardPeriodLabel}>renews every month</Text>
            </View>
            <View style={styles.cardPriceBlock}>
              <Text style={styles.cardCurrency}>₺</Text>
              <Text style={styles.cardPrice}>{selected.price}</Text>
              <Text style={styles.cardPeriod}>{selected.period}</Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.featureList}>
            {FEATURES.map(f => (
              <View key={f} style={styles.featureRow}>
                <View style={styles.featureCheck}>
                  <Text style={styles.featureCheckText}>✓</Text>
                </View>
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.subscribeBtn, loading && { opacity: 0.6 }]}
            onPress={handleSubscribe}
            disabled={loading}
            activeOpacity={0.85}>
            <Text style={styles.subscribeBtnText}>
              {loading ? 'PROCESSING...' : `SUBSCRIBE — ₺${selected.price}${selected.period}`}
            </Text>
          </TouchableOpacity>

          <Text style={styles.cardNote}>
            {plan === 'annual'
              ? 'Billed annually · Cancel anytime'
              : 'Billed monthly · Cancel anytime'}
          </Text>
        </View>

        {/* Divider */}
        <View style={styles.orRow}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>or buy one-time credits</Text>
          <View style={styles.orLine} />
        </View>

        {/* Credit packs */}
        <View style={styles.packsRow}>
          {CREDIT_PACKS.map(pack => (
            <TouchableOpacity
              key={pack.amount}
              style={[styles.packCard, pack.popular && styles.packCardPopular, pack.best && styles.packCardBest]}
              onPress={() => handleCreditPack(pack)}
              activeOpacity={0.8}
              disabled={loading}>

              {pack.popular && (
                <View style={styles.packBadge}>
                  <Text style={styles.packBadgeText}>POPULAR</Text>
                </View>
              )}
              {pack.best && (
                <View style={[styles.packBadge, { backgroundColor: colors.copper }]}>
                  <Text style={styles.packBadgeText}>BEST</Text>
                </View>
              )}

              <Text style={[styles.packAmount, (pack.popular || pack.best) && { color: colors.cream }]}>
                {pack.amount}
              </Text>
              <Text style={[styles.packAmountLabel, (pack.popular || pack.best) && { color: `${colors.cream}99` }]}>
                credits
              </Text>
              <View style={styles.packPriceLine} />
              <Text style={[styles.packPrice, (pack.popular || pack.best) && { color: colors.cream }]}>
                ₺{pack.price}
              </Text>
              <Text style={[styles.packPerCredit, (pack.popular || pack.best) && { color: `${colors.cream}80` }]}>
                ₺{pack.perCredit}/credit
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.legalNote}>
          Payment is processed through the App Store / Google Play.
          Subscription automatically renews unless cancelled at least 24 hours before the renewal date.
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  closeBtn: { fontSize: 18, color: colors.ash, width: 32, textAlign: 'center' },

  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.lg },

  /* Hero */
  hero: { gap: 6, paddingTop: spacing.sm },
  heroEyebrow: { ...fonts.label, fontSize: 9, color: colors.copper },
  heroTitle: { ...fonts.displayLight, fontSize: 42, color: colors.ink, lineHeight: 46 },
  heroSub: { ...fonts.bodyLight, fontSize: 14, color: colors.ash, lineHeight: 22, marginTop: 4 },

  /* Plan toggle */
  planToggle: {
    flexDirection: 'row',
    borderWidth: 1, borderColor: colors.sand,
    backgroundColor: colors.white,
  },
  planTab: {
    flex: 1, paddingVertical: spacing.sm + 4,
    alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', gap: 8,
  },
  planTabActive: { backgroundColor: colors.ink },
  planTabText: { ...fonts.label, fontSize: 11, color: colors.ash, letterSpacing: 2 },
  planTabTextActive: { color: colors.cream },
  savingBadge: {
    backgroundColor: colors.copper,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  savingText: { ...fonts.label, fontSize: 7, color: colors.cream },

  /* Subscription card */
  subscriptionCard: {
    borderWidth: 1, borderColor: colors.ink,
    backgroundColor: colors.white,
    padding: spacing.lg, gap: spacing.md,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardCredits: { ...fonts.displayLight, fontSize: 28, color: colors.ink },
  cardPeriodLabel: { ...fonts.bodyLight, fontSize: 11, color: colors.ash },
  cardPriceBlock: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  cardCurrency: { ...fonts.bodyMedium, fontSize: 16, color: colors.ink, marginBottom: 4 },
  cardPrice: { ...fonts.displayLight, fontSize: 36, color: colors.ink, lineHeight: 40 },
  cardPeriod: { ...fonts.bodyLight, fontSize: 13, color: colors.ash, marginBottom: 6 },
  cardDivider: { height: 1, backgroundColor: colors.sand },
  featureList: { gap: spacing.sm },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  featureCheck: {
    width: 18, height: 18, backgroundColor: colors.ink,
    alignItems: 'center', justifyContent: 'center',
  },
  featureCheckText: { color: colors.cream, fontSize: 10, fontWeight: '700' },
  featureText: { ...fonts.bodyRegular, fontSize: 13, color: colors.ink, flex: 1 },
  subscribeBtn: {
    backgroundColor: colors.ink,
    paddingVertical: spacing.md + 2, alignItems: 'center',
    marginTop: spacing.sm,
  },
  subscribeBtnText: { ...fonts.label, fontSize: 11, color: colors.cream, letterSpacing: 2 },
  cardNote: { ...fonts.bodyLight, fontSize: 10, color: colors.ashLight, textAlign: 'center' },

  /* Or divider */
  orRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  orLine: { flex: 1, height: 1, backgroundColor: colors.sand },
  orText: { ...fonts.bodyLight, fontSize: 11, color: colors.ash },

  /* Credit packs */
  packsRow: { flexDirection: 'row', gap: spacing.sm },
  packCard: {
    flex: 1, borderWidth: 1, borderColor: colors.sand,
    backgroundColor: colors.white, padding: spacing.md,
    alignItems: 'center', gap: 4,
  },
  packCardPopular: { backgroundColor: colors.ash, borderColor: colors.ash },
  packCardBest: { backgroundColor: colors.ink, borderColor: colors.ink },
  packBadge: {
    backgroundColor: colors.ash,
    paddingHorizontal: 6, paddingVertical: 2, marginBottom: 4,
  },
  packBadgeText: { ...fonts.label, fontSize: 7, color: colors.cream },
  packAmount: { ...fonts.displayLight, fontSize: 28, color: colors.ink, lineHeight: 32 },
  packAmountLabel: { ...fonts.bodyLight, fontSize: 10, color: colors.ash },
  packPriceLine: { width: 20, height: 1, backgroundColor: colors.sand, marginVertical: 4 },
  packPrice: { ...fonts.bodyMedium, fontSize: 16, color: colors.ink },
  packPerCredit: { ...fonts.bodyLight, fontSize: 10, color: colors.ashLight },

  legalNote: {
    ...fonts.bodyLight, fontSize: 10, color: colors.ashLight,
    textAlign: 'center', lineHeight: 15,
  },
});
