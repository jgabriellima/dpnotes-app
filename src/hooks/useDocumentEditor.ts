/**
 * useDocumentEditor Hook
 * 
 * Main hook for managing document editing state
 */

import { useState, useEffect, useCallback } from 'react';
import { useDocumentsStore } from '../stores/documentsStore';
import { useTagsStore } from '../stores/tagsStore';
import type { WordId, Annotation, Tag } from '../types/editor.types';
import type { PopoverPosition } from '../components/editor/AnnotationPopover';
import type { SelectionData } from '../components/editor/WebViewSelectableEditor';

export function useDocumentEditor(documentId: string) {
  console.log('🔧 [useDocumentEditor] Initializing for documentId:', documentId);
  
  const {
    getDocument,
    updateDocumentContent,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
  } = useDocumentsStore();

  const { incrementUsage } = useTagsStore();

  const [content, setContent] = useState('');
  const [selectedWords, setSelectedWords] = useState<WordId[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [popoverPosition, setPopoverPosition] = useState<PopoverPosition | null>(null);
  const [showAnnotationPopover, setShowAnnotationPopover] = useState(false);

  console.log('🔧 [useDocumentEditor] Current content length:', content.length);

  // Load document or initialize with demo content
  useEffect(() => {
    const doc = getDocument(documentId);
    if (doc) {
      setContent(doc.content);
    } else if (documentId === 'demo' || !documentId) {
      // Initialize with demo content
      const demoContent = `Welcome to the Component-Based Editor!

This editor uses individual word components for precise selection.

Try tapping on any word to select it. Long-press to enter multi-select mode, then slide your finger across multiple words.

Once you have selected text, a popover will appear with options to add:
- Text notes
- Audio recordings  
- Tags with descriptions

All annotations are stored locally and can be exported to Markdown format.`;
      setContent(demoContent);
      updateDocumentContent(documentId, demoContent);
    }
  }, [documentId, getDocument, updateDocumentContent]);

  // Save content changes
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    updateDocumentContent(documentId, newContent);
  }, [documentId, updateDocumentContent]);

  // Handle selection changes (from SelectableTextEditor)
  const handleSelectionChange = useCallback((data: SelectionData) => {
    setSelectedText(data.text);
    setPopoverPosition(data.bounds);
    setSelectedWords(data.wordIds);
    
    // Show popover if we have bounds (position)
    // For new selections: require text
    // For editing annotations: allow empty text (e.g., audio annotations)
    const shouldShow = !!data.bounds && (data.text.length > 0 || data.wordIds.length > 0);
    setShowAnnotationPopover(shouldShow);
    
    console.log('🔧 [useDocumentEditor] Selection changed:', {
      text: data.text,
      wordIds: data.wordIds,
      shouldShow,
    });
  }, []);

  // Get selected text
  const getSelectedText = useCallback((): string => {
    return selectedText;
  }, [selectedText]);

  // Create text annotation
  const handleCreateTextAnnotation = useCallback((description: string) => {
    console.log('🔧 [useDocumentEditor] Creating text annotation with wordIds:', selectedWords);
    
    const annotation: Annotation = {
      id: `ann-${Date.now()}`,
      wordIds: selectedWords,
      type: 'text',
      textNote: description,
      createdAt: new Date(),
    };

    addAnnotation(documentId, annotation);
    setSelectedWords([]);
    setShowAnnotationPopover(false);
  }, [documentId, selectedWords, addAnnotation]);

  // Create audio annotation
  const handleCreateAudioAnnotation = useCallback((
    audioUri: string,
    duration: number,
    transcription?: string
  ) => {
    console.log('🔧 [useDocumentEditor] Creating audio annotation with wordIds:', selectedWords);
    console.log('🔧 [useDocumentEditor] Transcription:', transcription);
    
    const annotation: Annotation = {
      id: `ann-${Date.now()}`,
      wordIds: selectedWords,
      type: 'audio',
      audioUri,
      audioBytes: new Uint8Array(), // Empty for now, can be loaded from URI
      transcription: transcription || '', // Save transcription if available
      createdAt: new Date(),
    };

    addAnnotation(documentId, annotation);
    setSelectedWords([]);
    setShowAnnotationPopover(false);
  }, [documentId, selectedWords, addAnnotation]);

  // Create tags annotation
  const handleCreateTagsAnnotation = useCallback((tagLabels: string[]) => {
    console.log('🔧 [useDocumentEditor] Creating tags annotation with wordIds:', selectedWords);
    
    const tags: Tag[] = tagLabels.map(label => ({
      label,
      description: label, // Use label as description
    }));

    const annotation: Annotation = {
      id: `ann-${Date.now()}`,
      wordIds: selectedWords,
      type: 'tags',
      tags,
      createdAt: new Date(),
    };

    addAnnotation(documentId, annotation);

    // Increment usage for all tags
    tags.forEach(tag => {
      incrementUsage(tag.label);
    });

    setSelectedWords([]);
    setShowAnnotationPopover(false);
  }, [documentId, selectedWords, addAnnotation, incrementUsage]);

  const handleClosePopover = useCallback(() => {
    setShowAnnotationPopover(false);
    setSelectedWords([]);
    setSelectedText('');
    setPopoverPosition(null);
  }, []);

  // Update annotation (for editing existing annotations)
  const handleUpdateAnnotation = useCallback((
    annotationId: string,
    type: 'text' | 'audio' | 'tags',
    data: any
  ) => {
    const updates: Partial<Annotation> = { type };

    if (type === 'text') {
      updates.textNote = data;
      // Clear other type-specific data
      updates.audioUri = undefined;
      updates.audioBytes = undefined;
      updates.transcription = undefined;
      updates.tags = undefined;
    } else if (type === 'audio') {
      updates.audioUri = data.uri;
      updates.audioBytes = new Uint8Array(); // Empty for now
      updates.transcription = data.transcription || ''; // Save transcription from data
      console.log('🔧 [useDocumentEditor] Updated audio annotation with transcription:', data.transcription);
      // Clear other type-specific data
      updates.textNote = undefined;
      updates.tags = undefined;
    } else if (type === 'tags') {
      const tagLabels = data as string[];
      updates.tags = tagLabels.map(label => ({
        label,
        description: label,
      }));
      // Increment usage for all tags
      tagLabels.forEach(label => {
        incrementUsage(label);
      });
      // Clear other type-specific data
      updates.textNote = undefined;
      updates.audioUri = undefined;
      updates.audioBytes = undefined;
      updates.transcription = undefined;
    }

    updateAnnotation(documentId, annotationId, updates);
  }, [documentId, updateAnnotation, incrementUsage]);

  // Delete annotation
  const handleDeleteAnnotation = useCallback((annotationId: string) => {
    deleteAnnotation(documentId, annotationId);
  }, [documentId, deleteAnnotation]);

  return {
    content,
    selectedWords,
    selectedText,
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
  };
}

