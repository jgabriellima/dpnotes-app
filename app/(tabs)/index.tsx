/**
 * Home Screen - dpnotes.ai
 * 
 * Main screen showing project list and creation options.
 * Implements clipboard detection for automatic text import.
 * 
 * Reference: docs/UX_UI_REFERENCES/home/
 * HTML Reference: docs/UX_UI_REFERENCES/home/code.html
 * 
 * 100% FIDELITY IMPLEMENTATION
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, Image, Alert, Pressable, TextInput, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useProjects, useCreateProject } from '../../src/hooks/useProjects';
import { useClipboardDetection } from '../../src/services/clipboard';
import { Icon } from '../../src/components/ui/Icon';
import { BottomSheetModal } from '../../src/components/ui/Modal';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';

export default function HomeScreen() {
  const { isAnonymous } = useAuth();
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const { clipboardContent, dismissClipboard } = useClipboardDetection(true);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateBlankProject = () => {
    setShowCreateModal(true);
  };

  const handleCreateFromClipboard = async () => {
    try {
      // Tenta pegar do hook primeiro, senão busca diretamente
      let content = clipboardContent?.content;
      
      if (!content) {
        // Busca diretamente do clipboard
        const Clipboard = require('expo-clipboard');
        const hasContent = await Clipboard.hasStringAsync();
        if (hasContent) {
          content = await Clipboard.getStringAsync();
        }
      }

      if (!content || content.trim().length === 0) {
        Alert.alert('Clipboard vazio', 'Não há texto no clipboard para importar. Copie algum texto primeiro.');
        return;
      }

      const project = await createProject.mutateAsync({
        name: 'Projeto do Clipboard',
        description: 'Criado a partir do clipboard',
      });

      router.push({
        pathname: '/editor/[id]',
        params: { 
          id: project.id,
          clipboardContent: content,
        },
      });

      dismissClipboard();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar o projeto.');
      console.error(error);
    }
  };

  const handleImportToExisting = () => {
    Alert.alert('Em desenvolvimento', 'Esta funcionalidade será implementada em breve.');
  };

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      Alert.alert('Nome obrigatório', 'Por favor, insira um nome para o projeto.');
      return;
    }

    try {
      const project = await createProject.mutateAsync({
        name: projectName.trim(),
        description: projectDescription.trim() || null,
      });

      setShowCreateModal(false);
      setProjectName('');
      setProjectDescription('');

      // Navigate back to home - project is now in the list
      Alert.alert(
        'Projeto criado!', 
        'Seu projeto foi criado com sucesso. Clique nele para começar a adicionar documentos.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível criar o projeto.');
      console.error(error);
    }
  };

  const handleProjectPress = (projectId: string) => {
    // Navigate to project detail screen
    router.push(`/project/${projectId}`);
  };

  // Função para formatar datas de forma relativa (como no HTML)
  const formatRelativeDate = (date: string) => {
    const now = new Date();
    const projectDate = new Date(date);
    const diffInMs = now.getTime() - projectDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Modified: today';
    if (diffInDays === 1) return 'Modified: 1 day ago';
    if (diffInDays < 7) return `Modified: ${diffInDays} days ago`;
    if (diffInDays < 14) return 'Modified: 1 week ago';
    if (diffInDays < 21) return 'Modified: 2 weeks ago';
    if (diffInDays < 28) return 'Modified: 3 weeks ago';
    return `Modified: ${Math.floor(diffInDays / 7)} weeks ago`;
  };

  // Filtrar projetos baseado na busca
  const filteredProjects = projects?.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-primary-lightest" edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={false} />
      
      {/* Header - FIDELITY TO HTML */}
      <View className="flex flex-row items-center bg-primary-lightest p-4 pb-2 justify-between">
        <View className="flex size-12 shrink-0 items-center justify-start">
          <View 
            className="rounded-full size-8 bg-center bg-no-repeat aspect-square bg-cover items-center justify-center"
            style={{ backgroundColor: '#ffe6e1' }}
          >
            {/* TODO: Replace with actual user avatar when auth is implemented */}
            <Icon name="person" size={20} color="#ff6b52" />
          </View>
        </View>
        
        <Text className="text-text-primary text-lg font-bold leading-tight tracking-tight flex-1 text-center">
          dpnotes.ai
        </Text>
        
        <View className="flex w-12 items-center justify-end">
          <Pressable 
            onPress={() => router.push('/settings')}
            className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 bg-transparent"
          >
            <Icon name="settings" size={24} color="#2D313E" />
          </Pressable>
        </View>
      </View>

      {/* Content - ScrollView */}
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ gap: 16, paddingHorizontal: 16, paddingTop: 24, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Create New Project Card - FIDELITY TO HTML */}
        <View className="flex flex-col gap-4 rounded-xl bg-white p-4">
          <View className="flex flex-col">
            <Text className="text-text-primary text-base font-bold leading-tight">
              Create a New Project
            </Text>
            <Text className="text-text-secondary text-sm font-normal leading-normal">
              Start a new research journey
            </Text>
          </View>

          {/* Option 1: Blank Note */}
          <Pressable 
            onPress={handleCreateBlankProject}
            className="flex flex-row items-center rounded-lg bg-primary-lightest p-4"
            style={{ gap: 16 }}
          >
            <View className="size-10 items-center justify-center rounded-lg bg-primary-lighter">
              <Icon name="edit_square" size={24} color="#ff6b52" />
            </View>
            <Text className="flex-1 text-text-primary text-base font-medium leading-normal">
              Start with a Blank Note
            </Text>
            <Icon name="arrow_forward_ios" size={20} color="#6C6F7D" />
          </Pressable>

          {/* Option 2: From Clipboard */}
          <Pressable 
            onPress={handleCreateFromClipboard}
            className="flex flex-row items-center rounded-lg bg-primary-lightest p-4"
            style={{ gap: 16 }}
          >
            <View className="size-10 items-center justify-center rounded-lg bg-primary-lighter">
              <Icon name="post_add" size={24} color="#ff6b52" />
            </View>
            <Text className="flex-1 text-text-primary text-base font-medium leading-normal">
              Create New Project from Clipboard
            </Text>
            <Icon name="arrow_forward_ios" size={20} color="#6C6F7D" />
          </Pressable>

          {/* Option 3: Import to Existing */}
          <Pressable 
            onPress={handleImportToExisting}
            className="flex flex-row items-center rounded-lg bg-primary-lightest p-4"
            style={{ gap: 16 }}
          >
            <View className="size-10 items-center justify-center rounded-lg bg-primary-lighter">
              <Icon name="content_paste_go" size={24} color="#ff6b52" />
            </View>
            <Text className="flex-1 text-text-primary text-base font-medium leading-normal">
              Import Clipboard to Existing Project
            </Text>
            <Icon name="arrow_forward_ios" size={20} color="#6C6F7D" />
          </Pressable>
        </View>

        {/* Recent Projects Header - FIDELITY TO HTML */}
        <View className="flex items-center justify-between pt-8 pb-3" style={{ flexDirection: 'row' }}>
          <Text className="text-text-primary text-[22px] font-bold leading-tight tracking-tight">
            Recent Projects
          </Text>
          <Pressable onPress={() => router.push('/projects')}>
            <Text className="text-sm font-medium" style={{ color: '#ff6b52' }}>
              View All
            </Text>
          </Pressable>
        </View>

        {/* Search Input - FIDELITY TO HTML */}
        <View className="flex flex-col gap-4">
          <View className="relative w-full">
            <View className="absolute left-3 top-1/2" style={{ transform: [{ translateY: -12 }] }}>
              <Icon name="search" size={24} color="#6C6F7D" />
            </View>
            <TextInput
              className="w-full rounded-lg border-0 bg-white py-3 pl-10 pr-4 text-text-primary"
              placeholder="Search projects..."
              placeholderTextColor="#6C6F7D"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            />
          </View>

          {/* Projects List - FIDELITY TO HTML */}
          {isLoading ? (
            <View className="flex flex-col gap-2 rounded-xl bg-white p-4">
              <Text className="text-text-secondary text-sm text-center py-8">
                Loading projects...
              </Text>
            </View>
          ) : filteredProjects && filteredProjects.length > 0 ? (
            <View className="flex flex-col gap-2 rounded-xl bg-white p-4">
              {filteredProjects.slice(0, 5).map((project) => (
                <Pressable
                  key={project.id}
                  onPress={() => handleProjectPress(project.id)}
                  className="flex cursor-pointer items-center justify-between rounded-lg p-2"
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: pressed ? '#fff2f0' : 'transparent',
                  })}
                >
                  <View style={{ flex: 1 }}>
                    <Text className="text-text-primary text-base font-medium leading-normal">
                      {project.name}
                    </Text>
                    <Text className="text-text-secondary text-sm font-normal leading-normal">
                      {formatRelativeDate(project.updated_at)}
                    </Text>
                  </View>
                  <Icon name="arrow_forward_ios" size={20} color="#6C6F7D" />
                </Pressable>
              ))}
            </View>
          ) : (
            <View className="flex flex-col gap-2 rounded-xl bg-white p-4">
              <Text className="text-text-secondary text-sm text-center py-8">
                {searchQuery ? 'No projects found' : 'No projects yet. Create your first project!'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Create Project Modal */}
      <BottomSheetModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      >
        <View className="flex flex-col gap-4">
          <Text className="text-text-primary text-xl font-bold">
            Create New Project
          </Text>

          <Input
            label="Project Name"
            placeholder="e.g., AI Research"
            value={projectName}
            onChangeText={setProjectName}
            autoFocus
          />

          <Input
            label="Description (optional)"
            placeholder="Add a brief description..."
            value={projectDescription}
            onChangeText={setProjectDescription}
            multiline
            numberOfLines={3}
          />

          <View className="flex flex-row mt-4" style={{ gap: 12 }}>
            <View className="flex-1">
              <Button
                variant="secondary"
                onPress={() => setShowCreateModal(false)}
                fullWidth
              >
                Cancel
              </Button>
            </View>
            <View className="flex-1">
              <Button
                variant="primary"
                onPress={handleCreateProject}
                loading={createProject.isPending}
                fullWidth
              >
                Create
              </Button>
            </View>
          </View>
        </View>
      </BottomSheetModal>
    </SafeAreaView>
  );
}
