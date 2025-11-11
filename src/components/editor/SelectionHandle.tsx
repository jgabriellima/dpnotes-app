/**
 * SelectionHandle
 * 
 * Draggable handle for text selection (iOS-style blue circle)
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';

interface SelectionHandleProps {
  type: 'start' | 'end';
  position: { x: number; y: number };
  onDrag: (type: 'start' | 'end', x: number, y: number) => void;
  onDragEnd?: () => void;
}

export function SelectionHandle({
  type,
  position,
  onDrag,
  onDragEnd,
}: SelectionHandleProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      
      // Call onDrag callback
      const newX = position.x + event.translationX;
      const newY = position.y + event.translationY;
      runOnJS(onDrag)(type, newX, newY);
    })
    .onEnd(() => {
      translateX.value = 0;
      translateY.value = 0;
      if (onDragEnd) {
        runOnJS(onDragEnd)();
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const containerStyle = [
    styles.handle,
    type === 'start' ? styles.handleStart : styles.handleEnd,
    {
      left: position.x - 12, // Center the handle
      top: position.y - (type === 'start' ? 32 : 8), // Position above/below text
    },
  ];

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[containerStyle, animatedStyle]}>
        <Animated.View style={styles.handleCircle} />
        {type === 'start' && <Animated.View style={styles.handleTail} />}
        {type === 'end' && <Animated.View style={styles.handleTailEnd} />}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  handle: {
    position: 'absolute',
    width: 24,
    height: 24,
    zIndex: 1000,
  },
  handleStart: {
    // Position above text
  },
  handleEnd: {
    // Position below text
  },
  handleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  handleTail: {
    position: 'absolute',
    top: 24,
    left: 11,
    width: 2,
    height: 8,
    backgroundColor: '#3b82f6',
  },
  handleTailEnd: {
    position: 'absolute',
    bottom: 24,
    left: 11,
    width: 2,
    height: 8,
    backgroundColor: '#3b82f6',
  },
});

