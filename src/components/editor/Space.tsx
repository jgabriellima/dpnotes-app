/**
 * Space Component
 * 
 * Renders whitespace between words
 */

import React, { memo } from 'react';
import { Text, StyleSheet } from 'react-native';

const Space = memo(() => {
  return <Text style={styles.space}> </Text>;
});

Space.displayName = 'Space';

const styles = StyleSheet.create({
  space: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default Space;

