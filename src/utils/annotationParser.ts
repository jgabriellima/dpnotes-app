/**
 * Annotation Parser Utility
 * 
 * Utilities for parsing and manipulating inline annotation markers in document content.
 * Marker format: [[ann:markerId]]text[[/ann]]
 */

// Marker regex: [[ann:a1]]text[[/ann]]
const MARKER_REGEX = /\[\[ann:([a-zA-Z0-9]+)\]\](.*?)\[\[\/ann\]\]/gs;

export interface Segment {
  type: 'text' | 'annotation';
  content: string;
  markerId?: string;
}

/**
 * Parse content into segments (text and annotation segments)
 * 
 * @param content - Document content with inline markers
 * @returns Array of segments
 * 
 * @example
 * const segments = parseContent("Normal text [[ann:a1]]highlighted[[/ann]] more text");
 * // Returns: [
 * //   { type: 'text', content: 'Normal text ' },
 * //   { type: 'annotation', content: 'highlighted', markerId: 'a1' },
 * //   { type: 'text', content: ' more text' }
 * // ]
 */
export function parseContent(content: string): Segment[] {
  if (!content) {
    return [];
  }

  const segments: Segment[] = [];
  let lastIndex = 0;

  try {
    // Validate markers first (only log critical errors)
    const validation = validateMarkers(content);
    if (!validation.valid && validation.errors.length > 0) {
      // Only log if there are critical mismatches (not nested markers)
      const criticalErrors = validation.errors.filter(e => e.includes('Mismatched'));
      if (criticalErrors.length > 0) {
        console.warn('[AnnotationParser] Invalid markers detected:', criticalErrors);
      }
    }

    // Create a new regex instance for iteration
    const regex = new RegExp(MARKER_REGEX.source, MARKER_REGEX.flags);
    let match;
    let iterationCount = 0;
    const MAX_ITERATIONS = 1000; // Prevent infinite loops

    while ((match = regex.exec(content)) !== null) {
      iterationCount++;
      if (iterationCount > MAX_ITERATIONS) {
        console.error('[AnnotationParser] Max iterations reached, stopping parse');
        break;
      }

      // Add plain text before the annotation
      if (match.index > lastIndex) {
        const plainText = content.substring(lastIndex, match.index);
        if (plainText) {
          segments.push({
            type: 'text',
            content: plainText,
          });
        }
      }

      // Validate matched content
      const markerId = match[1];
      const annotationText = match[2];

      if (!markerId || !annotationText) {
        console.warn('[AnnotationParser] Empty marker or content, skipping');
        lastIndex = regex.lastIndex;
        continue;
      }

      // Add annotation segment
      segments.push({
        type: 'annotation',
        content: annotationText,
        markerId: markerId,
      });

      lastIndex = regex.lastIndex;
    }

    // Add remaining plain text after the last annotation
    if (lastIndex < content.length) {
      const plainText = content.substring(lastIndex);
      if (plainText) {
        segments.push({
          type: 'text',
          content: plainText,
        });
      }
    }

    // If no segments were created, return the whole content as plain text
    if (segments.length === 0) {
      segments.push({
        type: 'text',
        content: content,
      });
    }

    return segments;
  } catch (error) {
    console.error('[AnnotationParser] Error parsing content:', error);
    // Return content as plain text on error
    return [{
      type: 'text',
      content: content,
    }];
  }
}

/**
 * Insert annotation marker at specified text selection
 * 
 * @param content - Original content
 * @param start - Start position (character offset)
 * @param end - End position (character offset)
 * @param markerId - Unique marker ID
 * @returns Updated content with marker inserted
 * 
 * @example
 * const newContent = insertAnnotation("Hello world", 0, 5, "a1");
 * // Returns: "[[ann:a1]]Hello[[/ann]] world"
 */
export function insertAnnotation(
  content: string,
  start: number,
  end: number,
  markerId: string
): string {
  const before = content.substring(0, start);
  const selected = content.substring(start, end);
  const after = content.substring(end);

  return `${before}[[ann:${markerId}]]${selected}[[/ann]]${after}`;
}

