import { StyleSheet } from 'react-native';

export const COLORS = {
  background: '#0d0d1a',
  surface: '#0d0d1a',
  surfaceContainerLowest: '#000000',
  surfaceContainerLow: '#121220',
  surfaceContainer: '#181828',
  surfaceContainerHigh: '#1e1e2f',
  surfaceContainerHighest: '#242437',
  surfaceVariant: 'rgba(36, 36, 55, 0.4)', // 40% surface_variant for glass
  primary: '#aba3ff',
  primaryContainer: '#9c94fd',
  primaryDim: '#9991fa',
  onPrimary: '#281a82',
  onSurface: '#e9e6f9',
  onSurfaceVariant: '#aba9bb',
  outlineVariant: 'rgba(71, 70, 86, 0.15)', // 15% opacity ghost border
  tertiaryContainer: '#f682bd',
};

export const FONTS = {
  display: 'PlusJakartaSans_700Bold',
  headline: 'PlusJakartaSans_700Bold',
  body: 'Manrope_400Regular',
  bodyBold: 'Manrope_700Bold',
  label: 'Manrope_600SemiBold',
};

export const TYPOGRAPHY = StyleSheet.create({
  displayLg: {
    fontFamily: FONTS.display,
    fontSize: 56, // 3.5rem roughly
    lineHeight: 64,
    color: COLORS.onSurface,
  },
  displaySm: {
    fontFamily: FONTS.display,
    fontSize: 32,
    lineHeight: 40,
    color: COLORS.onSurface,
  },
  headlineLg: {
    fontFamily: FONTS.headline,
    fontSize: 32,
    lineHeight: 40,
    color: COLORS.onSurface,
  },
  bodyLg: {
    fontFamily: FONTS.body,
    fontSize: 18,
    lineHeight: 28,
    color: COLORS.onSurfaceVariant,
  },
  bodyMd: {
    fontFamily: FONTS.body,
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.onSurfaceVariant,
  },
  labelSm: {
    fontFamily: FONTS.label,
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  titleLg: {
    fontFamily: FONTS.bodyBold,
    fontSize: 22,
    lineHeight: 28,
    color: COLORS.onSurface,
  }
});

export const SHADOWS = StyleSheet.create({
  ambientGlow: {
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.2, // Tamed to work across platforms
    shadowRadius: 30,
    elevation: 10,
  },
  glowSelected: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 8,
  }
});
