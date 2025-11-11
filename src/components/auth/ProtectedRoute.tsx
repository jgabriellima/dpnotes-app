/**
 * Protected Route Component
 * 
 * Permite acesso em modo anônimo (offline-first)
 * Não redireciona mais forçadamente para login
 */

import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { loading } = useAuth();
  
  // Modo offline-first: não força login mais
  // Usuário pode usar o app em modo anônimo

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-primary-lightest">
        <ActivityIndicator size="large" color="#ff6b52" />
        <Text className="text-text-secondary mt-4">Carregando...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

