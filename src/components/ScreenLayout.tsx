import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../theme/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ScreenLayout: React.FC<{ children: React.ReactNode, noSafeArea?: boolean }> = ({ children, noSafeArea }) => {
  if (noSafeArea) {
    return <View style={styles.container}>{children}</View>;
  }
  return (
    <SafeAreaView style={styles.container}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  }
});
