/**
 * Markdown Block Component
 * 
 * Renders a single markdown block with word-level selection support.
 * Handles headers, paragraphs, lists, code blocks, blockquotes, and horizontal rules.
 * 
 * This component is purely presentational - it receives pre-processed data
 * and focuses only on rendering.
 */

import React from 'react';
import { View, Text, StyleSheet, LayoutRectangle } from 'react-native';
import type { MarkdownBlock as Block } from '../../utils/markdownBlockParser';
import type { Annotation } from '../../types/editor.types';
import { AnnotationMarker } from './AnnotationMarker';
import { SelectableWord } from './SelectableWord';
import { parseInlineMarkdown } from '../../utils/markdownInlineParser';
import { markdownCache } from '../../utils/markdownCache';

interface MarkdownBlockProps {
  block: Block;
  isWordSelected: (wordIndex: number) => boolean;
  wordLayoutsRef: React.MutableRefObject<Map<number, LayoutRectangle>>;
  annotationMarkers: Map<number, Annotation>; // Pre-computed: wordIndex -> Annotation
  onAnnotationPress?: (annotation: Annotation) => void;
  onWordTouchStart: (wordIndex: number) => void;
  onWordTouchMove: (wordIndex: number) => void;
  onWordTouchEnd: () => void;
}

export const MarkdownBlock = React.memo(function MarkdownBlock({
  block,
  isWordSelected,
  wordLayoutsRef,
  annotationMarkers,
  onAnnotationPress,
  onWordTouchStart,
  onWordTouchMove,
  onWordTouchEnd,
}: MarkdownBlockProps) {

  const handleWordLayout = (wordIndex: number, layout: LayoutRectangle) => {
    wordLayoutsRef.current.set(wordIndex, layout);
  };

  // Render words with inline markdown support
  const renderWords = () => {
    const elements: JSX.Element[] = [];
    
    for (let i = 0; i < block.words.length; i++) {
      const globalIndex = block.startWordIndex + i;
      const word = block.words[i];
      
      // Check if this word has an annotation marker
      const annotation = annotationMarkers.get(globalIndex);
      const showAnnotationMarker = annotation !== undefined;

      // Parse inline markdown for this word (CACHED)
      const inlineSegments = markdownCache.get(word);
      const cleanWord = inlineSegments.map(s => s.cleanText).join('');
      
      // Determine styling from inline markdown
      const wordStyles: any[] = [styles.word];
      inlineSegments.forEach(segment => {
        if (segment.styles.bold) wordStyles.push(styles.bold);
        if (segment.styles.italic) wordStyles.push(styles.italic);
        if (segment.styles.code) wordStyles.push(styles.inlineCode);
        if (segment.styles.strikethrough) wordStyles.push(styles.strikethrough);
      });
      
      // Check if word is selected
      const selected = isWordSelected(globalIndex);
      
      // Log first selected word of each block for debugging
      if (selected && i === 0) {
        console.log(`🔵 Block ${block.startWordIndex}: First word "${cleanWord}" is SELECTED`);
      }
      
      // Render selectable word
      const wordElement = (
        <SelectableWord
          key={`word-${globalIndex}`}
          word={cleanWord}
          wordIndex={globalIndex}
          isSelected={selected}
          onLayout={handleWordLayout}
          onTouchStart={onWordTouchStart}
          onTouchMove={onWordTouchMove}
          onTouchEnd={onWordTouchEnd}
          style={wordStyles}
        />
      );
      
      elements.push(wordElement);
      
      // Add space after word (except last word)
      if (i < block.words.length - 1) {
        elements.push(
          <Text key={`space-${globalIndex}`} style={styles.space}> </Text>
        );
      }
      
      // Add annotation marker if present at this position
      if (showAnnotationMarker && annotation) {
        elements.push(
          <AnnotationMarker
            key={`ann-${globalIndex}`}
            annotation={annotation}
            text=""
            onPress={() => onAnnotationPress?.(annotation)}
          />
        );
      }
    }
    
    return elements;
  };
  
  // Memoize rendered words to avoid re-parsing on selection changes
  const wordElements = React.useMemo(() => renderWords(), [
    block.words,
    block.startWordIndex,
    annotationMarkers,
    onAnnotationPress
  ]);

  // Render based on block type
  switch (block.type) {
    case 'header':
      const headerLevel = block.level || 1;
      const headerStyle = [
        styles.blockContainer,
        styles.headerContainer,
        styles[`header${headerLevel}` as keyof typeof styles],
      ];
      return (
        <View style={headerStyle}>
          {wordElements}
        </View>
      );

    case 'paragraph':
      return (
        <View style={[styles.blockContainer, styles.paragraphContainer]}>
          {wordElements}
        </View>
      );

    case 'list':
      const bullet = block.ordered ? '•' : '•';
      const indentation = (block.level || 0) * 16;
      return (
        <View style={[styles.blockContainer, styles.listContainer, { marginLeft: indentation }]}>
          <Text style={styles.listBullet}>{bullet}</Text>
          <View style={styles.listContent}>
            {wordElements}
          </View>
        </View>
      );

    case 'code':
      return (
        <View style={[styles.blockContainer, styles.codeBlockContainer]}>
          <View style={styles.codeBlock}>
            {wordElements}
          </View>
        </View>
      );

    case 'blockquote':
      return (
        <View style={[styles.blockContainer, styles.blockquoteContainer]}>
          <View style={styles.blockquote}>
            {wordElements}
          </View>
        </View>
      );

    case 'hr':
      return (
        <View style={[styles.blockContainer, styles.hrContainer]}>
          <View style={styles.hr} />
        </View>
      );

    default:
      return (
        <View style={[styles.blockContainer, styles.paragraphContainer]}>
          {wordElements}
        </View>
      );
  }
}, (prev, next) => {
  // OTIMIZAÇÃO: Só re-renderizar se:
  // 1. Bloco mudou (nunca muda após parse)
  // 2. Annotations mudaram (map reference)
  // 3. Handlers mudaram (devem ser estáveis)
  return (
    prev.block.startWordIndex === next.block.startWordIndex &&
    prev.annotationMarkers === next.annotationMarkers
  );
  // Nota: isWordSelected é uma função, mas ela consulta o manager
  // O manager notifica mudanças via listeners, então isso funciona
});

