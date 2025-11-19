/**
 * Minimal Selectable Editor
 * 
 * Abordagem ultra-simples:
 * - Palavras como Pressable simples
 * - Sem React.memo complexo
 * - Sem throttling excessivo
 * - Apenas o básico que funciona
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { EmptyState } from './EmptyState';
import type { Annotation } from '../../types/editor.types';

export interface SelectionData {
  text: string;
  bounds: any;
  wordIds: string[];
}

interface MinimalSelectableEditorProps {
  content: string;
  annotations?: Annotation[];
  onSelectionChange?: (data: SelectionData) => void;
  onAnnotationPress?: (annotation: Annotation) => void;
  onImportPress?: () => void;
  isImporting?: boolean;
}

export function MinimalSelectableEditor({
  content,
  annotations = [],
  onSelectionChange,
  onAnnotationPress,
  onImportPress,
  isImporting = false,
}: MinimalSelectableEditorProps) {
  
  const [selectedIndices, setSelectedIndices] = React.useState<Set<number>>(new Set());
  const [isSelecting, setIsSelecting] = React.useState(false);
  const [anchorIndex, setAnchorIndex] = React.useState<number | null>(null);
  const wordLayoutsRef = React.useRef<Map<number, { x: number; y: number; width: number; height: number }>>(new Map());
  
  // Parse content into words
  const words = React.useMemo(() => {
    return content.split(/\s+/).filter(w => w.length > 0);
  }, [content]);
  
  // Find word at position
  const findWordAtPosition = (x: number, y: number): number | null => {
    for (const [index, layout] of wordLayoutsRef.current.entries()) {
      if (x >= layout.x && x <= layout.x + layout.width &&
          y >= layout.y && y <= layout.y + layout.height) {
        return index;
      }
    }
    return null;
  };
  
  // Handle word press (start selection)
  const handleWordPress = (index: number) => {
    setIsSelecting(true);
    setAnchorIndex(index);
    setSelectedIndices(new Set([index]));
  };
  
  // Handle container touch move
  const handleTouchMove = (event: any) => {
    if (!isSelecting || anchorIndex === null) return;
    
    const { locationX, locationY } = event.nativeEvent;
    const wordIndex = findWordAtPosition(locationX, locationY);
    
    if (wordIndex !== null) {
      // Extend selection
      const start = Math.min(anchorIndex, wordIndex);
      const end = Math.max(anchorIndex, wordIndex);
      const newSelection = new Set<number>();
      for (let i = start; i <= end; i++) {
        newSelection.add(i);
      }
      setSelectedIndices(newSelection);
    }
  };
  
  // Handle touch end
  const handleTouchEnd = () => {
    if (selectedIndices.size > 0 && onSelectionChange) {
      const indices = Array.from(selectedIndices).sort((a, b) => a - b);
      const selectedText = indices.map(i => words[i]).join(' ');
      const wordIds = indices.map(i => `p0-w${i}`);
      
      onSelectionChange({
        text: selectedText,
        bounds: null,
        wordIds,
      });
    }
    setIsSelecting(false);
  };
  
  // Handle word layout
  const handleWordLayout = (index: number, event: any) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    wordLayoutsRef.current.set(index, { x, y, width, height });
  };
  
  // Clear selection
  const handleClear = () => {
    setSelectedIndices(new Set());
    setAnchorIndex(null);
    setIsSelecting(false);
  };
  
  // Empty state
  if (!content || content.trim().length === 0) {
    return (
      <EmptyState 
        onImportPress={onImportPress || (() => {})} 
        isLoading={isImporting}
      />
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      scrollEnabled={!isSelecting}
    >
      <View 
        style={styles.textContainer}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {words.map((word, index) => {
          const isSelected = selectedIndices.has(index);
          
          return (
            <Pressable
              key={`word-${index}`}
              onPress={() => handleWordPress(index)}
              onLayout={(e) => handleWordLayout(index, e)}
              style={styles.wordContainer}
            >
              <Text style={[styles.word, isSelected && styles.selectedWord]}>
                {word}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Selection info */}
      {selectedIndices.size > 0 && (
        <View style={styles.selectionInfo}>
          <View style={{ flex: 1 }}>
            <Text style={styles.selectionText}>
              {selectedIndices.size} palavra{selectedIndices.size > 1 ? 's' : ''} selecionada{selectedIndices.size > 1 ? 's' : ''}
            </Text>
            <Text style={styles.selectionPreview} numberOfLines={2}>
              "{Array.from(selectedIndices).sort((a, b) => a - b).map(i => words[i]).join(' ')}"
            </Text>
          </View>
          <Pressable onPress={handleClear} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Limpar</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 16,
  },
  textContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  wordContainer: {
    marginRight: 4,
    marginBottom: 4,
  },
  word: {
    fontSize: 17,
    lineHeight: 26,
    color: '#1f2937',
    paddingHorizontal: 2,
  },
  selectedWord: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    borderRadius: 2,
    paddingHorizontal: 4,
  },
  selectionInfo: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  selectionText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  selectionPreview: {
    fontSize: 14,
    color: '#374151',
  },
  clearButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

