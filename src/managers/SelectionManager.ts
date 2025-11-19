/**
 * SelectionManager - Fonte única da verdade para seleção de texto
 * 
 * Gerencia estado de seleção de forma centralizada
 * Não lida com coordenadas - apenas com índices de palavras
 * As palavras são diretamente tocáveis
 */

export class SelectionManager {
  private selectedIndices: Set<number> = new Set();
  private anchorIndex: number | null = null;
  private isSelecting: boolean = false;
  private listeners: Set<() => void> = new Set();

  /**
   * Inicia seleção em uma palavra
   */
  startSelection(wordIndex: number): void {
    console.log('🟢 START selection at:', wordIndex);
    this.isSelecting = true;
    this.anchorIndex = wordIndex;
    this.selectedIndices = new Set([wordIndex]);
    this.notifyListeners();
  }

  /**
   * Estende seleção até uma palavra
   */
  extendSelection(wordIndex: number): void {
    if (!this.isSelecting || this.anchorIndex === null) return;
    
    // Criar range do anchor até a palavra atual
    const start = Math.min(this.anchorIndex, wordIndex);
    const end = Math.max(this.anchorIndex, wordIndex);
    
    // Otimização: só notificar se a seleção realmente mudou
    const newSize = end - start + 1;
    if (this.selectedIndices.size === newSize) {
      // Verificar se é o mesmo range
      let isSameRange = true;
      for (let i = start; i <= end; i++) {
        if (!this.selectedIndices.has(i)) {
          isSameRange = false;
          break;
        }
      }
      if (isSameRange) return; // Sem mudanças, não notificar
    }
    
    this.selectedIndices.clear();
    for (let i = start; i <= end; i++) {
      this.selectedIndices.add(i);
    }
    
    console.log('🔵 EXTEND selection:', start, '->', end, `(${this.selectedIndices.size} words)`);
    console.log('🔵 Selected indices:', Array.from(this.selectedIndices).slice(0, 10), '...');
    this.notifyListeners();
  }

  /**
   * Finaliza seleção
   */
  endSelection(): void {
    console.log('🔴 END selection. Total:', this.selectedIndices.size, 'words');
    this.isSelecting = false;
  }

  /**
   * Limpa seleção
   */
  clearSelection(): void {
    this.selectedIndices.clear();
    this.anchorIndex = null;
    this.isSelecting = false;
    this.notifyListeners();
  }

  /**
   * Verifica se uma palavra está selecionada
   */
  isWordSelected(wordIndex: number): boolean {
    return this.selectedIndices.has(wordIndex);
  }

  /**
   * Retorna índices selecionados
   */
  getSelectedIndices(): number[] {
    return Array.from(this.selectedIndices).sort((a, b) => a - b);
  }

  /**
   * Retorna quantidade de palavras selecionadas
   */
  getSelectionSize(): number {
    return this.selectedIndices.size;
  }

  /**
   * Verifica se está em processo de seleção
   */
  getIsSelecting(): boolean {
    return this.isSelecting;
  }

  /**
   * Adiciona listener para mudanças
   */
  addListener(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notifica listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

