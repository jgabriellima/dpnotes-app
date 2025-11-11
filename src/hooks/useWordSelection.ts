/**
 * useWordSelection Hook
 * 
 * Manages word selection logic
 */

import { useState, useCallback } from 'react';
import type { WordId } from '../types/editor.types';

export function useWordSelection() {
  const [selectedWords, setSelectedWords] = useState<Set<WordId>>(new Set());
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  const toggleWord = useCallback((wordId: WordId) => {
    setSelectedWords(prev => {
      const next = new Set(prev);
      if (next.has(wordId)) {
        next.delete(wordId);
      } else {
        next.add(wordId);
      }
      return next;
    });
  }, []);

  const addWord = useCallback((wordId: WordId) => {
    setSelectedWords(prev => {
      const next = new Set(prev);
      next.add(wordId);
      return next;
    });
  }, []);

  const removeWord = useCallback((wordId: WordId) => {
    setSelectedWords(prev => {
      const next = new Set(prev);
      next.delete(wordId);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedWords(new Set());
    setIsMultiSelectMode(false);
  }, []);

  const startMultiSelect = useCallback((wordId: WordId) => {
    setIsMultiSelectMode(true);
    setSelectedWords(new Set([wordId]));
  }, []);

  const addWordRange = useCallback((startId: WordId, endId: WordId, allWords: WordId[]) => {
    const startIndex = allWords.indexOf(startId);
    const endIndex = allWords.indexOf(endId);
    
    if (startIndex === -1 || endIndex === -1) return;
    
    const minIndex = Math.min(startIndex, endIndex);
    const maxIndex = Math.max(startIndex, endIndex);
    
    setSelectedWords(prev => {
      const next = new Set(prev);
      for (let i = minIndex; i <= maxIndex; i++) {
        next.add(allWords[i]);
      }
      return next;
    });
  }, []);

  return {
    selectedWords,
    isMultiSelectMode,
    toggleWord,
    addWord,
    removeWord,
    clearSelection,
    startMultiSelect,
    addWordRange,
  };
}

