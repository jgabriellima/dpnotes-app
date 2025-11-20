/**
 * Text Editor Screen - dpnotes.ai (Optimized for Researchers)
 * 
 * Two clear modes:
 * - EDIT: Write and modify content
 * - NOTES: Read with annotations + Add new annotations by selecting text
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, Pressable, StatusBar, Alert, ActivityIndicator, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, router } from 'expo-router';
import { Icon } from '../../src/components/ui/Icon';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { SettingsModal } from '../../src/components/settings/SettingsModal';
import { NotesMenu } from '../../src/components/notes/NotesMenu';
import { WebViewSelectableEditor as SelectableTextEditor } from '../../src/components/editor/WebViewSelectableEditor';
import { AnnotationPopover } from '../../src/components/editor/AnnotationPopover';
import { useDocumentEditor } from '../../src/hooks/useDocumentEditor';
import { useDocumentsStore } from '../../src/stores/documentsStore';
import { useTagsStore } from '../../src/stores/tagsStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { importFromClipboard } from '../../src/services/clipboard/import';
import type { Annotation } from '../../src/types/editor.types';

function EditorScreenContent() {
  const params = useLocalSearchParams<{ id: string }>();
  const documentId = params.id;
  const isDemoMode = documentId === 'demo';

  console.log('🚀 [EditorScreen] Starting render');
  console.log('🚀 [EditorScreen] documentId:', documentId);
  
  // Initialize stores
  const { loadDocuments, getDocument, updateDocumentContent, clearAllAnnotations, createDocument } = useDocumentsStore();
  const { loadTags } = useTagsStore();
  const [isImporting, setIsImporting] = useState(false);
  const [editingAnnotation, setEditingAnnotation] = useState<Annotation | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotesMenu, setShowNotesMenu] = useState(false);
  const [popoverResetKey, setPopoverResetKey] = useState(0);
  const {
    content,
    popoverPosition,
    showAnnotationPopover,
    handleContentChange,
    handleSelectionChange,
    getSelectedText,
    handleCreateTextAnnotation,
    handleCreateAudioAnnotation,
    handleCreateTagsAnnotation,
    handleUpdateAnnotation,
    handleDeleteAnnotation,
    handleClosePopover,
  } = useDocumentEditor(documentId);

  // Load stores on mount
  useEffect(() => {
    loadDocuments();
    loadTags();
  }, [loadDocuments, loadTags]);

  // Load settings on mount
  const { loadSettings } = useSettingsStore();
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Close settings modal first
      if (showSettings) {
        console.log('⬅️ [EditorScreen] Back pressed - closing settings');
        setShowSettings(false);
        return true;
      }
      
      // Close notes menu
      if (showNotesMenu) {
        console.log('⬅️ [EditorScreen] Back pressed - closing notes menu');
        setShowNotesMenu(false);
        return true;
      }
      
      // Close popover
      if (showAnnotationPopover) {
        console.log('⬅️ [EditorScreen] Back pressed - closing popover');
        handlePopoverClose();
        return true;
      }
      
      // If nothing is open, don't allow back (notes-first - stay in the app)
      console.log('⬅️ [EditorScreen] Back pressed - ignoring (notes-first)');
      return true; // Prevent back navigation
    });

    return () => backHandler.remove();
  }, [showAnnotationPopover, showSettings, showNotesMenu]);

  // Get current document
  const document = getDocument(documentId);

  // Insert annotations inline directly after each annotated text
  const insertAnnotationsInline = (text: string, annotations: Annotation[]) => {
    // Create a map of wordId to annotation object
    const wordIdToAnnotation = new Map<string, Annotation>();
    
    annotations.forEach((annotation) => {
      if (annotation.wordIds && annotation.wordIds.length > 0) {
        // Mark the last word ID of each annotation
        const lastWordId = annotation.wordIds[annotation.wordIds.length - 1];
        wordIdToAnnotation.set(lastWordId, annotation);
      }
    });
    
    // Process text paragraph by paragraph (same structure as wordId generation)
    const paragraphs = text.split(/\n\n+/);
    const resultParagraphs: string[] = [];
    
    paragraphs.forEach((para, paraIndex) => {
      if (!para.trim()) {
        resultParagraphs.push(para);
        return;
      }
      
      const words = para.split(/(\s+)/); // Keep whitespace
      let paraResult = '';
      let wordIndex = 0;
      
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        
        // Add the word/whitespace as-is
        paraResult += word;
        
        // Skip pure whitespace for wordId tracking
        if (/^\s+$/.test(word)) {
          continue;
        }
        
        // Check if this word has an annotation
        const wordId = `p${paraIndex}-w${wordIndex}`;
        if (wordIdToAnnotation.has(wordId)) {
          const annotation = wordIdToAnnotation.get(wordId)!;
          
          // Build inline annotation based on type
          let inlineAnnotation = '';
          
          if (annotation.type === 'text' && annotation.textNote) {
            inlineAnnotation = ` **[Note: ${annotation.textNote}]**`;
          } else if (annotation.type === 'tags' && annotation.tags && annotation.tags.length > 0) {
            const tagsList = annotation.tags.map(t => t.label).join(', ');
            inlineAnnotation = ` **[Tags: ${tagsList}]**`;
          } else if (annotation.type === 'audio' && annotation.transcription) {
            inlineAnnotation = ` **[Audio: ${annotation.transcription}]**`;
          }
          
          paraResult += inlineAnnotation;
        }
        
        wordIndex++;
      }
      
      resultParagraphs.push(paraResult);
    });
    
    // Rejoin paragraphs with double newlines
    return resultParagraphs.join('\n\n');
  };

  const handleCopyToClipboard = async () => {
    try {
      const annotations = document?.annotations || [];
      
      console.log('📋 [Editor] Copy button clicked:', {
        documentId,
        hasDocument: !!document,
        annotationsCount: annotations.length,
        annotations: annotations.map(a => ({
          id: a.id,
          type: a.type,
          hasTextNote: !!a.textNote,
          hasTags: (a.tags?.length || 0) > 0,
          hasAudio: !!a.audioUri,
        })),
      });
      
      if (annotations.length === 0) {
        // Se não tem anotações, copia só o texto
        await Clipboard.setStringAsync(content);
        Alert.alert('Copiado!', 'Texto copiado para o clipboard (sem anotações)');
        return;
      }

      console.log('📋 [Editor] Copying with annotations:', {
        annotationsCount: annotations.length,
        hasContent: !!content,
      });

      // Generate custom prompt with inline annotations
      const sections: string[] = [];
      
      // Header with format explanation
      sections.push('Instruction: This text contains inline annotations. Each annotation appears immediately after the annotated text in the following formats:');
      sections.push('- Text notes: **[Note: your note here]**');
      sections.push('- Tags: **[Tags: tag1, tag2]**');
      sections.push('- Audio transcriptions: **[Audio: transcription here]**');
      sections.push('');
      
      // Annotated Text with inline annotations
      sections.push('[Annotated Text]');
      sections.push(insertAnnotationsInline(content, annotations));
      
      const prompt = sections.join('\n');

      console.log('✅ [Editor] Prompt generated:', {
        length: prompt.length,
        preview: prompt.substring(0, 300) + '...',
      });

      await Clipboard.setStringAsync(prompt);
      Alert.alert(
        'Copiado!', 
        `Texto com ${annotations.length} anotação(ões) copiado para o clipboard`
      );
    } catch (error) {
      console.error('❌ [Editor] Copy error:', error);
      Alert.alert('Erro', 'Não foi possível copiar o conteúdo');
    }
  };

  const handleImportFromClipboard = async () => {
    try {
      setIsImporting(true);
      
      // Importa conteúdo do clipboard
      const { content: importedContent, wordCount, source } = await importFromClipboard();
      
      console.log(`📋 Imported ${wordCount} words from ${source}`);
      
      // Limpa todas as anotações do documento atual (novo conteúdo = novas anotações)
      clearAllAnnotations(documentId);
      console.log('🧹 [EditorScreen] Cleared all annotations for new content');
      
      // Atualiza o documento atual diretamente
      updateDocumentContent(documentId, importedContent);
      
      // Força re-render via hook
      handleContentChange(importedContent);
      
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert('Erro', 'Não foi possível importar o conteúdo');
    } finally {
      setIsImporting(false);
    }
  };

  const handleCreateNewNote = () => {
    const newId = `doc-${Date.now()}`;
    createDocument(newId, '');
    router.replace(`/editor/${newId}`);
  };

  const handleAnnotationPress = (annotation: Annotation, rect?: { x: number; y: number; width: number; height: number }) => {
    console.log('🎯 [EditorScreen] Annotation clicked:', {
      id: annotation.id,
      type: annotation.type,
      hasAudio: !!annotation.audioUri,
      hasText: !!annotation.textNote,
    });
    
    // Set editing mode FIRST
    setEditingAnnotation(annotation);
    
    // Use provided rect or default position
    const editPosition = rect ? {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      touchX: rect.x + rect.width / 2, // Center of annotation
      touchY: rect.y + rect.height / 2,
    } : {
      x: 150,
      y: 300,
      width: 0,
      height: 0,
      touchX: 150,
      touchY: 300,
    };
    
    console.log('📍 [EditorScreen] Opening popover at position:', editPosition);
    
    // For editing, we need to trigger the popover even if there's no text
    // (e.g., audio annotations don't have textNote)
    // Pass a placeholder text or the transcription for context
    const displayText = annotation.textNote || annotation.transcription || ' '; // Space to ensure popover opens
    
    // Trigger popover with position and annotation's wordIds
    handleSelectionChange({ 
      text: displayText,
      bounds: editPosition,
      wordIds: annotation.wordIds // Keep the annotation's wordIds
    });
  };

  const handlePopoverClose = () => {
    setEditingAnnotation(null);
    handleClosePopover();
  };

  // Wrapper for handleSelectionChange that resets popover on new selection
  const handleSelectionChangeWrapper = useCallback((data: any) => {
    // Clear editing annotation and reset popover when user makes a NEW selection
    if (data.text && data.text.trim().length > 0) {
      console.log('🧹 [EditorScreen] New selection - resetting popover state');
      setEditingAnnotation(null);
      
      // Increment reset key to trigger popover reset
      setPopoverResetKey(prev => prev + 1);
    }
    
    // Call original handler
    handleSelectionChange(data);
  }, [handleSelectionChange]);

  // Generate display title from document or content
  const displayTitle = React.useMemo(() => {
    if (document?.title && document.title !== 'Sem título') {
      return document.title;
    }
    
    // Generate title from first line of content
    if (content && content.trim().length > 0) {
      const firstLine = content.split('\n')[0].trim();
      if (firstLine.length > 0) {
        // Remove markdown formatting
        const cleaned = firstLine.replace(/^#+\s*/, '').replace(/\*\*/g, '');
        return cleaned.substring(0, 40) + (cleaned.length > 40 ? '...' : '');
      }
    }
    
    return 'Nova Nota';
  }, [document?.title, content]);

  // Debug: log content
  console.log('[EditorScreen] documentId:', documentId);
  console.log('[EditorScreen] content:', content);
  console.log('[EditorScreen] content length:', content?.length);

  console.log('🎯 [EditorScreen] Rendering SelectableTextEditor');
  console.log('🎯 [EditorScreen] Content:', content?.substring(0, 100));

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
        {/* Top Row: Menu and Title */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Pressable onPress={() => setShowNotesMenu(true)} style={{ padding: 8 }}>
            <Icon name="menu" size={24} color="#2D313E" />
          </Pressable>
          
          <Text className="text-lg font-bold flex-1" style={{ color: '#18181b' }} numberOfLines={1}>
            {displayTitle}
          </Text>
        </View>

        {/* Action Row: Tools */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
          {/* Quick Actions */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable 
              onPress={handleImportFromClipboard} 
              style={{ padding: 6 }}
              disabled={isImporting}
            >
              {isImporting ? (
                <ActivityIndicator size="small" color="#6b7280" />
              ) : (
                <Icon name="download" size={20} color="#6b7280" />
              )}
            </Pressable>
            <Pressable onPress={handleCopyToClipboard} style={{ padding: 6 }}>
              <Icon name="ios_share" size={20} color="#6b7280" />
            </Pressable>
            <Pressable 
              onPress={() => setShowSettings(true)} 
              style={{ padding: 6, marginLeft: 4 }}
            >
              <Icon name="settings" size={20} color="#6b7280" />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Selectable Text Editor - Production component with annotations */}
      <SelectableTextEditor 
        content={content}
        annotations={document?.annotations || []}
        onSelectionChange={handleSelectionChangeWrapper}
        onAnnotationPress={handleAnnotationPress}
        onImportPress={handleImportFromClipboard}
        isImporting={isImporting}
      />

      {/* Annotation Popover - Inline annotations, no modals, supports editing */}
      <AnnotationPopover
        visible={showAnnotationPopover}
        position={popoverPosition}
        selectedText={getSelectedText()}
        editingAnnotation={editingAnnotation}
        onTextNote={handleCreateTextAnnotation}
        onAudioNote={handleCreateAudioAnnotation}
        onTagsNote={handleCreateTagsAnnotation}
        onUpdateAnnotation={handleUpdateAnnotation}
        onDeleteAnnotation={handleDeleteAnnotation}
        onClose={handlePopoverClose}
        resetKey={popoverResetKey}
      />

      {/* Settings Modal */}
      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Notes Menu */}
      <NotesMenu
        visible={showNotesMenu}
        currentDocumentId={documentId}
        onClose={() => setShowNotesMenu(false)}
        onCreateNew={handleCreateNewNote}
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
