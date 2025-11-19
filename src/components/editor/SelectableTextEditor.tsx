/**
 * Selectable Text Editor Component
 * 
 * Production text editor with word-level selection for annotations
 * Now with markdown block rendering support and decoupled selection layer
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, LayoutRectangle } from 'react-native';
import { EmptyState } from './EmptyState';
import { MarkdownBlock } from './MarkdownBlock';
import type { Annotation } from '../../types/editor.types';
import { parseMarkdownBlocks } from '../../utils/markdownBlockParser';
import { useSelectionManager } from '../../hooks/useSelectionManager';
import { useAnnotationMapping } from '../../hooks/useAnnotationMapping';

export interface SelectionBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  touchX?: number; // Absolute touch position X (where finger was lifted)
  touchY?: number; // Absolute touch position Y (where finger was lifted)
}

export interface SelectionData {
  text: string;
  bounds: SelectionBounds | null;
  wordIds: string[]; // Format: "p{paragraphIndex}-w{wordIndex}"
}

interface SelectableTextEditorProps {
  content: string;
  annotations?: Annotation[];
  onSelectionChange?: (data: SelectionData) => void;
  onAnnotationPress?: (annotation: Annotation) => void;
  onImportPress?: () => void;
  isImporting?: boolean;
}

interface WordLayout {
  index: number;
  rect: LayoutRectangle;
}

export function SelectableTextEditor({
  content,
  annotations = [],
  onSelectionChange,
  onAnnotationPress,
  onImportPress,
  isImporting = false,
}: SelectableTextEditorProps) {
  const wordLayoutsRef = React.useRef<Map<number, LayoutRectangle>>(new Map());
  const isSelectingRef = React.useRef(false);
  const lastSelectedWordRef = React.useRef<number | null>(null);
  const lastExtendTimeRef = React.useRef<number>(0);

  // Parse markdown into blocks (BEFORE early return to avoid hook order issues)
  const blocks = React.useMemo(() => {
    if (!content || content.trim().length === 0) return [];
    return parseMarkdownBlocks(content);
  }, [content]);

  // Extract global word array for selection logic
  const allWords = React.useMemo(() => {
    return blocks.flatMap(b => b.words);
  }, [blocks]);

  // Use annotation mapping hook
  const annotationMapping = useAnnotationMapping(annotations);
  
  // Use selection manager
  const selection = useSelectionManager(allWords);
  
  // Find word at coordinates - USA LAYOUTS REAIS
  const findWordAtPosition = React.useCallback((x: number, y: number): number | null => {
    console.log(`🔎 Finding word at (${x.toFixed(2)}, ${y.toFixed(2)}), layouts available:`, wordLayoutsRef.current.size);
    
    // Early exit: check if we're still on the last selected word
    if (lastSelectedWordRef.current !== null) {
      const lastLayout = wordLayoutsRef.current.get(lastSelectedWordRef.current);
      if (lastLayout) {
        console.log(`   Checking last word ${lastSelectedWordRef.current}:`, lastLayout);
        if (x >= lastLayout.x && x <= lastLayout.x + lastLayout.width &&
            y >= lastLayout.y && y <= lastLayout.y + lastLayout.height) {
          console.log(`   ✅ Still on last word!`);
          return lastSelectedWordRef.current;
        }
      }
    }
    
    // Search all words using REAL layouts
    let closestWord: number | null = null;
    let closestDistance = Infinity;
    
    for (const [wordIndex, layout] of wordLayoutsRef.current.entries()) {
      // Check if touch is within word bounds
      if (x >= layout.x && x <= layout.x + layout.width &&
          y >= layout.y && y <= layout.y + layout.height) {
        console.log(`   ✅ EXACT HIT on word ${wordIndex}:`, layout);
        return wordIndex;
      }
      
      // Calculate distance to find closest word (fallback)
      const centerX = layout.x + layout.width / 2;
      const centerY = layout.y + layout.height / 2;
      const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestWord = wordIndex;
      }
    }
    
    // If no exact hit, use closest word within reasonable distance (100px)
    if (closestWord !== null && closestDistance < 100) {
      console.log(`   📌 Using closest word ${closestWord}, distance: ${closestDistance.toFixed(2)}px`);
      return closestWord;
    }
    
    console.log(`   ❌ No word found`);
    return null;
  }, []);
  
  // Handle touch start on word
  const handleWordTouchStart = React.useCallback((wordIndex: number) => {
    console.log('🚀 Touch start on word:', wordIndex);
    isSelectingRef.current = true;
    lastSelectedWordRef.current = wordIndex;
    selection.startSelection(wordIndex);
  }, [selection]);
  
  // Handle touch end
  const handleTouchEnd = React.useCallback(() => {
    isSelectingRef.current = false;
    lastSelectedWordRef.current = null;
    selection.endSelection();
  }, [selection]);
  
  // Handle word touch move - THROTTLED to avoid excessive updates
  const handleWordTouchMove = React.useCallback((wordIndex: number) => {
    console.log('👆 handleWordTouchMove called, wordIndex:', wordIndex, 'isSelecting:', isSelectingRef.current);
    if (!isSelectingRef.current) return;
    
    // Throttle: only process every 16ms (~60fps)
    const now = Date.now();
    if (now - lastExtendTimeRef.current < 16) {
      console.log('⏸️ Throttled');
      return;
    }
    lastExtendTimeRef.current = now;
    
    // Only extend if we found a new word
    if (wordIndex !== lastSelectedWordRef.current) {
      console.log('✅ Extending to word:', wordIndex);
      selection.extendSelection(wordIndex);
      lastSelectedWordRef.current = wordIndex;
    } else {
      console.log('⏭️ Same word, skipping');
    }
  }, [selection]);
  
  // Handle container touch move - forward to words
  const handleContainerTouchMove = React.useCallback((event: any) => {
    console.log('📍 Container touch move event fired');
    if (!isSelectingRef.current) {
      console.log('❌ Not selecting, ignoring');
      return;
    }
    
    const { locationX, locationY } = event.nativeEvent;
    console.log('📐 Touch at:', locationX, locationY);
    const wordIndex = findWordAtPosition(locationX, locationY);
    console.log('🔍 Found word index:', wordIndex);
    
    if (wordIndex !== null) {
      handleWordTouchMove(wordIndex);
    } else {
      console.log('⚠️ No word found at position');
    }
  }, [findWordAtPosition, handleWordTouchMove]);
  
  // Compute annotation markers for blocks (which word indices get markers)
  // MUST be before early return to maintain hook order
  const annotationMarkersForBlocks = React.useMemo(() => {
    const markersMap = new Map<number, Annotation>();
    
    blocks.forEach(block => {
      const blockAnnotations = annotationMapping.getAnnotationsForBlock(
        block.startWordIndex,
        block.endWordIndex
      );
      
      blockAnnotations.forEach(ann => {
        const lastWordIndex = annotationMapping.getLastWordOfAnnotation(
          ann,
          [block.startWordIndex, block.endWordIndex]
        );
        
        if (lastWordIndex !== null) {
          markersMap.set(lastWordIndex, ann);
        }
      });
    });
    
    return markersMap;
  }, [blocks, annotationMapping.getAnnotationsForBlock, annotationMapping.getLastWordOfAnnotation]);
  
  // Notify parent when selection changes
  // MUST be before early return to maintain hook order
  React.useEffect(() => {
    if (selection.selectionSize > 0 && onSelectionChange) {
      const indices = selection.getSelectedIndices();
      const text = selection.getSelectedText();
      const wordIds = indices.map(i => `p0-w${i}`);
      
      onSelectionChange({
        text,
        bounds: null, // Não precisamos mais de bounds
        wordIds,
      });
    }
  }, [selection.selectionSize, selection.getSelectedIndices, selection.getSelectedText, onSelectionChange]);
  
  // Removed excessive logging for performance

  // Show empty state if no content (AFTER all hooks)
  if (!content || content.trim().length === 0) {
    return (
      <EmptyState 
        onImportPress={onImportPress || (() => {})} 
        isLoading={isImporting}
      />
    );
  }

  // Render markdown blocks with annotations
  const renderBlocks = () => {
    return blocks.map((block, blockIndex) => (
      <MarkdownBlock
        key={`block-${blockIndex}-${block.startWordIndex}`}
        block={block}
        isWordSelected={selection.isWordSelected}
        wordLayoutsRef={wordLayoutsRef}
        annotationMarkers={annotationMarkersForBlocks}
        onAnnotationPress={onAnnotationPress}
        onWordTouchStart={handleWordTouchStart}
        onWordTouchMove={handleWordTouchMove}
        onWordTouchEnd={handleTouchEnd}
      />
    ));
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      scrollEnabled={!isSelectingRef.current}
    >
      <View 
        style={styles.blocksContainer}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderMove={handleContainerTouchMove}
        onResponderRelease={handleTouchEnd}
      >
        {renderBlocks()}
      </View>

      {selection.selectionSize > 0 && (
        <View style={styles.selectionInfo}>
          <View style={{ flex: 1 }}>
            <Text style={styles.selectionText}>
              {selection.selectionSize} {selection.selectionSize === 1 ? 'word' : 'words'} selected
            </Text>
            <Text style={styles.selectionPreview} numberOfLines={2}>
              "{selection.getSelectedText()}"
            </Text>
          </View>
          <Pressable
            onPress={selection.clearSelection}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
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
  error: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  blocksContainer: {
    width: '100%',
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
