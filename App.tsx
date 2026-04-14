import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootStackParamList } from './src/types/navigation';
import { COLORS, TYPOGRAPHY } from './src/theme/theme';

import { 
  useFonts,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';

import {
  Manrope_400Regular,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import GetReadyScreen from './src/screens/GetReadyScreen';
import ActiveCountingScreen from './src/screens/ActiveCountingScreen';
import ResultScreen from './src/screens/ResultScreen';
import HowToPlayScreen from './src/screens/HowToPlayScreen';
import PastResultsScreen from './src/screens/PastResultsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_700Bold,
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' }}>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.background },
            animation: 'fade', // cinematic motion
          }}
          initialRouteName="Home"
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="HowToPlay" component={HowToPlayScreen} />
          <Stack.Screen name="PastResults" component={PastResultsScreen} />
          <Stack.Screen name="GetReady" component={GetReadyScreen} />
          <Stack.Screen name="ActiveCounting" component={ActiveCountingScreen} />
          <Stack.Screen name="Result" component={ResultScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