/**
 * Remove annotation marker from content
 * 
 * @param content - Content with markers
 * @param markerId - Marker ID to remove
 * @returns Content with specified marker removed
 * 
 * @example
 * const newContent = removeAnnotation("Text [[ann:a1]]highlighted[[/ann]] text", "a1");
 * // Returns: "Text highlighted text"
 */
export function removeAnnotation(content: string, markerId: string): string {
  // Create regex for specific marker
  const regex = new RegExp(`\\[\\[ann:${markerId}\\]\\](.*?)\\[\\[/ann\\]\\]`, 'g');
  return content.replace(regex, '$1');
}

/**
 * Extract all marker IDs from content
 * 
 * @param content - Content with markers
 * @returns Array of unique marker IDs
 * 
 * @example
 * const ids = extractMarkerIds("[[ann:a1]]text1[[/ann]] and [[ann:a2]]text2[[/ann]]");
 * // Returns: ['a1', 'a2']
 */
export function extractMarkerIds(content: string): string[] {
  const markerIds: string[] = [];
  const regex = new RegExp(MARKER_REGEX.source, MARKER_REGEX.flags);
  let match;

  while ((match = regex.exec(content)) !== null) {
    markerIds.push(match[1]);
  }

  return [...new Set(markerIds)]; // Remove duplicates
}

/**
 * Generate short unique marker ID
 * Uses a simple incremental approach with letter prefix
 * 
 * @param existingIds - Array of existing marker IDs to avoid collisions
 * @returns New unique marker ID
 * 
 * @example
 * const newId = generateMarkerId(['a1', 'a2']);
 * // Returns: 'a3'
 */
export function generateMarkerId(existingIds: string[] = []): string {
  const prefix = 'a';
  let counter = 1;

  // Find the highest existing number
  existingIds.forEach(id => {
    if (id.startsWith(prefix)) {
      const num = parseInt(id.substring(prefix.length), 10);
      if (!isNaN(num) && num >= counter) {
        counter = num + 1;
      }
    }
  });

  return `${prefix}${counter}`;
}

/**
 * Strip all markers from content (for preview or plain text export)
 * 
 * @param content - Content with markers
 * @returns Plain text without markers
 * 
 * @example
 * const plain = stripMarkers("Text [[ann:a1]]highlighted[[/ann]] text");
 * // Returns: "Text highlighted text"
 */
export function stripMarkers(content: string): string {
  if (!content) return '';
  
  try {
    // Remove complete markers
    let result = content.replace(MARKER_REGEX, '$2');
    
    // Also remove any malformed partial markers
    result = result.replace(/\[\[ann:[a-zA-Z0-9]*\]\]/g, '');
    result = result.replace(/\[\[\/ann\]\]/g, '');
    
    return result;
  } catch (error) {
    console.error('[AnnotationParser] Error stripping markers:', error);
    return content;
  }
}

/**
 * Count total annotations in content
 * 
 * @param content - Content with markers
 * @returns Number of annotations
 */
export function countAnnotations(content: string): number {
  return extractMarkerIds(content).length;
}

/**
 * Get text content of a specific annotation
 * 
 * @param content - Content with markers
 * @param markerId - Marker ID to find
 * @returns Text content of the annotation, or null if not found
 */
export function getAnnotationText(content: string, markerId: string): string | null {
  const regex = new RegExp(`\\[\\[ann:${markerId}\\]\\](.*?)\\[\\[/ann\\]\\]`, 'g');
  const match = regex.exec(content);
  return match ? match[1] : null;
}

/**
 * Validate if content has well-formed markers
 * 
 * @param content - Content to validate
 * @returns Object with validation result and errors
 */
export function validateMarkers(content: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for unclosed markers
  const openCount = (content.match(/\[\[ann:[a-zA-Z0-9]+\]\]/g) || []).length;
  const closeCount = (content.match(/\[\[\/ann\]\]/g) || []).length;

  if (openCount !== closeCount) {
    errors.push(`Mismatched markers: ${openCount} opening, ${closeCount} closing`);
  }

  // Check for nested markers (not supported in simple implementation)
  const regex = new RegExp(MARKER_REGEX.source, MARKER_REGEX.flags);
  let match;
  while ((match = regex.exec(content)) !== null) {
    const innerText = match[2];
    if (innerText.includes('[[ann:')) {
      errors.push(`Nested markers detected at position ${match.index}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

