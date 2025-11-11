/**
 * Paragraph Component
 * 
 * Container for Word and Space components with flex wrap
 */

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import Word from './Word';
import Space from './Space';
import type { WordId, WordData, AnnotationType } from '../../types/editor.types';

interface ParagraphProps {
  words: WordData[];
  selectedWords: Set<WordId>;
  annotations: Map<WordId, AnnotationType>;
  onWordPress: (id: WordId) => void;
  onWordLongPress: (id: WordId) => void;
  onWordPanStart?: (id: WordId) => void;
}

const Paragraph = memo(({
  words,
  selectedWords,
  annotations,
  onWordPress,
  onWordLongPress,
  onWordPanStart,
}: ParagraphProps) => {
  return (
    <View style={styles.paragraph}>
      {words.map((word, index) => (
        <React.Fragment key={word.id}>
          <Word
            id={word.id}
            text={word.text}
            isSelected={selectedWords.has(word.id)}
            hasAnnotation={annotations.has(word.id)}
            annotationType={annotations.get(word.id)}
            onPress={onWordPress}
            onLongPress={onWordLongPress}
            onPanStart={onWordPanStart}
          />
          {index < words.length - 1 && <Space />}
        </React.Fragment>
      ))}
    </View>
  );
});

Paragraph.displayName = 'Paragraph';

const styles = StyleSheet.create({
  paragraph: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
});

export default Paragraph;

