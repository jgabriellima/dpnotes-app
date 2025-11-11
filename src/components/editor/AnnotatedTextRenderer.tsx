/**
 * Annotated Text Renderer Component
 * 
 * Renders document content with inline annotations (highlights and badges).
 * Parses content markers and displays them with visual styling.
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { parseContent, Segment } from '../../utils/annotationParser';
import { Icon } from '../ui/Icon';
import type { AnnotationWithLabels } from '../../types';

interface AnnotatedTextRendererProps {
  content: string;
  annotations: Map<string, AnnotationWithLabels>; // Keyed by marker_id
  onAnnotationPress?: (markerId: string) => void;
  style?: any;
}

export function AnnotatedTextRenderer({
  content,
  annotations,
  onAnnotationPress,
  style,
}: AnnotatedTextRendererProps) {
  const segments = parseContent(content);

  const renderSegment = (segment: Segment, index: number) => {
    if (segment.type === 'text') {
      // Plain text segment
      return (
        <Text
          key={`text-${index}`}
          className="text-base font-normal leading-relaxed"
          style={{ color: '#3f3f46' }}
        >
          {segment.content}
        </Text>
      );
    } else {
      // Annotation segment
      const annotation = annotations.get(segment.markerId!);
      
      if (!annotation) {
        // Marker exists but no annotation found in DB - render as plain text
        return (
          <Text
            key={`missing-${index}`}
            className="text-base font-normal leading-relaxed"
            style={{ color: '#3f3f46' }}
          >
            {segment.content}
          </Text>
        );
      }

      return (
        <View key={`ann-${index}`} style={{ marginBottom: 4 }}>
          <Pressable
            onPress={() => onAnnotationPress?.(segment.markerId!)}
            style={{ display: 'inline-flex' }}
          >
            <Text
              className="text-base font-normal leading-relaxed rounded px-1 py-0.5"
              style={{
                backgroundColor: '#ffd9d2',
                color: '#27272a',
              }}
            >
              {segment.content}
            </Text>
          </Pressable>

          {/* Inline badges */}
          {(annotation.labels.length > 0 || annotation.text_note || annotation.has_audio) && (
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 4,
                marginTop: 4,
              }}
            >
              {/* Label Badges */}
              {annotation.labels.map((label) => (
                <Pressable
                  key={label.id}
                  className="flex h-6 cursor-pointer items-center justify-center rounded px-2 py-1"
                  style={{
                    backgroundColor: '#ffe6e1',
                    flexDirection: 'row',
                    gap: 4,
                  }}
                  onPress={() => onAnnotationPress?.(segment.markerId!)}
                >
                  <Icon name="sell" size={16} color="#4A5568" />
                  <Text className="text-xs font-medium" style={{ color: '#4A5568' }}>
                    {label.name}
                  </Text>
                </Pressable>
              ))}

              {/* Text Note Badge */}
              {annotation.text_note && (
                <Pressable
                  className="flex h-6 w-6 cursor-pointer items-center justify-center rounded"
                  style={{ backgroundColor: '#ffe6e1' }}
                  onPress={() => onAnnotationPress?.(segment.markerId!)}
                >
                  <Icon name="edit" size={16} color="#4A5568" />
                </Pressable>
              )}

              {/* Audio Badge */}
              {annotation.has_audio && (
                <Pressable
                  className="flex h-6 w-6 cursor-pointer items-center justify-center rounded"
                  style={{ backgroundColor: '#ffe6e1' }}
                  onPress={() => onAnnotationPress?.(segment.markerId!)}
                >
                  <Icon name="mic" size={16} color="#4A5568" />
                </Pressable>
              )}
            </View>
          )}
        </View>
      );
    }
  };

  return (
    <View style={[{ gap: 16 }, style]}>
      {segments.map((segment, index) => renderSegment(segment, index))}
    </View>
  );
}

/**
 * Simple Text Renderer (without badges, just highlights)
 * Useful for compact views or previews
 */
export function SimpleAnnotatedTextRenderer({
  content,
  annotations,
  style,
}: {
  content: string;
  annotations: Map<string, AnnotationWithLabels>;
  style?: any;
}) {
  const segments = parseContent(content);

  return (
    <Text className="text-base font-normal leading-relaxed" style={[{ color: '#3f3f46' }, style]}>
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          return <Text key={`text-${index}`}>{segment.content}</Text>;
        } else {
          const annotation = annotations.get(segment.markerId!);
          if (!annotation) {
            return <Text key={`missing-${index}`}>{segment.content}</Text>;
          }
          
          return (
            <Text
              key={`ann-${index}`}
              style={{
                backgroundColor: '#ffd9d2',
                color: '#27272a',
                paddingHorizontal: 2,
                borderRadius: 2,
              }}
            >
              {segment.content}
            </Text>
          );
        }
      })}
    </Text>
  );
}

