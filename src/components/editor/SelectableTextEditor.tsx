/**
 * SelectableTextEditor
 * 
 * Complete text editor with custom rendering and selection
 */

import React, { useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CustomTextRenderer } from './CustomTextRenderer';
import { SelectionLayer } from './SelectionLayer';
import { TextLayoutEngine } from './TextLayoutEngine';
import type { AnnotationWithLabels } from '../../types';

interface SelectableTextEditorProps {
  content: string;
  annotations: Map<string, AnnotationWithLabels>;
  onAnnotationPress: (markerId: string) => void;
  onCreateAnnotation: (text: string, start: number, end: number) => void;
  plainText: string;
}

export function SelectableTextEditor({
  content,
  annotations,
  onAnnotationPress,
  onCreateAnnotation,
  plainText,
}: SelectableTextEditorProps) {
  const layoutEngineRef = useRef<TextLayoutEngine | null>(null);

  const handleSegmentLayout = useCallback((engine: TextLayoutEngine) => {
    layoutEngineRef.current = engine;
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Text rendering layer */}
        <CustomTextRenderer
          content={content}
          annotations={annotations}
          onAnnotationPress={onAnnotationPress}
          onSegmentLayout={handleSegmentLayout}
        />

        {/* Selection layer (overlays text) */}
        {layoutEngineRef.current && (
          <SelectionLayer
            layoutEngine={layoutEngineRef.current}
            plainText={plainText}
            onCreateAnnotation={onCreateAnnotation}
            enabled={true}
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
});

