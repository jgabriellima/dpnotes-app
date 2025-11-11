/**
 * SelectionLayer
 * 
 * Orchestrates text selection with handles, highlights, and gestures
 */

import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { TextLayoutEngine } from './TextLayoutEngine';
import { SelectionHandle } from './SelectionHandle';
import { SelectionHighlight } from './SelectionHighlight';
import { SelectionToolbar } from './SelectionToolbar';
import { findWordBoundaries } from '../../utils/textMeasurement';

interface SelectionLayerProps {
  layoutEngine: TextLayoutEngine;
  plainText: string;
  onCreateAnnotation: (text: string, start: number, end: number) => void;
  enabled?: boolean;
}

export function SelectionLayer({
  layoutEngine,
  plainText,
  onCreateAnnotation,
  enabled = true,
}: SelectionLayerProps) {
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const [toolbarPosition, setToolbarPosition] = useState<{ x: number; y: number } | null>(null);
  const lastTapTime = useRef(0);

  // Handle tap to start selection
  const handleTap = useCallback((x: number, y: number) => {
    if (!enabled) return;

    const charIndex = layoutEngine.getCharAtPoint(x, y);
    const { start, end } = findWordBoundaries(plainText, charIndex);

    setSelection({ start, end });

    // Position toolbar above selection
    const startPos = layoutEngine.getCharPosition(start);
    if (startPos) {
      setToolbarPosition({
        x: startPos.x,
        y: startPos.y - 60, // Above text
      });
    }

    // Haptic feedback (optional)
    // Can be added later with expo-haptics if needed
  }, [enabled, layoutEngine, plainText]);

  // Handle double tap for word selection
  const handleDoubleTap = useCallback((x: number, y: number) => {
    const now = Date.now();
    if (now - lastTapTime.current < 300) {
      handleTap(x, y);
    }
    lastTapTime.current = now;
  }, [handleTap]);

  // Handle handle drag
  const handleHandleDrag = useCallback((type: 'start' | 'end', x: number, y: number) => {
    if (!selection) return;

    const charIndex = layoutEngine.getCharAtPoint(x, y);

    let newStart = selection.start;
    let newEnd = selection.end;

    if (type === 'start') {
      newStart = Math.min(charIndex, selection.end - 1);
    } else {
      newEnd = Math.max(charIndex, selection.start + 1);
    }

    setSelection({ start: newStart, end: newEnd });

    // Update toolbar position
    const startPos = layoutEngine.getCharPosition(newStart);
    if (startPos) {
      setToolbarPosition({
        x: startPos.x,
        y: startPos.y - 60,
      });
    }
  }, [selection, layoutEngine]);

  // Handle annotation creation
  const handleAnnotate = useCallback(() => {
    if (!selection) return;

    const selectedText = plainText.substring(selection.start, selection.end);
    onCreateAnnotation(selectedText, selection.start, selection.end);
    
    // Clear selection
    setSelection(null);
    setToolbarPosition(null);
  }, [selection, plainText, onCreateAnnotation]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setSelection(null);
    setToolbarPosition(null);
  }, []);

  // Tap gesture
  const tapGesture = Gesture.Tap()
    .onEnd((event) => {
      handleTap(event.x, event.y);
    });

  // Get selection rectangles
  const selectionRects = selection 
    ? layoutEngine.getSelectionBounds(selection.start, selection.end)
    : [];

  // Get handle positions
  const startPos = selection ? layoutEngine.getCharPosition(selection.start) : null;
  const endPos = selection ? layoutEngine.getCharPosition(selection.end) : null;

  if (!enabled) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Selection highlight */}
      {selection && <SelectionHighlight rects={selectionRects} />}

      {/* Tap detection layer */}
      <GestureDetector gesture={tapGesture}>
        <View style={styles.tapLayer} />
      </GestureDetector>

      {/* Selection handles */}
      {selection && startPos && (
        <SelectionHandle
          type="start"
          position={{ x: startPos.x, y: startPos.y }}
          onDrag={handleHandleDrag}
        />
      )}
      {selection && endPos && (
        <SelectionHandle
          type="end"
          position={{ x: endPos.x + (endPos.width || 0), y: endPos.y + (endPos.height || 24) }}
          onDrag={handleHandleDrag}
        />
      )}

      {/* Toolbar */}
      {selection && toolbarPosition && (
        <SelectionToolbar
          position={toolbarPosition}
          onAnnotate={handleAnnotate}
          onCancel={handleCancel}
          selectedLength={selection.end - selection.start}
        />
      )}

      {/* Cancel overlay (tap outside to cancel) */}
      {selection && (
        <Pressable
          style={styles.cancelOverlay}
          onPress={handleCancel}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  tapLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  cancelOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
});

