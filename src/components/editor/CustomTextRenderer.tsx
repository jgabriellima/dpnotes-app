/**
 * CustomTextRenderer
 * 
 * Main rendering component with layout tracking and annotation display
 */

import React, { useRef, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent } from 'react-native';
import { TextLayoutEngine, TextSegment } from './TextLayoutEngine';
import { parseMarkdownAndAnnotations } from './MarkdownParser';
import { Icon } from '../ui/Icon';
import type { AnnotationWithLabels } from '../../types';

interface CustomTextRendererProps {
  content: string;
  annotations: Map<string, AnnotationWithLabels>;
  onAnnotationPress?: (markerId: string) => void;
  onSegmentLayout?: (engine: TextLayoutEngine) => void;
}

export const CustomTextRenderer = React.memo(({
  content,
  annotations,
  onAnnotationPress,
  onSegmentLayout,
}: CustomTextRendererProps) => {
  const layoutEngine = useRef(new TextLayoutEngine());

  // Parse content into segments
  const segments = useMemo(() => {
    return parseMarkdownAndAnnotations(content);
  }, [content]);

  // Handle segment layout
  const handleLayout = useCallback((
    segmentIndex: number,
    segment: TextSegment,
    event: LayoutChangeEvent
  ) => {
    layoutEngine.current.registerSegmentLayout(segmentIndex, event, segment);
    onSegmentLayout?.(layoutEngine.current);
  }, [onSegmentLayout]);

  // Render individual segment
  const renderSegment = (segment: TextSegment, index: number) => {
    const key = `seg-${index}-${segment.type}`;

    // Get annotation data if this is an annotation segment
    const annotation = segment.markerId ? annotations.get(segment.markerId) : null;

    // Base text style
    let textStyle = styles.plainText;
    if (segment.type === 'bold') {
      textStyle = styles.boldText;
    } else if (segment.type === 'italic') {
      textStyle = styles.italicText;
    } else if (segment.type === 'header') {
      textStyle = styles.headerText;
    }

    // Annotation segment with highlight
    if (segment.type === 'annotation' && annotation) {
      return (
        <View
          key={key}
          style={styles.annotationContainer}
          onLayout={(e) => handleLayout(index, segment, e)}
        >
          <Pressable onPress={() => onAnnotationPress?.(segment.markerId!)}>
            <Text style={[textStyle, styles.highlightedText]}>
              {segment.content}
            </Text>
          </Pressable>

          {/* Inline badges */}
          {(annotation.labels.length > 0 || annotation.text_note || annotation.has_audio) && (
            <View style={styles.badgesRow}>
              {/* Label Badges */}
              {annotation.labels.map((label) => (
                <Pressable
                  key={label.id}
                  style={styles.labelBadge}
                  onPress={() => onAnnotationPress?.(segment.markerId!)}
                >
                  <Icon name="sell" size={14} color="#ff6b52" />
                  <Text style={styles.labelText}>{label.name}</Text>
                </Pressable>
              ))}

              {/* Text Note Icon */}
              {annotation.text_note && (
                <Pressable
                  style={styles.iconBadge}
                  onPress={() => onAnnotationPress?.(segment.markerId!)}
                >
                  <Icon name="edit" size={14} color="#ff6b52" />
                </Pressable>
              )}

              {/* Audio Icon */}
              {annotation.has_audio && (
                <Pressable
                  style={styles.iconBadge}
                  onPress={() => onAnnotationPress?.(segment.markerId!)}
                >
                  <Icon name="mic" size={14} color="#ff6b52" />
                </Pressable>
              )}
            </View>
          )}
        </View>
      );
    }

    // Regular text segment
    return (
      <Text
        key={key}
        style={textStyle}
        onLayout={(e) => handleLayout(index, segment, e)}
      >
        {segment.content}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.textContainer}>
        {segments.map((segment, index) => renderSegment(segment, index))}
      </Text>
    </View>
  );
});

CustomTextRenderer.displayName = 'CustomTextRenderer';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textContainer: {
    fontSize: 16,
    lineHeight: 24,
    color: '#3f3f46',
  },
  plainText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#3f3f46',
  },
  boldText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#3f3f46',
    fontWeight: '700',
  },
  italicText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#3f3f46',
    fontStyle: 'italic',
  },
  headerText: {
    fontSize: 20,
    lineHeight: 28,
    color: '#1f2937',
    fontWeight: '700',
  },
  annotationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 4,
  },
  highlightedText: {
    backgroundColor: '#FFD9D2',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginLeft: 6,
  },
  labelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFE6E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  iconBadge: {
    backgroundColor: '#FFE6E1',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

