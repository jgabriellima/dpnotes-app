/**
 * Project Detail Screen
 * 
 * Shows list of documents in a project with ability to create new documents.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StatusBar, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useProjects } from '../../src/hooks/useProjects';
import { useDocumentsByProject, useCreateDocument } from '../../src/hooks/useDocuments';
import { Icon } from '../../src/components/ui/Icon';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { BottomSheetModal } from '../../src/components/ui/Modal';
import { stripMarkers } from '../../src/utils/annotationParser';

export default function ProjectDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const projectId = params.id;
  
  const { data: projects } = useProjects();
  const { data: documents, isLoading } = useDocumentsByProject(projectId);
  const createDocument = useCreateDocument();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [documentTitle, setDocumentTitle] = useState('');

  const project = projects?.find(p => p.id === projectId);

  const handleBack = () => {
    router.back();
  };

  const handleCreateDocument = async () => {
    if (!documentTitle.trim()) {
      Alert.alert('Título obrigatório', 'Por favor, insira um título para o documento.');
      return;
    }

    if (!projectId) {
      Alert.alert('Erro', 'ID do projeto inválido.');
      return;
    }

    try {
      const document = await createDocument.mutateAsync({
        project_id: projectId,
        title: documentTitle.trim(),
        content: '', // Initialize with empty content
      });

      setShowCreateModal(false);
      setDocumentTitle('');

      // Navigate to editor
      router.push(`/editor/${document.id}`);
    } catch (error: any) {
      console.error('Error creating document:', error);
      Alert.alert(
        'Erro', 
        error.message || error.hint || 'Não foi possível criar o documento. Verifique se o projeto existe.'
      );
    }
  };

  const handleDocumentPress = (documentId: string) => {
    router.push(`/editor/${documentId}`);
  };

  const formatRelativeDate = (date: string) => {
    const now = new Date();
    const docDate = new Date(date);
    const diffInMs = now.getTime() - docDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const getPreviewText = (content: string) => {
    const plainText = stripMarkers(content);
    return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-lightest" edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={false} />
      
      {/* Header */}
      <View className="flex flex-row items-center bg-primary-lightest p-4 pb-2 justify-between">
        <Pressable 
          onPress={handleBack}
          className="flex size-12 items-center justify-start"
        >
          <Icon name="arrow_back" size={24} color="#2D313E" />
        </Pressable>
        
        <Text className="text-text-primary text-lg font-bold leading-tight tracking-tight flex-1 text-center">
          {project?.name || 'Project'}
        </Text>
        
        <View className="flex w-12" />
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-text-secondary text-base">Loading documents...</Text>
        </View>
      ) : documents && documents.length > 0 ? (
        <FlatList
          data={documents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleDocumentPress(item.id)}
              className="rounded-xl bg-white p-4"
              style={({ pressed }) => ({
                backgroundColor: pressed ? '#fff2f0' : '#ffffff',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              })}
            >
              <View className="flex flex-col gap-2">
                <View className="flex flex-row items-center justify-between">
                  <Text className="text-text-primary text-base font-semibold leading-tight flex-1">
                    {item.title}
                  </Text>
                  <Icon name="arrow_forward_ios" size={18} color="#6C6F7D" />
                </View>
                
                {item.content && (
                  <Text className="text-text-secondary text-sm leading-normal" numberOfLines={2}>
                    {getPreviewText(item.content)}
                  </Text>
                )}
                
                <Text className="text-text-tertiary text-xs">
                  Modified: {formatRelativeDate(item.updated_at)}
                </Text>
              </View>
            </Pressable>
          )}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <Icon name="description" size={64} color="#d1d5db" />
          <Text className="text-text-primary text-xl font-bold mt-4 text-center">
            No documents yet
          </Text>
          <Text className="text-text-secondary text-base mt-2 text-center">
            Create your first document to start taking notes
          </Text>
        </View>
      )}

      {/* Floating Action Button */}
      <View 
        className="fixed z-20"
        style={{
          position: 'absolute',
          bottom: 24,
          right: 16,
        }}
      >
        <Pressable 
          onPress={() => setShowCreateModal(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full"
          style={{
            backgroundColor: '#ffccc3',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Icon name="add" size={28} color="#4A5568" />
        </Pressable>
      </View>

      {/* Create Document Modal */}
      <BottomSheetModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      >
        <View className="flex flex-col gap-4">
          <Text className="text-text-primary text-xl font-bold">
            New Document
          </Text>

          <Input
            label="Document Title"
            placeholder="e.g., Research Notes"
            value={documentTitle}
            onChangeText={setDocumentTitle}
            autoFocus
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
                onPress={handleCreateDocument}
                loading={createDocument.isPending}
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

