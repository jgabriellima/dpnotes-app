/**
 * Markdown Parsing Cache
 * 
 * Cache global para evitar re-parsing de markdown inline
 * Palavras são imutáveis, então cache permanente é seguro
 */

import { parseInlineMarkdown, type InlineSegment } from './markdownInlineParser';

class MarkdownCache {
  private cache = new Map<string, InlineSegment[]>();
  
  get(word: string): InlineSegment[] {
    if (!this.cache.has(word)) {
      this.cache.set(word, parseInlineMarkdown(word));
    }
    return this.cache.get(word)!;
  }
  
  clear() {
    this.cache.clear();
  }
  
  size() {
    return this.cache.size;
  }
}

export const markdownCache = new MarkdownCache();

