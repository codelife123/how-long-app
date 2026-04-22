import { StyleSheet } from 'react-native';

// ─── Color Palettes ──────────────────────────────────────────────
export const DARK_COLORS = {
  background: '#0d0d1a',
  surface: '#0d0d1a',
  surfaceContainerLowest: '#000000',
  surfaceContainerLow: '#121220',
  surfaceContainer: '#181828',
  surfaceContainerHigh: '#1e1e2f',
  surfaceContainerHighest: '#242437',
  surfaceVariant: 'rgba(36, 36, 55, 0.4)',
  primary: '#aba3ff',
  primaryContainer: '#9c94fd',
  primaryDim: '#9991fa',
  onPrimary: '#281a82',
  onSurface: '#e9e6f9',
  onSurfaceVariant: '#aba9bb',
  outlineVariant: 'rgba(71, 70, 86, 0.15)',
  tertiaryContainer: '#f682bd',
  error: '#ff6e84',
  secondary: '#b091ff',
  tertiary: '#ff94c9',
};

export const ZEN_COLORS = {
  // ── Surfaces: warm sage-cream instead of cold white ──
  background: '#f0f4ef',           // warm sage cream — not stark white
  surface: '#f0f4ef',
  surfaceContainerLowest: '#f7faf6', // softest cream-white
  surfaceContainerLow: '#e8ede7',   // gentle sage tint for cards
  surfaceContainer: '#dfe6de',      // medium sage for grouping
  surfaceContainerHigh: '#d6dfd5',  // richer sage for interactive tiles
  surfaceContainerHighest: '#cdd8cc',// deepest sage for pressed/accent states
  surfaceVariant: 'rgba(180, 201, 178, 0.4)', // translucent sage glass
  // ── Brand ──
  primary: '#2d6957',              // deep forest green
  primaryContainer: '#b1efd8',     // mint green (PB badge, accents)
  primaryDim: '#1f5d4b',           // darker forest green
  onPrimary: '#f0faf5',            // soft mint-white on green buttons
  // ── Text ──
  onSurface: '#1e2d2a',            // warm dark forest (not cold charcoal)
  onSurfaceVariant: '#4a5e57',     // warm muted forest green-grey
  // ── Misc ──
  outlineVariant: 'rgba(100, 140, 120, 0.15)',
  tertiaryContainer: '#b7eefc',
  error: '#a83836',
  secondary: '#4c645b',
  tertiary: '#2f6772',
};

export type ThemeColors = typeof DARK_COLORS;

// Keep backward-compatible default export
export const COLORS = DARK_COLORS;

// ─── Fonts ───────────────────────────────────────────────────────
export const FONTS = {
  display: 'PlusJakartaSans_700Bold',
  headline: 'PlusJakartaSans_700Bold',
  body: 'Manrope_400Regular',
  bodyBold: 'Manrope_700Bold',
  label: 'Manrope_600SemiBold',
};

// ─── Typography (color-neutral – screens override colors dynamically) ─
export const TYPOGRAPHY = StyleSheet.create({
  displayLg: {
    fontFamily: FONTS.display,
    fontSize: 56,
    lineHeight: 64,
    color: DARK_COLORS.onSurface,
  },
  displaySm: {
    fontFamily: FONTS.display,
    fontSize: 32,
    lineHeight: 40,
    color: DARK_COLORS.onSurface,
  },
  headlineLg: {
    fontFamily: FONTS.headline,
    fontSize: 32,
    lineHeight: 40,
    color: DARK_COLORS.onSurface,
  },
  bodyLg: {
    fontFamily: FONTS.body,
    fontSize: 18,
    lineHeight: 28,
    color: DARK_COLORS.onSurfaceVariant,
  },
  bodyMd: {
    fontFamily: FONTS.body,
    fontSize: 16,
    lineHeight: 24,
    color: DARK_COLORS.onSurfaceVariant,
  },
  labelSm: {
    fontFamily: FONTS.label,
    fontSize: 12,
    lineHeight: 16,
    color: DARK_COLORS.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  titleLg: {
    fontFamily: FONTS.bodyBold,
    fontSize: 22,
    lineHeight: 28,
    color: DARK_COLORS.onSurface,
  }
});

// ─── Shadows ─────────────────────────────────────────────────────
export const DARK_SHADOWS = StyleSheet.create({
  ambientGlow: {
    shadowColor: DARK_COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 10,
  },
  glowSelected: {
    shadowColor: DARK_COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 8,
  }
});

export const ZEN_SHADOWS = StyleSheet.create({
  ambientGlow: {
    shadowColor: ZEN_COLORS.primary,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 6,
  },
  glowSelected: {
    shadowColor: ZEN_COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 4,
  }
});

export type ThemeShadows = typeof DARK_SHADOWS;

// Keep backward-compatible default
export const SHADOWS = DARK_SHADOWS;
