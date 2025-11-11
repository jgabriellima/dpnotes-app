/**
 * Text Measurement Utilities
 * 
 * Helper functions for text layout and character positioning
 */

export interface CharPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  line: number;
  charIndex: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Find character index at given point
 */
export function findCharAtPoint(
  charMap: Map<number, CharPosition>,
  x: number,
  y: number
): number {
  let closestIndex = 0;
  let closestDistance = Infinity;

  charMap.forEach((pos, index) => {
    // Calculate distance from point to character center
    const centerX = pos.x + pos.width / 2;
    const centerY = pos.y + pos.height / 2;
    const distance = Math.sqrt(
      Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
    );

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
}

/**
 * Get selection rectangles for multi-line selection
 */
export function getSelectionRects(
  charMap: Map<number, CharPosition>,
  startIndex: number,
  endIndex: number
): Rect[] {
  const rects: Rect[] = [];
  const lineRects = new Map<number, Rect>();

  // Group characters by line
  for (let i = startIndex; i <= endIndex; i++) {
    const pos = charMap.get(i);
    if (!pos) continue;

    const lineRect = lineRects.get(pos.line);
    if (!lineRect) {
      lineRects.set(pos.line, {
        x: pos.x,
        y: pos.y,
        width: pos.width,
        height: pos.height,
      });
    } else {
      // Extend rect to include this character
      const right = Math.max(lineRect.x + lineRect.width, pos.x + pos.width);
      const left = Math.min(lineRect.x, pos.x);
      lineRect.x = left;
      lineRect.width = right - left;
    }
  }

  // Convert to array
  lineRects.forEach(rect => rects.push(rect));
  
  return rects;
}

/**
 * Find word boundaries around character index
 */
export function findWordBoundaries(
  text: string,
  charIndex: number
): { start: number; end: number } {
  // Word boundary characters
  const boundaries = /[\s.,;:!?()[\]{}'"]/;

  let start = charIndex;
  let end = charIndex;

  // Find start of word
  while (start > 0 && !boundaries.test(text[start - 1])) {
    start--;
  }

  // Find end of word
  while (end < text.length && !boundaries.test(text[end])) {
    end++;
  }

  return { start, end };
}

/**
 * Calculate line number for character position
 */
export function calculateLine(
  y: number,
  lineHeight: number,
  baseY: number = 0
): number {
  return Math.floor((y - baseY) / lineHeight);
}

