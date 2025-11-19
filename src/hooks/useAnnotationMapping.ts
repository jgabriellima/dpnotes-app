/**
 * useAnnotationMapping Hook
 * 
 * Maps annotations to word indices for efficient lookup
 */

import React from 'react';
import type { Annotation } from '../types/editor.types';

/**
 * Extract word index from wordId (format: "p0-w123")
 */
function wordIdToIndex(wordId: string): number {
  const match = wordId.match(/w(\d+)/);
  return match ? parseInt(match[1], 10) : -1;
}

export interface UseAnnotationMappingReturn {
  // Map from word index to annotation
  wordToAnnotation: Map<number, Annotation>;
  
  // Get all annotations that intersect a block range
  getAnnotationsForBlock: (startIndex: number, endIndex: number) => Annotation[];
  
  // Get the last word index of an annotation within a block range
  getLastWordOfAnnotation: (annotation: Annotation, blockRange: [number, number]) => number | null;
  
  // Check if a word index has an annotation
  hasAnnotation: (wordIndex: number) => boolean;
  
  // Get annotation at specific word index
  getAnnotationAt: (wordIndex: number) => Annotation | undefined;
}

export function useAnnotationMapping(
  annotations: Annotation[]
): UseAnnotationMappingReturn {
  
  // Create word index to annotation map
  const wordToAnnotation = React.useMemo(() => {
    const map = new Map<number, Annotation>();
    
    annotations.forEach(annotation => {
      if (!annotation.wordIds || annotation.wordIds.length === 0) return;
      
      annotation.wordIds.forEach(wordId => {
        const wordIndex = wordIdToIndex(wordId);
        if (wordIndex >= 0) {
          map.set(wordIndex, annotation);
        }
      });
    });
    
    return map;
  }, [annotations]);
  
  // Get annotations for a specific block range
  const getAnnotationsForBlock = React.useCallback((startIndex: number, endIndex: number): Annotation[] => {
    return annotations.filter(ann => {
      if (!ann.wordIds || ann.wordIds.length === 0) return false;
      
      const annWordIndices = ann.wordIds
        .map(wordIdToIndex)
        .filter(i => i >= 0);
      
      // Check if any annotation word is in this block's range
      return annWordIndices.some(i => i >= startIndex && i <= endIndex);
    });
  }, [annotations]);
  
  // Get last word of annotation within block range
  const getLastWordOfAnnotation = React.useCallback((annotation: Annotation, blockRange: [number, number]): number | null => {
    if (!annotation.wordIds || annotation.wordIds.length === 0) return null;
    
    const [startIndex, endIndex] = blockRange;
    const wordIndices = annotation.wordIds
      .map(wordIdToIndex)
      .filter(i => i >= startIndex && i <= endIndex)
      .sort((a, b) => a - b);
    
    return wordIndices.length > 0 ? wordIndices[wordIndices.length - 1] : null;
  }, []);
  
  // Check if word has annotation
  const hasAnnotation = (wordIndex: number): boolean => {
    return wordToAnnotation.has(wordIndex);
  };
  
  // Get annotation at word index
  const getAnnotationAt = (wordIndex: number): Annotation | undefined => {
    return wordToAnnotation.get(wordIndex);
  };
  
  return {
    wordToAnnotation,
    getAnnotationsForBlock,
    getLastWordOfAnnotation,
    hasAnnotation,
    getAnnotationAt,
  };
}

