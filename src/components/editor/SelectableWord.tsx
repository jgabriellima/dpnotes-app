/**
 * SelectableWord Component
 * 
 * Palavra individual tocável para seleção
 * Simula comportamento nativo de seleção de texto
 */

import React from 'react';
import { View, Text, StyleSheet, LayoutRectangle } from 'react-native';

interface SelectableWordProps {
  word: string;
  wordIndex: number;
  isSelected: boolean;
  onLayout: (wordIndex: number, layout: LayoutRectangle) => void;
  onTouchStart: (wordIndex: number) => void;
  onTouchMove: (wordIndex: number) => void;
  onTouchEnd: () => void;
  style?: any;
}

export const SelectableWord = React.memo(({
  word,
  wordIndex,
  isSelected,
  onLayout,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  style,
}: SelectableWordProps) => {
  
  const handleLayout = React.useCallback((e: any) => {
    const layout = e.nativeEvent.layout;
    onLayout(wordIndex, layout);
  }, [wordIndex, onLayout]);
  
  const handleTouchStart = React.useCallback(() => {
    onTouchStart(wordIndex);
  }, [wordIndex, onTouchStart]);
  
  const handleTouchMove = React.useCallback(() => {
    onTouchMove(wordIndex);
  }, [wordIndex, onTouchMove]);
  
  return (
    <View
      onLayout={handleLayout}
      onStartShouldSetResponder={() => true}
      onResponderGrant={handleTouchStart}
      onResponderMove={handleTouchMove}
      onResponderRelease={onTouchEnd}
      style={styles.wordContainer}
    >
      <Text
        style={[
          styles.word,
          style,
          isSelected && styles.selected,
        ]}
      >
        {word}
      </Text>
    </View>
  );
}, (prev, next) => {
  // OTIMIZAÇÃO CRÍTICA: NÃO re-renderizar se seleção NÃO mudou
  // Retorna true = SKIP render, false = RENDER
  // word e wordIndex nunca mudam (são imutáveis)
  if (prev.isSelected !== next.isSelected) {
    console.log(`🎨 Re-render word ${next.wordIndex} "${next.word}" → ${next.isSelected ? 'SELECTED' : 'DESELECTED'}`);
    return false; // Seleção mudou → RENDERIZAR
  }
  if (prev.word !== next.word) {
    return false; // Palavra mudou → RENDERIZAR
  }
  return true; // Nada mudou → SKIP
});

SelectableWord.displayName = 'SelectableWord';

const styles = StyleSheet.create({
  wordContainer: {
    flexDirection: 'row',
  },
  word: {
    fontSize: 17,
    lineHeight: 26,
    color: '#1f2937',
  },
  selected: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    borderRadius: 2,
    paddingHorizontal: 2,
  },
});

