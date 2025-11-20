/**
 * Root Layout
 * 
 * Main app layout with providers and navigation setup
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { initErrorHandler } from '../src/utils/errorHandler';
import '../global.css';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore errors if splash screen cannot be prevented
});

// Inicializa error handler ANTES de tudo
initErrorHandler();

export default function RootLayout() {
  useEffect(() => {
    // Prepare layout and hide splash after a brief moment
    const prepare = async () => {
      try {
        // Small delay to ensure everything is mounted
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        console.warn('Error preparing layout:', e);
      }
    };

    prepare();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor="transparent" 
          translucent={false} 
        />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="editor/[id]" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
