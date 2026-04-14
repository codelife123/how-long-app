import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ScreenLayout } from '../components/ScreenLayout';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

type Props = NativeStackScreenProps<RootStackParamList, 'HowToPlay'>;

export default function HowToPlayScreen({ navigation }: Props) {
  const handleGotIt = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[TYPOGRAPHY.headlineLg, styles.title]}>
            Master your <Text style={{ color: COLORS.primary }}>internal clock.</Text>
          </Text>
          <Text style={[TYPOGRAPHY.bodyLg, styles.subtitle]}>
            A meditative test of perception. No visuals, no sound—just your instinct.
          </Text>
        </View>

        <View style={styles.stepsContainer}>
          <View style={styles.stepCard}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="timer" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepTitle}>1. Pick a duration</Text>
              <Text style={styles.stepBody}>Choose between 10s, 30s, 60s or 3m. Each offers a different challenge for your focus.</Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="visibility-off" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepTitle}>2. Close your eyes</Text>
              <Text style={styles.stepBody}>The interface will fade to darkness. Eliminate distractions and feel the seconds pulse.</Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="touch-app" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepTitle}>3. Tap when time is up</Text>
              <Text style={styles.stepBody}>When you believe the selected duration has passed, tap anywhere. We'll show you the accuracy.</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable 
          style={({ pressed }) => [
            styles.gotItButton,
            pressed && { transform: [{ scale: 0.98 }] }
          ]}
          onPress={handleGotIt}
        >
          <Text style={styles.gotItText}>Got it</Text>
        </Pressable>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 32,
    paddingTop: 40,
    paddingBottom: 140, // space for fixed footer
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
    backgroundColor: COLORS.surfaceVariant, // glass panel equivalent
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(71, 70, 86, 0.3)', // subtle outline
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(171, 163, 255, 0.1)', // primary/10
    borderColor: 'rgba(171, 163, 255, 0.2)',
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
    backgroundColor: COLORS.surface, // To mask content behind since we don't have linear gradient native out of box without expo-linear-gradient
  },
  gotItButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 30, // full
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.glowSelected,
  },
  gotItText: {
    ...TYPOGRAPHY.titleLg,
    color: '#000000',
  }
});