const styles = StyleSheet.create({
  blockContainer: {
    width: '100%',
    marginBottom: 12,
  },
  
  // Word-level styles
  word: {
    fontSize: 17,
    lineHeight: 26,
    color: '#1f2937',
  },
  bold: {
    fontWeight: '700',
  },
  italic: {
    fontStyle: 'italic',
  },
  inlineCode: {
    fontFamily: 'monospace',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 15,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  space: {
    fontSize: 17,
    lineHeight: 26,
  },
  
  // Headers
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  header1: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    color: '#111827',
  },
  header2: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
    color: '#111827',
  },
  header3: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    color: '#111827',
  },
  header4: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '700',
    color: '#374151',
  },
  header5: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '700',
    color: '#374151',
  },
  header6: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: '#6b7280',
  },
  
  // Paragraph
  paragraphContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  
  // List
  listContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  listBullet: {
    fontSize: 17,
    lineHeight: 26,
    marginRight: 8,
    color: '#1f2937',
    fontWeight: '600',
  },
  listContent: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  
  // Code block
  codeBlockContainer: {
    marginVertical: 8,
  },
  codeBlock: {
    backgroundColor: '#1f2937',
    padding: 12,
    borderRadius: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  
  // Blockquote
  blockquoteContainer: {
    marginVertical: 8,
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: '#d1d5db',
    paddingLeft: 12,
    paddingVertical: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  
  // Horizontal rule
  hrContainer: {
    marginVertical: 16,
  },
  hr: {
    height: 1,
    backgroundColor: '#e5e7eb',
    width: '100%',
  },
});

