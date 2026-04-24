import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Switch, Linking, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ScreenLayout } from '../components/ScreenLayout';
import { TYPOGRAPHY } from '../theme/theme';
import { useTheme } from '../theme/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from '../utils/haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const { colors, mode, toggleMode } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [hapticsOn, setHapticsOn] = useState(Haptics.getHapticsEnabled());

  const handleToggleHaptics = (val: boolean) => {
    Haptics.setHapticsEnabled(val);
    setHapticsOn(val);
    if (val) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleToggleTheme = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleMode();
  };

  const openPrivacyPolicy = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const url = 'https://codelife123.github.io/zan-apps/privacy.html';
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Error", "Could not open the privacy policy link.");
    }
  };

  const confirmReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "Reset All Progress",
      "Are you sure you want to erase all your past results, streaks, and achievements? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.multiRemove([
              '@howlong_pbs',
              '@howlong_history_v2',
              '@howlong_user_stats',
              '@howlong_achievements_v1'
            ]);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Reset Successful", "All progress has been cleared.");
          }
        }
      ]
    );
  };

  return (
    <ScreenLayout>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </Pressable>
        <Text style={[TYPOGRAPHY.titleLg, { color: colors.onSurface, flex: 1, textAlign: 'center', marginRight: 24 }]}>Settings</Text>
      </View>

      <View style={styles.content}>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>PREFERENCES</Text>
          
          <View style={[styles.row, { borderBottomColor: colors.outlineVariant, borderBottomWidth: 1 }]}>
            <View style={styles.rowLeft}>
              <MaterialIcons name={mode === 'dark' ? 'dark-mode' : 'light-mode'} size={24} color={colors.onSurface} />
              <Text style={[styles.rowText, { color: colors.onSurface }]}>Theme Mode</Text>
            </View>
            <View style={styles.themeToggleContainer}>
              <Text style={[TYPOGRAPHY.labelSm, { color: colors.onSurfaceVariant, marginRight: 8, textTransform: 'capitalize' }]}>{mode}</Text>
              <Switch
                trackColor={{ false: colors.surfaceContainerHighest, true: colors.primary }}
                thumbColor={colors.onPrimary}
                onValueChange={handleToggleTheme}
                value={mode === 'zen'}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <MaterialIcons name={hapticsOn ? 'vibration' : 'smartphone'} size={24} color={colors.onSurface} />
              <Text style={[styles.rowText, { color: colors.onSurface }]}>Haptic Feedback</Text>
            </View>
            <Switch
              trackColor={{ false: colors.surfaceContainerHighest, true: colors.primary }}
              thumbColor={colors.onPrimary}
              onValueChange={handleToggleHaptics}
              value={hapticsOn}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>ABOUT</Text>
          
          <Pressable 
            style={({pressed}) => [styles.row, pressed && { backgroundColor: `${colors.primary}1A` }]} 
            onPress={openPrivacyPolicy}
          >
            <View style={styles.rowLeft}>
              <MaterialIcons name="privacy-tip" size={24} color={colors.onSurface} />
              <Text style={[styles.rowText, { color: colors.onSurface }]}>Privacy Policy</Text>
            </View>
            <MaterialIcons name="open-in-new" size={20} color={colors.onSurfaceVariant} />
          </Pressable>
        </View>

        <View style={[styles.section, { marginTop: 40 }]}>
          <Pressable 
            style={({pressed}) => [styles.dangerBtn, pressed && { opacity: 0.7 }]} 
            onPress={confirmReset}
          >
            <MaterialIcons name="delete-forever" size={24} color="#ff3b30" />
            <Text style={[styles.dangerText]}>Reset Progress</Text>
          </Pressable>
        </View>

      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  content: {
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...TYPOGRAPHY.labelSm,
    fontWeight: 'bold',
    marginBottom: 16,
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  rowText: {
    ...TYPOGRAPHY.bodyLg,
    fontWeight: '500',
  },
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#ff3b30',
    borderRadius: 16,
  },
  dangerText: {
    ...TYPOGRAPHY.bodyLg,
    color: '#ff3b30',
    fontWeight: 'bold',
  }
});
