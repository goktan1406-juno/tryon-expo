import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../utils/theme';

/**
 * Logo — minimal hanger icon + "tryon" wordmark
 * size: 'sm' | 'md' | 'lg'
 */
export default function Logo({ size = 'md', style }) {
  const s = SIZES[size];

  return (
    <View style={[styles.root, style]}>
      <HangerIcon size={s.icon} stroke={s.stroke} />
      <View style={styles.wordWrap}>
        <Text style={[styles.wordTry, { fontSize: s.font }]}>try</Text>
        <Text style={[styles.wordOn,  { fontSize: s.font }]}>on</Text>
      </View>
    </View>
  );
}

function HangerIcon({ size, stroke }) {
  // viewBox 0 0 100 80
  // Omuzlar hafif kavisli, kanca sağa kıvrık, alt bar yuvarlak uçlu
  const d = `
    M 50 68
    Q 20 68 18 66
    Q 15 64 15 61
    Q 15 58 18 56
    L 48 32
    Q 49 31 50 31
    Q 51 31 52 32
    L 82 56
    Q 85 58 85 61
    Q 85 64 82 66
    Q 80 68 50 68
    Z

    M 50 31
    L 50 24

    M 50 24
    Q 50 18 55 15
    Q 60 12 63 15
    Q 66 18 63 21
  `;

  return (
    <Svg width={size} height={size * 0.72} viewBox="0 0 100 72">
      {/* Alt bar — yuvarlak */}
      <Path
        d="M 18 56 Q 15 58 15 61 Q 15 65 18 67 Q 21 69 50 69 Q 79 69 82 67 Q 85 65 85 61 Q 85 57 82 55"
        fill="none"
        stroke={colors.ink}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      {/* Sol omuz */}
      <Path
        d="M 50 31 Q 34 42 18 56"
        fill="none"
        stroke={colors.ink}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      {/* Sağ omuz */}
      <Path
        d="M 50 31 Q 66 42 82 55"
        fill="none"
        stroke={colors.ink}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      {/* Boyun */}
      <Path
        d="M 50 31 L 50 23"
        fill="none"
        stroke={colors.ink}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      {/* Kanca — sağa kıvrık J */}
      <Path
        d="M 50 23 Q 50 16 55 14 Q 61 12 63 16 Q 65 19 62 21"
        fill="none"
        stroke={colors.ink}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
    </Svg>
  );
}

const SIZES = {
  sm: { icon: 28, stroke: 2.2, font: 17 },
  md: { icon: 38, stroke: 2.5, font: 24 },
  lg: { icon: 56, stroke: 3,   font: 36 },
};

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wordWrap: { flexDirection: 'row', alignItems: 'baseline' },
  wordTry: {
    fontFamily: 'serif',
    fontWeight: '300',
    color: colors.ink,
    letterSpacing: -0.5,
  },
  wordOn: {
    fontFamily: 'serif',
    fontStyle: 'italic',
    fontWeight: '400',
    color: colors.copper,
    letterSpacing: -0.5,
  },
});
