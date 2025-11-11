/**
 * useDocumentEditor Hook
 * 
 * Main hook for managing document editing state
 */

import { useState, useEffect, useCallback } from 'react';
import { useDocumentsStore } from '../stores/documentsStore';
import { useTagsStore } from '../stores/tagsStore';
import type { WordId, Annotation, Tag } from '../types/editor.types';

export function useDocumentEditor(documentId: string) {
  console.log('🔧 [useDocumentEditor] Initializing for documentId:', documentId);
  
  const {
    getDocument,
    updateDocumentContent,
    addAnnotation,
    deleteAnnotation,
  } = useDocumentsStore();

  const { incrementUsage } = useTagsStore();

  const [content, setContent] = useState('');
  const [selectedWords, setSelectedWords] = useState<Set<WordId>>(new Set());
  const [showAnnotationPopover, setShowAnnotationPopover] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);

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

  // Handle selection changes
  const handleSelectionChange = useCallback((words: Set<WordId>) => {
    setSelectedWords(words);
    setShowAnnotationPopover(words.size > 0);
  }, []);

  // Get selected text
  const getSelectedText = useCallback((): string => {
    if (selectedWords.size === 0) return '';
    
    const wordIds = Array.from(selectedWords).sort((a, b) => {
      const [aPara, aWord] = a.split('-').map(s => parseInt(s.substring(1)));
      const [bPara, bWord] = b.split('-').map(s => parseInt(s.substring(1)));
      if (aPara !== bPara) return aPara - bPara;
      return aWord - bWord;
    });

    const paragraphs = content.split('\n');
    const words: string[] = [];

    wordIds.forEach(wordId => {
      const [paraStr, wordStr] = wordId.split('-');
      const paraIndex = parseInt(paraStr.substring(1));
      const wordIndex = parseInt(wordStr.substring(1));
      
      const paragraph = paragraphs[paraIndex];
      if (paragraph) {
        const wordTexts = paragraph.split(/(\s+)/).filter(w => w.trim().length > 0);
        if (wordTexts[wordIndex]) {
          words.push(wordTexts[wordIndex]);
        }
      }
    });

    return words.join(' ');
  }, [selectedWords, content]);

  // Create text annotation
  const handleCreateTextAnnotation = useCallback((description: string) => {
    const annotation: Annotation = {
      id: `ann-${Date.now()}`,
      wordIds: Array.from(selectedWords),
      type: 'text',
      textNote: description,
      createdAt: new Date(),
    };

    addAnnotation(documentId, annotation);
    setSelectedWords(new Set());
    setShowTextModal(false);
    setShowAnnotationPopover(false);
  }, [documentId, selectedWords, addAnnotation]);

  // Create audio annotation
  const handleCreateAudioAnnotation = useCallback((
    audioUri: string,
    audioBytes: Uint8Array,
    transcription: string,
    duration: number
  ) => {
    const annotation: Annotation = {
      id: `ann-${Date.now()}`,
      wordIds: Array.from(selectedWords),
      type: 'audio',
      audioUri,
      audioBytes,
      transcription,
      createdAt: new Date(),
    };

    addAnnotation(documentId, annotation);
    setSelectedWords(new Set());
    setShowAudioModal(false);
    setShowAnnotationPopover(false);
  }, [documentId, selectedWords, addAnnotation]);

  // Create tags annotation
  const handleCreateTagsAnnotation = useCallback((tags: Tag[]) => {
    const annotation: Annotation = {
      id: `ann-${Date.now()}`,
      wordIds: Array.from(selectedWords),
      type: 'tags',
      tags,
      createdAt: new Date(),
    };

    addAnnotation(documentId, annotation);

    // Increment usage for all tags
    tags.forEach(tag => {
      incrementUsage(tag.label);
    });

    setSelectedWords(new Set());
    setShowTagsModal(false);
    setShowAnnotationPopover(false);
  }, [documentId, selectedWords, addAnnotation, incrementUsage]);

  // Popover actions
  const handleTextNotePress = useCallback(() => {
    setShowAnnotationPopover(false);
    setShowTextModal(true);
  }, []);

  const handleAudioPress = useCallback(() => {
    setShowAnnotationPopover(false);
    setShowAudioModal(true);
  }, []);

  const handleTagsPress = useCallback(() => {
    setShowAnnotationPopover(false);
    setShowTagsModal(true);
  }, []);

  const handleClosePopover = useCallback(() => {
    setShowAnnotationPopover(false);
    setSelectedWords(new Set());
  }, []);

  return {
    content,
    selectedWords,
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
  };
}

