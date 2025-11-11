/**
 * All Projects Screen - dpnotes.ai
 * 
 * Lista completa de projetos com busca
 * 
 * Reference: docs/UX_UI_REFERENCES/all-projects/
 * HTML Reference: docs/UX_UI_REFERENCES/all-projects/code.html
 * 
 * 100% FIDELITY IMPLEMENTATION
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useProjects } from '../../src/hooks/useProjects';
import { Icon } from '../../src/components/ui/Icon';

export default function AllProjectsScreen() {
  const { data: projects, isLoading } = useProjects();
  const [searchQuery, setSearchQuery] = useState('');

  // Função para formatar datas de forma relativa
  const formatRelativeDate = (date: string) => {
    const now = new Date();
    const projectDate = new Date(date);
    const diffInMs = now.getTime() - projectDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Modified: today';
    if (diffInDays === 1) return 'Modified: 1 day ago';
    if (diffInDays === 2) return 'Modified: 2 days ago';
    if (diffInDays < 7) return `Modified: ${diffInDays} days ago`;
    if (diffInDays < 14) return 'Modified: 1 week ago';
    if (diffInDays < 21) return 'Modified: 2 weeks ago';
    if (diffInDays < 28) return 'Modified: 3 weeks ago';
    if (diffInDays < 60) return 'Modified: 1 month ago';
    if (diffInDays < 90) return 'Modified: 2 months ago';
    return `Modified: ${Math.floor(diffInDays / 30)} months ago`;
  };

  // Filtrar projetos baseado na busca
  const filteredProjects = projects?.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProjectPress = (projectId: string) => {
    router.push({
      pathname: '/editor/[id]',
      params: { id: projectId },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-lightest" edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={false} />
      
      {/* Header - Sticky - FIDELITY TO HTML */}
      <View className="flex items-center bg-primary-lightest p-4 pb-2 justify-between">
        <View className="flex flex-row items-center justify-between w-full">
          <View className="flex w-12 items-center justify-start">
            <Pressable 
              onPress={() => router.back()}
              className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 bg-transparent"
            >
              <Icon name="arrow_back_ios_new" size={24} color="#2D313E" />
            </Pressable>
          </View>
          
          <Text className="text-text-primary text-lg font-bold leading-tight tracking-tight flex-1 text-center">
            All Projects
          </Text>
          
          <View className="flex size-12 shrink-0 items-center justify-end" />
        </View>
      </View>

      {/* Content - FIDELITY TO HTML */}
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ gap: 24, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Input - FIDELITY TO HTML */}
        <View className="relative">
          <View className="absolute left-4 top-1/2" style={{ transform: [{ translateY: -12 }] }}>
            <Icon name="search" size={24} color="#6C6F7D" />
          </View>
          <TextInput
            className="w-full rounded-xl border-none bg-white py-3.5 pl-12 pr-4 text-text-primary"
            placeholder="Search for a project..."
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
        <View className="flex flex-col" style={{ gap: 12 }}>
          {isLoading ? (
            <View className="flex items-center justify-center py-12">
              <Text className="text-text-secondary text-sm">
                Loading projects...
              </Text>
            </View>
          ) : filteredProjects && filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <Pressable
                key={project.id}
                onPress={() => handleProjectPress(project.id)}
                className="flex cursor-pointer items-center justify-between rounded-xl bg-white p-4"
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <View className="flex flex-col flex-1">
                  <Text className="text-text-primary text-base font-medium leading-normal">
                    {project.name}
                  </Text>
                  <Text className="text-text-secondary text-sm font-normal leading-normal">
                    {formatRelativeDate(project.updated_at)}
                  </Text>
                </View>
                <Icon name="arrow_forward_ios" size={20} color="#6C6F7D" />
              </Pressable>
            ))
          ) : (
            <View className="flex items-center justify-center py-12">
              <Text className="text-text-secondary text-base text-center">
                {searchQuery ? 'No projects found' : 'No projects yet'}
              </Text>
              {!searchQuery && (
                <Pressable 
                  onPress={() => router.back()}
                  className="mt-4"
                >
                  <Text className="text-base font-medium" style={{ color: '#ff6b52' }}>
                    Create your first project
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

