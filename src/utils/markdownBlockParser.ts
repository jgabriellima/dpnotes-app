/**
 * Markdown Block Parser
 * 
 * Parses markdown text into blocks while maintaining global word indices
 * for cross-block selection and annotations.
 */

export interface MarkdownBlock {
  type: 'header' | 'paragraph' | 'list' | 'code' | 'blockquote' | 'hr';
  level?: number; // For headers (1-6) and lists (indentation level)
  content: string; // Raw content of the block
  words: string[]; // Words in this block
  startWordIndex: number; // Global index of first word
  endWordIndex: number; // Global index of last word
  ordered?: boolean; // For ordered lists (1. 2. 3.)
  language?: string; // For code blocks (```javascript)
}

/**
 * Parse markdown content into blocks
 */
export function parseMarkdownBlocks(content: string): MarkdownBlock[] {
  if (!content || content.trim().length === 0) {
    return [];
  }

  const lines = content.split('\n');
  const blocks: MarkdownBlock[] = [];
  let currentWordIndex = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    
    // Skip empty lines (they separate blocks)
    if (line.trim().length === 0) {
      i++;
      continue;
    }

    // Check for code block
    if (line.trim().startsWith('```')) {
      const codeBlock = parseCodeBlock(lines, i, currentWordIndex);
      blocks.push(codeBlock);
      currentWordIndex = codeBlock.endWordIndex + 1;
      i = findCodeBlockEnd(lines, i) + 1;
      continue;
    }

    // Check for header
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      const block = parseHeader(line, headerMatch, currentWordIndex);
      blocks.push(block);
      currentWordIndex = block.endWordIndex + 1;
      i++;
      continue;
    }

    // Check for horizontal rule
    if (line.match(/^[-*_]{3,}$/)) {
      const block: MarkdownBlock = {
        type: 'hr',
        content: line,
        words: [],
        startWordIndex: currentWordIndex,
        endWordIndex: currentWordIndex - 1, // No words in HR
      };
      blocks.push(block);
      i++;
      continue;
    }

    // Check for blockquote
    if (line.trim().startsWith('>')) {
      const blockquoteBlock = parseBlockquote(lines, i, currentWordIndex);
      blocks.push(blockquoteBlock);
      currentWordIndex = blockquoteBlock.endWordIndex + 1;
      i = findBlockquoteEnd(lines, i) + 1;
      continue;
    }

    // Check for list item
    const listMatch = line.match(/^(\s*)([-*]|\d+\.)\s+(.+)$/);
    if (listMatch) {
      const block = parseListItem(line, listMatch, currentWordIndex);
      blocks.push(block);
      currentWordIndex = block.endWordIndex + 1;
      i++;
      continue;
    }

    // Default: paragraph
    // Collect consecutive non-empty lines as one paragraph
    const paragraphLines: string[] = [];
    while (i < lines.length && lines[i].trim().length > 0 && 
           !lines[i].match(/^(#{1,6}\s+|[-*_]{3,}$|>\s+|(\s*)([-*]|\d+\.)\s+|```)/) ) {
      paragraphLines.push(lines[i]);
      i++;
    }
    
    if (paragraphLines.length > 0) {
      const block = parseParagraph(paragraphLines.join(' '), currentWordIndex);
      blocks.push(block);
      currentWordIndex = block.endWordIndex + 1;
    }
  }

  return blocks;
}

/**
 * Parse a header line
 */
function parseHeader(line: string, match: RegExpMatchArray, startWordIndex: number): MarkdownBlock {
  const level = match[1].length;
  const content = match[2];
  const words = content.split(/\s+/).filter(w => w.length > 0);
  
  return {
    type: 'header',
    level,
    content,
    words,
    startWordIndex,
    endWordIndex: startWordIndex + words.length - 1,
  };
}

/**
 * Parse a paragraph
 */
function parseParagraph(content: string, startWordIndex: number): MarkdownBlock {
  const words = content.split(/\s+/).filter(w => w.length > 0);
  
  return {
    type: 'paragraph',
    content,
    words,
    startWordIndex,
    endWordIndex: startWordIndex + words.length - 1,
  };
}

/**
 * Parse a list item
 */
function parseListItem(line: string, match: RegExpMatchArray, startWordIndex: number): MarkdownBlock {
  const indentation = match[1].length;
  const marker = match[2];
  const content = match[3];
  const words = content.split(/\s+/).filter(w => w.length > 0);
  const ordered = /^\d+\.$/.test(marker);
  
  return {
    type: 'list',
    level: Math.floor(indentation / 2), // 2 spaces = 1 level
    ordered,
    content,
    words,
    startWordIndex,
    endWordIndex: startWordIndex + words.length - 1,
  };
}

/**
 * Parse a code block
 */
function parseCodeBlock(lines: string[], startIndex: number, startWordIndex: number): MarkdownBlock {
  const firstLine = lines[startIndex].trim();
  const language = firstLine.substring(3).trim() || undefined;
  
  const codeLines: string[] = [];
  let i = startIndex + 1;
  
  while (i < lines.length && !lines[i].trim().startsWith('```')) {
    codeLines.push(lines[i]);
    i++;
  }
  
  const content = codeLines.join('\n');
  const words = content.split(/\s+/).filter(w => w.length > 0);
  
  return {
    type: 'code',
    language,
    content,
    words,
    startWordIndex,
    endWordIndex: startWordIndex + words.length - 1,
  };
}

/**
 * Find the end of a code block
 */
function findCodeBlockEnd(lines: string[], startIndex: number): number {
  for (let i = startIndex + 1; i < lines.length; i++) {
    if (lines[i].trim().startsWith('```')) {
      return i;
    }
  }
  return lines.length - 1;
}

/**
 * Parse a blockquote
 */
function parseBlockquote(lines: string[], startIndex: number, startWordIndex: number): MarkdownBlock {
  const quoteLines: string[] = [];
  let i = startIndex;
  
  while (i < lines.length && lines[i].trim().startsWith('>')) {
    const line = lines[i].trim().substring(1).trim();
    if (line.length > 0) {
      quoteLines.push(line);
    }
    i++;
  }
  
  const content = quoteLines.join(' ');
  const words = content.split(/\s+/).filter(w => w.length > 0);
  
  return {
    type: 'blockquote',
    content,
    words,
    startWordIndex,
    endWordIndex: startWordIndex + words.length - 1,
  };
}

/**
 * Find the end of a blockquote
 */
function findBlockquoteEnd(lines: string[], startIndex: number): number {
  for (let i = startIndex; i < lines.length; i++) {
    if (!lines[i].trim().startsWith('>')) {
      return i - 1;
    }
  }
  return lines.length - 1;
}

/**
 * Extract word index from wordId (format: "p0-w123")
 */
export function extractWordIndex(wordId: string): number {
  const match = wordId.match(/w(\d+)/);
  return match ? parseInt(match[1], 10) : -1;
}

