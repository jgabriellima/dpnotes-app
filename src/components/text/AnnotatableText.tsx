/**
 * Annotatable Text Component
 * 
 * Elegant component for displaying text with sentence-level annotations.
 * Handles markdown rendering and annotation badges.
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Badge, IconBadge } from '../ui/Badge';
import { Icon } from '../ui/Icon';
import { cn } from '../../utils/cn';

interface Annotation {
  id: string;
  sentenceIndex: number;
  labels: Array<{ id: string; name: string; color: string }>;
  textNote: string | null;
  hasAudio: boolean;
}

interface AnnotatableTextProps {
  content: string;
  sentences: string[];
  annotations: Annotation[];
  selectedSentenceIndex: number | null;
  onSentencePress: (index: number, sentence: string) => void;
  className?: string;
}

export const AnnotatableText: React.FC<AnnotatableTextProps> = ({
  content,
  sentences,
  annotations,
  selectedSentenceIndex,
  onSentencePress,
  className,
}) => {
  // Create a map of sentence index to annotations for quick lookup
  const annotationMap = React.useMemo(() => {
    const map = new Map<number, Annotation>();
    annotations.forEach(ann => {
      map.set(ann.sentenceIndex, ann);
    });
    return map;
  }, [annotations]);

  const renderSentence = (sentence: string, index: number) => {
    const annotation = annotationMap.get(index);
    const isSelected = selectedSentenceIndex === index;

    return (
      <View key={index} className="mb-4">
        <Pressable
          onPress={() => onSentencePress(index, sentence)}
          className={cn(
            'p-2 rounded',
            isSelected && 'bg-highlight',
            annotation && 'border-l-2 border-primary pl-3'
          )}
        >
          <Text className="text-text-primary text-base leading-relaxed">
            {sentence}
          </Text>

          {/* Annotation Badges */}
          {annotation && (
            <View className="flex flex-row flex-wrap gap-2 mt-2">
              {/* Label Badges */}
              {annotation.labels.map(label => (
                <Badge
                  key={label.id}
                  icon={<Icon name="sell" size={14} color="#ff6b52" />}
                >
                  {label.name}
                </Badge>
              ))}

              {/* Text Note Badge */}
              {annotation.textNote && (
                <IconBadge icon={<Icon name="note" size={14} color="#ff6b52" />} />
              )}

              {/* Audio Badge */}
              {annotation.hasAudio && (
                <IconBadge icon={<Icon name="mic" size={14} color="#ff6b52" />} />
              )}
            </View>
          )}
        </Pressable>
      </View>
    );
  };

  return (
    <View className={cn('flex flex-col', className)}>
      {sentences.map((sentence, index) => renderSentence(sentence, index))}
    </View>
  );
};

export default AnnotatableText;

