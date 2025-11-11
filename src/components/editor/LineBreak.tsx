/**
 * LineBreak Component
 * 
 * Renders paragraph breaks with proper spacing
 */

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';

interface LineBreakProps {
  spacing?: 'default' | 'double';
}

const LineBreak = memo(({ spacing = 'default' }: LineBreakProps) => {
  return (
    <View
      style={[
        styles.lineBreak,
        spacing === 'double' && styles.doubleSpacing,
      ]}
    />
  );
});

LineBreak.displayName = 'LineBreak';

const styles = StyleSheet.create({
  lineBreak: {
    height: 8,
    width: '100%',
  },
  doubleSpacing: {
    height: 16,
  },
});

export default LineBreak;

