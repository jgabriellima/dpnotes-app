/**
 * DocumentRenderer Component
 * 
 * Main editor component that parses text and manages selection
 */

import React, { useMemo, useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Paragraph from './Paragraph';
import LineBreak from './LineBreak';
import { useWordSelection } from '../../hooks/useWordSelection';
import type { WordId, WordData, ParagraphData, Annotation, AnnotationType } from '../../types/editor.types';

interface DocumentRendererProps {
  content: string;
  annotations: Annotation[];
  onSelectionChange?: (selectedWords: Set<WordId>) => void;
  onAnnotationPress?: (annotation: Annotation) => void;
}

export function DocumentRenderer({
  content,
  annotations,
  onSelectionChange,
  onAnnotationPress,
}: DocumentRendererProps) {
  const {
    selectedWords,
    isMultiSelectMode,
    toggleWord,
    addWord,
    clearSelection,
    startMultiSelect,
  } = useWordSelection();

  const [lastTouchedWord, setLastTouchedWord] = useState<WordId | null>(null);

  // Parse content into paragraphs and words
  const paragraphs = useMemo((): ParagraphData[] => {
    console.log('[DocumentRenderer] Parsing content:', content);
    if (!content) {
      console.log('[DocumentRenderer] No content to parse!');
      return [];
    }

    const paragraphTexts = content.split('\n');
    console.log('[DocumentRenderer] Found paragraphs:', paragraphTexts.length);
    
    const result = paragraphTexts.map((paragraphText, pIndex) => {
      const wordTexts = paragraphText.split(/(\s+)/).filter(w => w.trim().length > 0);
      
      const words: WordData[] = wordTexts.map((text, wIndex) => ({
        id: `p${pIndex}-w${wIndex}`,
        text,
        paragraphIndex: pIndex,
        wordIndex: wIndex,
      }));

      return {
        index: pIndex,
        words,
      };
    });

    console.log('[DocumentRenderer] Total paragraphs:', result.length);
    console.log('[DocumentRenderer] Total words:', result.reduce((sum, p) => sum + p.words.length, 0));
    
    return result;
  }, [content]);

  // Create annotation map: wordId → annotationType
  const annotationMap = useMemo((): Map<WordId, AnnotationType> => {
    const map = new Map<WordId, AnnotationType>();
    
    annotations.forEach(annotation => {
      annotation.wordIds.forEach(wordId => {
        map.set(wordId, annotation.type);
      });
    });
    
    return map;
  }, [annotations]);

  // Get all word IDs in document order
  const allWordIds = useMemo((): WordId[] => {
    return paragraphs.flatMap(p => p.words.map(w => w.id));
  }, [paragraphs]);

  const handleWordPress = useCallback((wordId: WordId) => {
    if (isMultiSelectMode) {
      // In multi-select mode, add words
      addWord(wordId);
    } else {
      // Normal mode, toggle single word
      toggleWord(wordId);
    }
    setLastTouchedWord(wordId);
  }, [isMultiSelectMode, addWord, toggleWord]);

  const handleWordLongPress = useCallback((wordId: WordId) => {
    startMultiSelect(wordId);
    setLastTouchedWord(wordId);
  }, [startMultiSelect]);

  const handleWordPanStart = useCallback((wordId: WordId) => {
    if (isMultiSelectMode || selectedWords.size > 0) {
      // Add word during pan gesture
      addWord(wordId);
      setLastTouchedWord(wordId);
    }
  }, [isMultiSelectMode, selectedWords.size, addWord]);

  // Notify parent of selection changes
  React.useEffect(() => {
    onSelectionChange?.(selectedWords);
  }, [selectedWords, onSelectionChange]);

  console.log('[DocumentRenderer] Rendering with', paragraphs.length, 'paragraphs');

  // Test: render simple text if we have paragraphs
  if (paragraphs.length === 0) {
    return (
      <View style={styles.container}>
        <View style={{ padding: 16, backgroundColor: '#fef2f2' }}>
          <Text style={{ color: '#ef4444', fontSize: 18, fontWeight: 'bold' }}>
            No Content!
          </Text>
          <Text style={{ color: '#991b1b', fontSize: 14, marginTop: 8 }}>
            Content is empty or failed to load.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {paragraphs.map((paragraph, index) => (
          <React.Fragment key={`p${paragraph.index}`}>
            <Paragraph
              words={paragraph.words}
              selectedWords={selectedWords}
              annotations={annotationMap}
              onWordPress={handleWordPress}
              onWordLongPress={handleWordLongPress}
              onWordPanStart={handleWordPanStart}
            />
            {index < paragraphs.length - 1 && <LineBreak />}
          </React.Fragment>
        ))}
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
});

