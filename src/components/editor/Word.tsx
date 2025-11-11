/**
 * Word Component
 * 
 * Renders a single word with gesture handlers for selection
 */

import React, { memo } from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import type { WordId, AnnotationType } from '../../types/editor.types';

interface WordProps {
  id: WordId;
  text: string;
  isSelected: boolean;
  hasAnnotation: boolean;
  annotationType?: AnnotationType;
  onPress: (id: WordId) => void;
  onLongPress: (id: WordId) => void;
  onPanStart?: (id: WordId) => void;
}

const Word = memo(({
  id,
  text,
  isSelected,
  hasAnnotation,
  annotationType,
  onPress,
  onLongPress,
  onPanStart,
}: WordProps) => {
  // Simplified: just use Pressable for now to avoid gesture issues
  const handlePress = () => {
    try {
      console.log('👆 [Word] Pressed:', text, id);
      onPress(id);
    } catch (error) {
      console.error('❌ [Word] Error in handlePress:', error);
    }
  };

  const handleLongPress = () => {
    try {
      console.log('👆 [Word] Long pressed:', text, id);
      onLongPress(id);
    } catch (error) {
      console.error('❌ [Word] Error in handleLongPress:', error);
    }
  };

  /*
  // Tap gesture - single word selection
  const tap = Gesture.Tap()
    .onEnd(() => {
      onPress(id);
    });

  // Long press gesture - start multi-select mode
  const longPress = Gesture.LongPress()
    .minDuration(500)
    .onStart(() => {
      onLongPress(id);
    });

  // Pan gesture - for slide selection
  const pan = Gesture.Pan()
    .onBegin(() => {
      onPanStart?.(id);
    });

  const composed = Gesture.Exclusive(longPress, tap, pan);
  */

  const getAnnotationStyle = () => {
    if (!hasAnnotation) return null;
    
    switch (annotationType) {
      case 'text':
        return styles.annotatedText;
      case 'audio':
        return styles.annotatedAudio;
      case 'tags':
        return styles.annotatedTags;
      default:
        return styles.annotatedText;
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
    >
      <Text
        style={[
          styles.word,
          isSelected && styles.selected,
          hasAnnotation && getAnnotationStyle(),
        ]}
      >
        {text}
      </Text>
    </Pressable>
  );
});

Word.displayName = 'Word';

const styles = StyleSheet.create({
  word: {
    fontSize: 16,
    lineHeight: 24,
    color: '#3f3f46',
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  selected: {
    backgroundColor: '#BFDBFE',
    borderRadius: 3,
  },
  annotatedText: {
    backgroundColor: '#FFD9D2',
    fontWeight: '500',
    borderRadius: 3,
  },
  annotatedAudio: {
    backgroundColor: '#DDD6FE',
    fontWeight: '500',
    borderRadius: 3,
  },
  annotatedTags: {
    backgroundColor: '#FDE68A',
    fontWeight: '500',
    borderRadius: 3,
  },
});

export default Word;

