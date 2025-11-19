/**
 * Root Layout
 * 
 * Main app layout with providers and navigation setup
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../src/contexts/AuthContext';
import { initErrorHandler } from '../src/utils/errorHandler';
import '../global.css';

// Inicializa error handler ANTES de tudo
initErrorHandler();

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <StatusBar 
              barStyle="dark-content" 
              backgroundColor="transparent" 
              translucent={false} 
            />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="editor/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="export/[id]" options={{ headerShown: false }} />
            </Stack>
          </QueryClientProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
