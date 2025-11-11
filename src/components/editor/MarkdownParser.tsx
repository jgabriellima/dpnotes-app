/**
 * MarkdownParser
 * 
 * Parses markdown and annotation markers into renderable segments
 */

import { parseContent as parseAnnotations } from '../../utils/annotationParser';
import type { TextSegment } from './TextLayoutEngine';

/**
 * Parse text with markdown and annotation markers
 */
export function parseMarkdownAndAnnotations(content: string): TextSegment[] {
  // First, parse annotation markers
  const annotationSegments = parseAnnotations(content);
  
  const segments: TextSegment[] = [];
  let charOffset = 0;

  for (const annSegment of annotationSegments) {
    if (annSegment.type === 'annotation') {
      // Annotation segment - parse markdown within it
      const innerSegments = parseMarkdown(annSegment.content, charOffset);
      
      // Mark all inner segments as part of annotation
      innerSegments.forEach(seg => {
        segments.push({
          ...seg,
          type: 'annotation',
          markerId: annSegment.markerId,
        });
      });
      
      charOffset += annSegment.content.length;
    } else {
      // Plain text - parse markdown
      const innerSegments = parseMarkdown(annSegment.content, charOffset);
      segments.push(...innerSegments);
      charOffset += annSegment.content.length;
    }
  }

  return segments;
}

/**
 * Parse markdown syntax into segments
 */
export function parseMarkdown(text: string, startOffset: number = 0): TextSegment[] {
  const segments: TextSegment[] = [];
  let currentPos = 0;

  // Regex patterns for markdown
  const patterns = [
    // Headers: # H1, ## H2, etc (must be at start of line)
    { regex: /^(#{1,6})\s+(.+)$/gm, type: 'header' as const },
    // Bold: **text** or __text__
    { regex: /(\*\*|__)(.+?)\1/g, type: 'bold' as const },
    // Italic: *text* or _text_ (but not part of bold)
    { regex: /(?<!\*)\*(?!\*)(.+?)\*(?!\*)|(?<!_)_(?!_)(.+?)_(?!_)/g, type: 'italic' as const },
    // Lists: - item or 1. item (at start of line)
    { regex: /^(\s*)([-*]|\d+\.)\s+(.+)$/gm, type: 'list' as const },
  ];

  // For simplicity in this initial implementation, just handle plain text
  // and bold/italic inline (headers and lists can be added later)
  
  const boldPattern = /(\*\*|__)(.+?)\1/g;
  const italicPattern = /(?<!\*)\*(?!\*)([^*]+?)\*(?!\*)|(?<!_)_(?!_)([^_]+?)_(?!_)/g;

  let lastIndex = 0;
  const matches: Array<{ index: number; length: number; type: 'bold' | 'italic'; content: string }> = [];

  // Find all bold matches
  let match;
  while ((match = boldPattern.exec(text)) !== null) {
    matches.push({
      index: match.index,
      length: match[0].length,
      type: 'bold',
      content: match[2],
    });
  }

  // Find all italic matches
  boldPattern.lastIndex = 0;
  while ((match = italicPattern.exec(text)) !== null) {
    const content = match[1] || match[2];
    matches.push({
      index: match.index,
      length: match[0].length,
      type: 'italic',
      content: content,
    });
  }

  // Sort matches by position
  matches.sort((a, b) => a.index - b.index);

  // Build segments
  let textPos = 0;
  for (const m of matches) {
    // Add plain text before this match
    if (m.index > textPos) {
      const plainText = text.substring(textPos, m.index);
      segments.push({
        type: 'text',
        content: plainText,
        start: startOffset + textPos,
        end: startOffset + m.index,
      });
    }

    // Add styled segment
    segments.push({
      type: m.type,
      content: m.content,
      start: startOffset + m.index,
      end: startOffset + m.index + m.length,
    });

    textPos = m.index + m.length;
  }

  // Add remaining plain text
  if (textPos < text.length) {
    segments.push({
      type: 'text',
      content: text.substring(textPos),
      start: startOffset + textPos,
      end: startOffset + text.length,
    });
  }

  // If no segments, return the whole text as plain
  if (segments.length === 0) {
    segments.push({
      type: 'text',
      content: text,
      start: startOffset,
      end: startOffset + text.length,
    });
  }

  return segments;
}

/**
 * Strip markdown formatting from text
 */
export function stripMarkdown(text: string): string {
  return text
    .replace(/(\*\*|__)(.+?)\1/g, '$2') // Bold
    .replace(/(?<!\*)\*(?!\*)(.+?)\*(?!\*)/g, '$1') // Italic
    .replace(/(?<!_)_(?!_)(.+?)_(?!_)/g, '$1') // Italic underscore
    .replace(/^#{1,6}\s+/gm, '') // Headers
    .replace(/^(\s*)([-*]|\d+\.)\s+/gm, '$1') // Lists
    .trim();
}

