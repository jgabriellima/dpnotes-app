/**
 * Simple Document Test Component
 * 
 * Minimal version to test if basic rendering works
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, LayoutRectangle, findNodeHandle } from 'react-native';

interface SimpleDocumentTestProps {
  content: string;
}

interface WordLayout {
  index: number;
  rect: LayoutRectangle;
}

export function SimpleDocumentTest({ content }: SimpleDocumentTestProps) {
  console.log('📄 [SimpleDocumentTest] Rendering with content:', content?.substring(0, 50));

  const [selectedIndices, setSelectedIndices] = React.useState<Set<number>>(new Set());
  const [isSelecting, setIsSelecting] = React.useState(false);
  const [anchorIndex, setAnchorIndex] = React.useState<number | null>(null); // Start of selection
  const [focusIndex, setFocusIndex] = React.useState<number | null>(null); // Current end of selection
  const [lastSelectedIndex, setLastSelectedIndex] = React.useState<number | null>(null); // Last word we selected/deselected
  const wordLayoutsRef = React.useRef<Map<number, LayoutRectangle>>(new Map());
  const containerRef = React.useRef<View>(null);

  if (!content) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>No content provided</Text>
      </View>
    );
  }

  const words = content.split(/\s+/).filter(w => w.length > 0);
  console.log('📄 [SimpleDocumentTest] Parsed words:', words.length);

  const selectRange = (start: number, end: number, isExtendingForward: boolean) => {
    setSelectedIndices(prev => {
      const newSelection = new Set<number>();
      
      // Always select the range from start to end
      const minIndex = Math.min(start, end);
      const maxIndex = Math.max(start, end);
      
      for (let i = minIndex; i <= maxIndex; i++) {
        newSelection.add(i);
      }
      
      return newSelection;
    });
  };

  const clearSelection = () => {
    setSelectedIndices(new Set());
    setAnchorIndex(null);
    setFocusIndex(null);
  };

  const getSelectedText = () => {
    const indices = Array.from(selectedIndices).sort((a, b) => a - b);
    return indices.map(i => words[i]).join(' ');
  };

  const findWordAtPosition = (x: number, y: number): number | null => {
    // x, y are relative to container
    for (const [index, rect] of wordLayoutsRef.current.entries()) {
      // Only check center 50% of word height (25% top and 25% bottom not touchable)
      const centerY = rect.y + rect.height / 2;
      const centerHeight = rect.height * 0.5; // 50% of height
      const centerTop = centerY - centerHeight / 2;
      const centerBottom = centerY + centerHeight / 2;
      
      const isInsideX = x >= rect.x && x <= rect.x + rect.width;
      const isInsideY = y >= centerTop && y <= centerBottom;
      
      if (isInsideX && isInsideY) {
        return index;
      }
    }
    return null;
  };

  const handleContainerTouchStart = (e: any) => {
    const { locationX, locationY } = e.nativeEvent;
    // Use relative coordinates to container
    const wordIndex = findWordAtPosition(locationX, locationY);
    
    if (wordIndex !== null) {
      setIsSelecting(true);
      setAnchorIndex(wordIndex);
      setFocusIndex(wordIndex);
      setLastSelectedIndex(wordIndex);
      setSelectedIndices(new Set([wordIndex]));
    } else {
      // Touched outside any word - clear selection
      clearSelection();
    }
  };

  const handleContainerTouchMove = (e: any) => {
    if (!isSelecting || anchorIndex === null) return;
    
    const { locationX, locationY } = e.nativeEvent;
    const wordIndex = findWordAtPosition(locationX, locationY);
    
    if (wordIndex !== null && wordIndex !== lastSelectedIndex) {
      const isExtendingForward = wordIndex > focusIndex;
      setFocusIndex(wordIndex);
      setLastSelectedIndex(wordIndex);
      selectRange(anchorIndex, wordIndex, isExtendingForward);
    }
  };

  const handleContainerTouchEnd = (e: any) => {
    setIsSelecting(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View 
        style={styles.wordsContainer}
        onTouchStart={handleContainerTouchStart}
        onTouchMove={handleContainerTouchMove}
        onTouchEnd={handleContainerTouchEnd}
      >
        {words.map((word, index) => (
          <React.Fragment key={`word-${index}`}>
            <View
              onLayout={(e) => {
                // Store position relative to container (not screen)
                const layout = e.nativeEvent.layout;
                wordLayoutsRef.current.set(index, layout);
              }}
              pointerEvents="none"
            >
              <Text
                style={[
                  styles.word,
                  selectedIndices.has(index) && styles.selectedWord,
                ]}
              >
                {word}
              </Text>
            </View>
            <Text style={styles.space}> </Text>
          </React.Fragment>
        ))}
      </View>

      {selectedIndices.size > 0 && (
        <View style={styles.selectionInfo}>
          <View style={{ flex: 1 }}>
            <Text style={styles.selectionText}>
              {selectedIndices.size} {selectedIndices.size === 1 ? 'word' : 'words'} selected
            </Text>
            <Text style={styles.selectionPreview} numberOfLines={2}>
              "{getSelectedText()}"
            </Text>
          </View>
          <Pressable
            onPress={clearSelection}
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
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  word: {
    fontSize: 17,
    lineHeight: 26,
    color: '#1f2937',
  },
  space: {
    fontSize: 17,
    lineHeight: 26,
  },
  selectedWord: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
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

