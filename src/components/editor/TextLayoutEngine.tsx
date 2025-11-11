/**
 * TextLayoutEngine
 * 
 * Tracks character positions for precise selection handling
 */

import { LayoutChangeEvent } from 'react-native';
import { CharPosition, Rect, findCharAtPoint, getSelectionRects } from '../../utils/textMeasurement';

export interface TextSegment {
  type: 'text' | 'bold' | 'italic' | 'header' | 'list' | 'annotation';
  content: string;
  level?: number; // for headers
  markerId?: string; // for annotations
  start: number; // character offset in plain text
  end: number;
}

export class TextLayoutEngine {
  private charMap: Map<number, CharPosition> = new Map();
  private segmentLayouts: Map<number, { x: number; y: number; width: number; height: number }> = new Map();
  private containerOffset: { x: number; y: number } = { x: 0, y: 0 };

  /**
   * Set container offset for absolute positioning
   */
  setContainerOffset(x: number, y: number): void {
    this.containerOffset = { x, y };
  }

  /**
   * Register layout for a text segment
   */
  registerSegmentLayout(
    segmentIndex: number,
    event: LayoutChangeEvent,
    segment: TextSegment
  ): void {
    const { x, y, width, height } = event.nativeEvent.layout;
    
    this.segmentLayouts.set(segmentIndex, { x, y, width, height });

    // Estimate character positions within this segment
    // This is approximate - real measurement would need per-character layout
    const charCount = segment.content.length;
    const charWidth = width / charCount; // Average character width

    for (let i = 0; i < charCount; i++) {
      const charIndex = segment.start + i;
      const charX = x + (i * charWidth);
      
      this.charMap.set(charIndex, {
        x: charX,
        y: y,
        width: charWidth,
        height: height,
        line: Math.floor(y / (height || 24)), // Estimate line number
        charIndex: charIndex,
      });
    }
  }

  /**
   * Get character index at point (x, y)
   */
  getCharAtPoint(x: number, y: number): number {
    const adjustedX = x - this.containerOffset.x;
    const adjustedY = y - this.containerOffset.y;
    
    return findCharAtPoint(this.charMap, adjustedX, adjustedY);
  }

  /**
   * Get selection rectangles for range
   */
  getSelectionBounds(start: number, end: number): Rect[] {
    if (start > end) {
      [start, end] = [end, start];
    }
    
    return getSelectionRects(this.charMap, start, end);
  }

  /**
   * Get character position
   */
  getCharPosition(charIndex: number): CharPosition | undefined {
    return this.charMap.get(charIndex);
  }

  /**
   * Clear all cached positions
   */
  clear(): void {
    this.charMap.clear();
    this.segmentLayouts.clear();
  }

  /**
   * Get total number of tracked characters
   */
  getCharCount(): number {
    return this.charMap.size;
  }
}

