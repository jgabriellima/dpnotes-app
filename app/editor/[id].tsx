/**
 * Text Editor Screen - dpnotes.ai (Optimized for Researchers)
 * 
 * Two clear modes:
 * - EDIT: Write and modify content
 * - NOTES: Read with annotations + Add new annotations by selecting text
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, router } from 'expo-router';
import { Icon } from '../../src/components/ui/Icon';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { DocumentRenderer } from '../../src/components/editor/DocumentRenderer';
import { SimpleDocumentTest } from '../../src/components/editor/SimpleDocumentTest';
import { AnnotationPopover } from '../../src/components/editor/AnnotationPopover';
import { AnnotationTextModal } from '../../src/components/editor/AnnotationTextModal';
import { AnnotationAudioModal } from '../../src/components/editor/AnnotationAudioModal';
import { AnnotationTagsModal } from '../../src/components/editor/AnnotationTagsModal';
import { useDocumentEditor } from '../../src/hooks/useDocumentEditor';
import { useDocumentsStore } from '../../src/stores/documentsStore';
import { useTagsStore } from '../../src/stores/tagsStore';
import type { Annotation } from '../../src/types/editor.types';

function EditorScreenContent() {
  const params = useLocalSearchParams<{ id: string }>();
  const documentId = params.id;
  const isDemoMode = documentId === 'demo';

  console.log('🚀 [EditorScreen] Starting render');
  console.log('🚀 [EditorScreen] documentId:', documentId);
  
  // Initialize stores
  const { loadDocuments, getDocument } = useDocumentsStore();
  const { loadTags } = useTagsStore();
  const {
    content,
    showAnnotationPopover,
    showTextModal,
    showAudioModal,
    showTagsModal,
    handleContentChange,
    handleSelectionChange,
    getSelectedText,
    handleCreateTextAnnotation,
    handleCreateAudioAnnotation,
    handleCreateTagsAnnotation,
    handleTextNotePress,
    handleAudioPress,
    handleTagsPress,
    handleClosePopover,
    setShowTextModal,
    setShowAudioModal,
    setShowTagsModal,
  } = useDocumentEditor(documentId);

  // Load stores on mount
  useEffect(() => {
    loadDocuments();
    loadTags();
  }, [loadDocuments, loadTags]);

  // Get current document
  const document = getDocument(documentId);

  const handleBack = () => {
    router.back();
  };

  const handleSaveAndClose = async () => {
    handleBack();
  };

  const handleCopyToClipboard = async () => {
    await Clipboard.setStringAsync(content);
    Alert.alert('Copied!', 'Content copied to clipboard');
  };

  const displayTitle = 'Deep Research Notes';

  // Debug: log content
  console.log('[EditorScreen] documentId:', documentId);
  console.log('[EditorScreen] content:', content);
  console.log('[EditorScreen] content length:', content?.length);

  // Fallback content if empty
  const displayContent = content || `Welcome to the editor!

Tap on any word to select it.

Long-press to enter multi-select mode.`;

  // Toggle between simple test and full renderer
  const [useSimpleTest, setUseSimpleTest] = React.useState(true);

  console.log('🎯 [EditorScreen] Using simple test mode:', useSimpleTest);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View 
        className="bg-white px-4 py-2 border-b border-gray-200"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 2,
        }}
      >
        {/* Top Row: Back, Title, Save */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <Pressable onPress={handleBack} style={{ padding: 8 }}>
            <Icon name="arrow_back" size={24} color="#2D313E" />
          </Pressable>
          
          <Text className="text-lg font-bold flex-1 text-center" style={{ color: '#18181b' }} numberOfLines={1}>
            {displayTitle}
          </Text>

          <Pressable 
            onPress={handleSaveAndClose}
            style={{ 
              backgroundColor: '#10b981', 
              paddingHorizontal: 16, 
              paddingVertical: 8, 
              borderRadius: 8 
            }}
          >
            <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 14 }}>
              Done
            </Text>
          </Pressable>
        </View>

        {/* Action Row: Mode Toggle & Tools */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
          {/* Left: Mode Toggle */}
          <Pressable 
            onPress={() => setUseSimpleTest(!useSimpleTest)}
            style={{ 
              backgroundColor: useSimpleTest ? '#10b981' : '#6b7280',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '600' }}>
              {useSimpleTest ? 'Simple Test' : 'Full Editor'}
            </Text>
          </Pressable>

          {/* Right: Quick Actions */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable onPress={handleCopyToClipboard} style={{ padding: 6 }}>
              <Icon name="content_copy" size={20} color="#6b7280" />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Document Renderer - Component-based editor */}
      {useSimpleTest ? (
        <SimpleDocumentTest content={displayContent} />
      ) : (
        <DocumentRenderer
          content={displayContent}
          annotations={document?.annotations || []}
          onSelectionChange={handleSelectionChange}
        />
      )}

      {/* Annotation Popover */}
      <AnnotationPopover
        visible={showAnnotationPopover}
        onTextNote={handleTextNotePress}
        onAudio={handleAudioPress}
        onTags={handleTagsPress}
        onClose={handleClosePopover}
      />

      {/* Annotation Modals */}
      <AnnotationTextModal
        visible={showTextModal}
        selectedText={getSelectedText()}
        onSave={handleCreateTextAnnotation}
        onClose={() => setShowTextModal(false)}
      />

      <AnnotationAudioModal
        visible={showAudioModal}
        selectedText={getSelectedText()}
        onSave={handleCreateAudioAnnotation}
        onClose={() => setShowAudioModal(false)}
      />

      <AnnotationTagsModal
        visible={showTagsModal}
        selectedText={getSelectedText()}
        onSave={handleCreateTagsAnnotation}
        onClose={() => setShowTagsModal(false)}
      />
    </SafeAreaView>
  );
}

export default function EditorScreen() {
  return (
    <ErrorBoundary>
      <EditorScreenContent />
    </ErrorBoundary>
  );
}

// Demo content for testing
function getDemoContent(): string {
  return `This is a demo document for testing the annotation system.

EDIT Mode: Type or modify content
NOTES Mode: Select text to add annotations

Try selecting this text in NOTES mode!

You can annotate any word, sentence, or paragraph. Just highlight it with your finger and choose "Add Annotation" from the menu.`;
}
