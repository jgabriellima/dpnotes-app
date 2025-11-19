/**
 * Markdown Inline Parser
 * 
 * Parses inline markdown formatting within text blocks.
 * Handles bold, italic, code, strikethrough, and links.
 */

export interface InlineSegment {
  text: string;
  cleanText: string; // Text without markdown symbols
  styles: {
    bold?: boolean;
    italic?: boolean;
    code?: boolean;
    strikethrough?: boolean;
    link?: string;
  };
}

/**
 * Parse inline markdown formatting
 */
export function parseInlineMarkdown(text: string): InlineSegment[] {
  const segments: InlineSegment[] = [];
  
  // Find all markdown patterns with their positions
  const patterns: Array<{
    start: number;
    end: number;
    type: 'bold' | 'italic' | 'code' | 'strikethrough' | 'link';
    match: string;
    content: string;
    linkUrl?: string;
  }> = [];

  // Bold: **text** or __text__
  const boldRegex = /(\*\*|__)(.+?)\1/g;
  let match;
  while ((match = boldRegex.exec(text)) !== null) {
    patterns.push({
      start: match.index,
      end: match.index + match[0].length,
      type: 'bold',
      match: match[0],
      content: match[2],
    });
  }

  // Italic: *text* or _text_ (but not part of bold)
  const italicRegex = /(?<!\*)\*(?!\*)([^*]+?)\*(?!\*)|(?<!_)_(?!_)([^_]+?)_(?!_)/g;
  while ((match = italicRegex.exec(text)) !== null) {
    const content = match[1] || match[2];
    // Skip if this overlaps with a bold pattern
    const overlaps = patterns.some(p => 
      (match.index >= p.start && match.index < p.end) ||
      (match.index + match[0].length > p.start && match.index + match[0].length <= p.end)
    );
    if (!overlaps) {
      patterns.push({
        start: match.index,
        end: match.index + match[0].length,
        type: 'italic',
        match: match[0],
        content,
      });
    }
  }

  // Code: `text`
  const codeRegex = /`([^`]+?)`/g;
  while ((match = codeRegex.exec(text)) !== null) {
    patterns.push({
      start: match.index,
      end: match.index + match[0].length,
      type: 'code',
      match: match[0],
      content: match[1],
    });
  }

  // Strikethrough: ~~text~~
  const strikeRegex = /~~(.+?)~~/g;
  while ((match = strikeRegex.exec(text)) !== null) {
    patterns.push({
      start: match.index,
      end: match.index + match[0].length,
      type: 'strikethrough',
      match: match[0],
      content: match[1],
    });
  }

  // Links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  while ((match = linkRegex.exec(text)) !== null) {
    patterns.push({
      start: match.index,
      end: match.index + match[0].length,
      type: 'link',
      match: match[0],
      content: match[1],
      linkUrl: match[2],
    });
  }

  // Sort patterns by start position
  patterns.sort((a, b) => a.start - b.start);

  // Build segments
  let currentPos = 0;
  for (const pattern of patterns) {
    // Add plain text before this pattern
    if (pattern.start > currentPos) {
      const plainText = text.substring(currentPos, pattern.start);
      segments.push({
        text: plainText,
        cleanText: plainText,
        styles: {},
      });
    }

    // Add styled segment
    const styles: InlineSegment['styles'] = {};
    switch (pattern.type) {
      case 'bold':
        styles.bold = true;
        break;
      case 'italic':
        styles.italic = true;
        break;
      case 'code':
        styles.code = true;
        break;
      case 'strikethrough':
        styles.strikethrough = true;
        break;
      case 'link':
        styles.link = pattern.linkUrl;
        break;
    }

    segments.push({
      text: pattern.match,
      cleanText: pattern.content,
      styles,
    });

    currentPos = pattern.end;
  }

  // Add remaining plain text
  if (currentPos < text.length) {
    const plainText = text.substring(currentPos);
    segments.push({
      text: plainText,
      cleanText: plainText,
      styles: {},
    });
  }

  // If no patterns found, return the whole text as one segment
  if (segments.length === 0) {
    segments.push({
      text,
      cleanText: text,
      styles: {},
    });
  }

  return segments;
}

/**
 * Strip all markdown formatting from text
 */
export function stripMarkdownFormatting(text: string): string {
  return text
    // Bold
    .replace(/(\*\*|__)(.+?)\1/g, '$2')
    // Italic
    .replace(/(?<!\*)\*(?!\*)([^*]+?)\*(?!\*)/g, '$1')
    .replace(/(?<!_)_(?!_)([^_]+?)_(?!_)/g, '$1')
    // Code
    .replace(/`([^`]+?)`/g, '$1')
    // Strikethrough
    .replace(/~~(.+?)~~/g, '$1')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .trim();
}

/**
 * Check if a word contains markdown formatting
 */
export function hasMarkdownFormatting(word: string): boolean {
  return /(\*\*|__|(?<!\*)\*(?!\*)|(?<!_)_(?!_)|`|~~|\[.+\]\(.+\))/.test(word);
}

