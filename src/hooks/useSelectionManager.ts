/**
 * useSelectionManager Hook
 * 
 * Hook React para usar o SelectionManager
 * Fornece estado reativo e callbacks
 */

import { useEffect, useState, useMemo, useCallback } from 'react';
import { SelectionManager } from '../managers/SelectionManager';

export function useSelectionManager(words: string[]) {
  // Criar manager uma única vez
  const manager = useMemo(() => new SelectionManager(), []);
  
  // Estado local para forçar re-renders - USA CONTADOR!
  const [updateCounter, setUpdateCounter] = useState(0);
  
  // Subscribe to manager changes
  useEffect(() => {
    console.log('🔗 Subscribing to SelectionManager');
    const unsubscribe = manager.addListener(() => {
      console.log('🔔 SelectionManager notified change, forcing re-render');
      setUpdateCounter(prev => prev + 1);  // ← FORÇA RE-RENDER REAL!
    });
    
    return () => {
      console.log('🔌 Unsubscribing from SelectionManager');
      unsubscribe();
    };
  }, [manager]);
  
  // Callbacks
  const startSelection = useCallback((wordIndex: number) => {
    manager.startSelection(wordIndex);
  }, [manager]);
  
  const extendSelection = useCallback((wordIndex: number) => {
    manager.extendSelection(wordIndex);
  }, [manager]);
  
  const endSelection = useCallback(() => {
    manager.endSelection();
  }, [manager]);
  
  const clearSelection = useCallback(() => {
    manager.clearSelection();
  }, [manager]);
  
  const isWordSelected = useCallback((wordIndex: number) => {
    const selected = manager.isWordSelected(wordIndex);
    // Log apenas ocasionalmente para não poluir
    if (wordIndex % 50 === 0 && selected) {
      console.log(`🔍 isWordSelected(${wordIndex}) = ${selected}`);
    }
    return selected;
  }, [manager]);
  
  const getSelectedText = useCallback(() => {
    const indices = manager.getSelectedIndices();
    return indices.map(i => words[i]).join(' ');
  }, [manager, words]);
  
  const getSelectedIndices = useCallback(() => {
    return manager.getSelectedIndices();
  }, [manager]);
  
  return {
    selectedIndices: manager.getSelectedIndices(),
    selectionSize: manager.getSelectionSize(),
    isSelecting: manager.getIsSelecting(),
    startSelection,
    extendSelection,
    endSelection,
    clearSelection,
    isWordSelected,
    getSelectedText,
    getSelectedIndices,
  };
}

