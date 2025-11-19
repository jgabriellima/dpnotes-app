/**
 * AnnotationMarker Component
 * 
 * Visual marker for inline annotations in text
 * Shows highlight + icon based on annotation type
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Icon } from '../ui/Icon';
import type { Annotation } from '../../types/editor.types';

interface AnnotationMarkerProps {
  annotation: Annotation;
  text: string;
  onPress: () => void;
}

export function AnnotationMarker({
  annotation,
  text,
  onPress,
}: AnnotationMarkerProps) {
  const { type } = annotation;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.marker,
        type === 'text' && styles.textMarker,
        type === 'audio' && styles.audioMarker,
        type === 'tag' && styles.tagMarker,
      ]}
    >
      <Text
        style={[
          styles.markerText,
          type === 'text' && styles.textMarkerText,
          type === 'audio' && styles.audioMarkerText,
          type === 'tag' && styles.tagMarkerText,
        ]}
      >
        {text}
      </Text>
      
      {/* Icon for audio and tag types */}
      {type === 'audio' && (
        <Icon name="mic" size={12} color="#8b5cf6" style={styles.icon} />
      )}
      {type === 'tag' && annotation.tags && annotation.tags.length > 0 && (
        <View style={styles.tagBadge}>
          <Text style={styles.tagBadgeText}>{annotation.tags.length}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  marker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    marginHorizontal: 1,
  },
  markerText: {
    fontSize: 17,
    lineHeight: 26,
  },
  
  // Text annotation (yellow)
  textMarker: {
    backgroundColor: '#fef3c7',
    borderColor: '#fbbf24',
  },
  textMarkerText: {
    color: '#92400e',
  },
  
  // Audio annotation (purple)
  audioMarker: {
    backgroundColor: '#ede9fe',
    borderColor: '#8b5cf6',
  },
  audioMarkerText: {
    color: '#5b21b6',
  },
  
  // Tag annotation (blue)
  tagMarker: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  tagMarkerText: {
    color: '#1e40af',
  },
  
  icon: {
    marginLeft: 4,
  },
  
  tagBadge: {
    marginLeft: 4,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
});

