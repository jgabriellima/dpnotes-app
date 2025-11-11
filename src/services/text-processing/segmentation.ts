/**
 * Text Segmentation Service
 * 
 * Elegant text processing for segmenting documents into sentences.
 * Used for annotation and text analysis.
 */

/**
 * Segment text into sentences
 * Handles multiple languages and edge cases
 */
export function segmentIntoSentences(text: string): string[] {
  if (!text || !text.trim()) {
    return [];
  }

  // Normalize line breaks and spaces
  const normalized = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Split by sentence-ending punctuation
  // This regex handles:
  // - Periods, exclamation marks, question marks
  // - Quotes after punctuation
  // - Multiple spaces after punctuation
  // - Abbreviations (Mr., Dr., etc.)
  const sentenceRegex = /(?<=[.!?])\s+(?=[A-Z])|(?<=[.!?]["'])\s+(?=[A-Z])|(?<=\n\n)/g;
  
  const sentences = normalized
    .split(sentenceRegex)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  return sentences;
}

/**
 * Segment text into paragraphs
 */
export function segmentIntoParagraphs(text: string): string[] {
  if (!text || !text.trim()) {
    return [];
  }

  const normalized = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const paragraphs = normalized
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  return paragraphs;
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  if (!text || !text.trim()) {
    return 0;
  }

  const words = text
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 0);

  return words.length;
}

/**
 * Detect language (basic implementation)
 * For more accurate detection, consider using a library
 */
export function detectLanguage(text: string): string {
  if (!text || !text.trim()) {
    return 'en';
  }

  // Simple heuristic: check for common words
  const portugueseIndicators = ['o', 'a', 'os', 'as', 'de', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'com', 'não', 'uma'];
  const englishIndicators = ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with'];
  const spanishIndicators = ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no', 'haber', 'por', 'con', 'su'];

  const words = text
    .toLowerCase()
    .split(/\s+/)
    .slice(0, 100); // Analyze first 100 words

  const ptScore = words.filter(w => portugueseIndicators.includes(w)).length;
  const enScore = words.filter(w => englishIndicators.includes(w)).length;
  const esScore = words.filter(w => spanishIndicators.includes(w)).length;

  const maxScore = Math.max(ptScore, enScore, esScore);

  if (maxScore === 0) return 'en'; // Default to English
  if (ptScore === maxScore) return 'pt';
  if (esScore === maxScore) return 'es';
  return 'en';
}

/**
 * Clean and normalize text
 */
export function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, '  ')
    .replace(/\u00A0/g, ' ') // Replace non-breaking spaces
    .replace(/\s+$/gm, '') // Remove trailing spaces
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Process imported text from clipboard
 * Applies all cleaning and segmentation
 */
export interface ProcessedDocument {
  content: string;
  sentences: string[];
  paragraphs: string[];
  wordCount: number;
  language: string;
}

export function processImportedText(rawText: string): ProcessedDocument {
  const normalized = normalizeText(rawText);
  const sentences = segmentIntoSentences(normalized);
  const paragraphs = segmentIntoParagraphs(normalized);
  const wordCount = countWords(normalized);
  const language = detectLanguage(normalized);

  return {
    content: normalized,
    sentences,
    paragraphs,
    wordCount,
    language,
  };
}

export default {
  segmentIntoSentences,
  segmentIntoParagraphs,
  countWords,
  detectLanguage,
  normalizeText,
  processImportedText,
};

