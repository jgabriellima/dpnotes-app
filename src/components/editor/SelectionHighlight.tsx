/**
 * SelectionHighlight
 * 
 * Blue overlay rectangles showing selected text
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { Rect } from '../../utils/textMeasurement';

interface SelectionHighlightProps {
  rects: Rect[];
}

export function SelectionHighlight({ rects }: SelectionHighlightProps) {
  if (rects.length === 0) {
    return null;
  }

  return (
    <>
      {rects.map((rect, index) => (
        <View
          key={`highlight-${index}`}
          style={[
            styles.highlight,
            {
              left: rect.x,
              top: rect.y,
              width: rect.width,
              height: rect.height,
            },
          ]}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  highlight: {
    position: 'absolute',
    backgroundColor: '#93c5fd',
    opacity: 0.3,
    borderRadius: 2,
  },
});

