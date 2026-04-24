import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ScreenLayout } from '../components/ScreenLayout';
import { TYPOGRAPHY } from '../theme/theme';
import { useTheme } from '../theme/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from '../utils/haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'HowToPlay'>;

export default function HowToPlayScreen({ navigation }: Props) {
  const { colors, shadows, mode } = useTheme();
  const insets = useSafeAreaInsets();

  const handleGotIt = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const iconCircleBg = mode === 'dark' ? 'rgba(171, 163, 255, 0.1)' : 'rgba(45, 105, 87, 0.1)';
  const iconCircleBorder = mode === 'dark' ? 'rgba(171, 163, 255, 0.2)' : 'rgba(45, 105, 87, 0.2)';
  const cardBorder = mode === 'dark' ? 'rgba(71, 70, 86, 0.3)' : 'rgba(172, 179, 180, 0.3)';

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[TYPOGRAPHY.headlineLg, styles.title, { color: colors.onSurface }]}>
            Master your <Text style={{ color: colors.primary }}>internal clock.</Text>
          </Text>
          <Text style={[TYPOGRAPHY.bodyLg, styles.subtitle, { color: colors.onSurfaceVariant }]}>
            A meditative test of perception. No visuals, no sound—just your instinct.
          </Text>
        </View>

        <View style={styles.stepsContainer}>
          <View style={[styles.stepCard, { backgroundColor: colors.surfaceVariant, borderColor: cardBorder }]}>
            <View style={[styles.iconCircle, { backgroundColor: iconCircleBg, borderColor: iconCircleBorder }]}>
              <MaterialIcons name="timer" size={24} color={colors.primary} />
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={[styles.stepTitle, { color: colors.onSurface }]}>1. Pick a duration</Text>
              <Text style={[styles.stepBody, { color: colors.onSurfaceVariant }]}>Choose between 10s, 30s, 60s or 3m. Each offers a different challenge for your focus.</Text>
            </View>
          </View>

          <View style={[styles.stepCard, { backgroundColor: colors.surfaceVariant, borderColor: cardBorder }]}>
            <View style={[styles.iconCircle, { backgroundColor: iconCircleBg, borderColor: iconCircleBorder }]}>
              <MaterialIcons name="visibility-off" size={24} color={colors.primary} />
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={[styles.stepTitle, { color: colors.onSurface }]}>2. Close your eyes</Text>
              <Text style={[styles.stepBody, { color: colors.onSurfaceVariant }]}>The interface will fade to darkness. Eliminate distractions and feel the seconds pulse.</Text>
            </View>
          </View>

          <View style={[styles.stepCard, { backgroundColor: colors.surfaceVariant, borderColor: cardBorder }]}>
            <View style={[styles.iconCircle, { backgroundColor: iconCircleBg, borderColor: iconCircleBorder }]}>
              <MaterialIcons name="touch-app" size={24} color={colors.primary} />
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={[styles.stepTitle, { color: colors.onSurface }]}>3. Tap when time is up</Text>
              <Text style={[styles.stepBody, { color: colors.onSurfaceVariant }]}>When you believe the selected duration has passed, tap anywhere. We'll show you the accuracy.</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface, paddingBottom: Math.max(insets.bottom, 24) + 16 }]}>
        <Pressable 
          style={({ pressed }) => [
            styles.gotItButton,
            { backgroundColor: colors.primary, ...shadows.glowSelected },
            pressed && { transform: [{ scale: 0.98 }] }
          ]}
          onPress={handleGotIt}
        >
          <Text style={[styles.gotItText, { color: colors.onPrimary }]}>Got it</Text>
        </Pressable>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 32,
    paddingTop: 40,
    paddingBottom: 140,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    textAlign: 'center',
  },
  stepsContainer: {
    gap: 24,
  },
  stepCard: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  stepTextContainer: {
    flex: 1,
  },
  stepTitle: {
    ...TYPOGRAPHY.titleLg,
    fontSize: 20,
    marginBottom: 8,
  },
  stepBody: {
    ...TYPOGRAPHY.bodyMd,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 32,
    paddingBottom: 40,
  },
  gotItButton: {
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gotItText: {
    ...TYPOGRAPHY.titleLg,
  }
});
