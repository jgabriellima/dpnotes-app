/**
 * Settings Screen
 * 
 * Main settings hub with profile, security, and app info.
 * 
 * Reference: docs/UX_UI_REFERENCES/profile-settings/
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { SettingsCard } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Icon } from '../../src/components/ui/Icon';
import * as LocalStorage from '../../src/services/storage/local';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, isAnonymous, signOut } = useAuth();
  const [localStats, setLocalStats] = useState({ projects: 0, documents: 0, annotations: 0, labels: 0 });

  useEffect(() => {
    if (isAnonymous) {
      LocalStorage.getLocalDataStats().then(setLocalStats);
    }
  }, [isAnonymous]);

  const handleRemoveAllData = () => {
    Alert.alert(
      'Remover Todos os Dados',
      'Tem certeza que deseja remover todos os seus dados? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Em desenvolvimento', 'Esta funcionalidade será implementada em breve.');
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error: any) {
              Alert.alert('Erro', 'Não foi possível sair');
            }
          }
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-primary-lightest">
      {/* Header */}
      <View className="flex flex-row items-center px-4 pt-12 pb-4 bg-primary-lightest border-b border-primary-light">
        <Pressable onPress={() => router.back()}>
          <Icon name="arrow_back" size={24} color="#2D313E" />
        </Pressable>
        <Text className="text-lg font-bold text-text-primary flex-1 text-center px-4">
          Profile & Settings
        </Text>
        <View className="w-6" />
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-6 gap-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Anonymous Mode Banner */}
        {isAnonymous && (
          <View className="flex flex-col gap-3">
            <View className="px-3 py-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <View className="flex flex-row items-start gap-3 mb-3">
                <Icon name="cloud_off" size={24} color="#F59E0B" />
                <View className="flex-1">
                  <Text className="text-yellow-900 text-base font-bold">
                    Modo Offline
                  </Text>
                  <Text className="text-yellow-700 text-sm mt-1">
                    Você está usando o app em modo anônimo. Seus dados estão salvos apenas neste dispositivo.
                  </Text>
                </View>
              </View>

              {/* Estatísticas Locais */}
              <View className="flex flex-col gap-2 mb-4 p-3 bg-white rounded-lg">
                <Text className="text-text-primary font-semibold text-sm mb-2">
                  Seus Dados Locais:
                </Text>
                <View className="flex flex-row justify-between">
                  <Text className="text-text-secondary text-sm">📁 Projetos</Text>
                  <Text className="text-text-primary font-bold text-sm">{localStats.projects}</Text>
                </View>
                <View className="flex flex-row justify-between">
                  <Text className="text-text-secondary text-sm">📝 Documentos</Text>
                  <Text className="text-text-primary font-bold text-sm">{localStats.documents}</Text>
                </View>
                <View className="flex flex-row justify-between">
                  <Text className="text-text-secondary text-sm">🏷️ Anotações</Text>
                  <Text className="text-text-primary font-bold text-sm">{localStats.annotations}</Text>
                </View>
              </View>

              {/* CTAs */}
              <View className="flex flex-col gap-2">
                <Text className="text-yellow-800 text-sm font-semibold mb-2">
                  Crie uma conta para:
                </Text>
                <View className="flex flex-row items-center gap-2 mb-1">
                  <Icon name="cloud_upload" size={16} color="#92400E" />
                  <Text className="text-yellow-700 text-xs flex-1">
                    Fazer backup na nuvem
                  </Text>
                </View>
                <View className="flex flex-row items-center gap-2 mb-1">
                  <Icon name="sync" size={16} color="#92400E" />
                  <Text className="text-yellow-700 text-xs flex-1">
                    Sincronizar entre dispositivos
                  </Text>
                </View>
                <View className="flex flex-row items-center gap-2 mb-3">
                  <Icon name="shield" size={16} color="#92400E" />
                  <Text className="text-yellow-700 text-xs flex-1">
                    Nunca perder seus dados
                  </Text>
                </View>

                <View className="flex flex-row gap-2">
                  <Button 
                    variant="primary" 
                    onPress={() => router.push('/auth/signup')}
                    className="flex-1"
                  >
                    Criar Conta
                  </Button>
                  <Button 
                    variant="secondary" 
                    onPress={() => router.push('/auth/signin')}
                    className="flex-1"
                  >
                    Fazer Login
                  </Button>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Account Section */}
        {!isAnonymous && (
          <View className="flex flex-col gap-3">
            <Text className="text-sm font-semibold uppercase text-text-secondary mb-2">
              Account
            </Text>

          {/* User Profile Card */}
          <Pressable
            onPress={() => Alert.alert('Em desenvolvimento', 'Tela de perfil será implementada em breve.')}
            className="flex flex-row items-center gap-4 p-4 bg-white rounded-xl active:bg-primary-lightest"
          >
            <View className="size-12 rounded-full bg-primary-lighter items-center justify-center">
              <Icon name="person" size={24} color="#ff6b52" />
            </View>
            <View className="flex-1">
              <Text className="text-text-primary font-bold text-base leading-tight">
                {user?.user_metadata?.full_name || 'User Name'}
              </Text>
              <Text className="text-text-secondary text-sm leading-normal mt-0.5">
                {user?.email || 'user@example.com'}
              </Text>
            </View>
            <Icon name="arrow_forward_ios" size={16} color="#6C6F7D" />
          </Pressable>

          <SettingsCard
            icon={<Icon name="notifications" size={24} color="#ff6b52" />}
            title="Notifications"
            description="Manage notification preferences"
            onPress={() => Alert.alert('Em desenvolvimento')}
          />

          <SettingsCard
            icon={<Icon name="lock" size={24} color="#ff6b52" />}
            title="Security Settings"
            description="Password, 2FA, and security"
            onPress={() => Alert.alert('Em desenvolvimento')}
          />

          <SettingsCard
            icon={<Icon name="credit_card" size={24} color="#ff6b52" />}
            title="Manage Subscription"
            description="View and manage your plan"
            onPress={() => Alert.alert('Em desenvolvimento')}
          />
          </View>
        )}

        {/* App Info Section */}
        <View className="flex flex-col gap-3">
          <Text className="text-sm font-semibold uppercase text-text-secondary mb-2">
            App Info
          </Text>

          <SettingsCard
            icon={<Icon name="info" size={24} color="#ff6b52" />}
            title="About dpnotes.ai"
            description="Version, licenses, and credits"
            onPress={() => Alert.alert('dpnotes.ai', 'Version 1.0.0\n\nYour intelligent research companion.')}
          />

          <SettingsCard
            icon={<Icon name="info" size={24} color="#ff6b52" />}
            title="Terms of Service"
            description="Legal terms and conditions"
            onPress={() => Alert.alert('Em desenvolvimento')}
          />

          <SettingsCard
            icon={<Icon name="lock" size={24} color="#ff6b52" />}
            title="Privacy Policy"
            description="How we protect your data"
            onPress={() => Alert.alert('Em desenvolvimento')}
          />
        </View>

        {/* Danger Zone */}
        <View className="flex flex-col gap-3 mt-6">
          <Button
            variant="destructive"
            onPress={handleRemoveAllData}
            icon={<Icon name="delete" size={20} color="#ffffff" />}
            fullWidth
          >
            Remove All Data
          </Button>
        </View>

        {/* Version Info */}
        <View className="py-4">
          <Text className="text-text-secondary text-xs text-center">
            dpnotes.ai v1.0.0
          </Text>
          <Text className="text-text-secondary text-xs text-center mt-1">
            Made with ❤️ for researchers
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
