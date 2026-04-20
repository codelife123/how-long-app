import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

export const ScreenLayout: React.FC<{ children: React.ReactNode, noSafeArea?: boolean }> = ({ children, noSafeArea }) => {
  const { colors } = useTheme();

  const containerStyle = [styles.container, { backgroundColor: colors.background }];

  if (noSafeArea) {
    return <View style={containerStyle}>{children}</View>;
  }
  return (
    <SafeAreaView style={containerStyle}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});
