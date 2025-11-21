/**
 * Utility to inject annotation markers into HTML content
 * Wraps annotated text segments with styled spans and icons
 */

import type { Annotation } from '../types/editor.types';

// Annotation type colors and icons - Light Mode
const ANNOTATION_STYLES_LIGHT = {
  text: {
    color: '#FEF3C7', // Yellow
    borderColor: '#F59E0B',
    icon: '📝',
  },
  audio: {
    color: '#DBEAFE', // Blue
    borderColor: '#3B82F6',
    icon: '🎤',
  },
  tags: {
    color: '#D1FAE5', // Green
    borderColor: '#10B981',
    icon: '🏷️',
  },
};

// Annotation type colors and icons - Dark Mode (higher contrast)
const ANNOTATION_STYLES_DARK = {
  text: {
    color: '#92400E', // Dark yellow/amber
    borderColor: '#FBBF24',
    icon: '📝',
  },
  audio: {
    color: '#1E3A8A', // Dark blue
    borderColor: '#60A5FA',
    icon: '🎤',
  },
  tags: {
    color: '#065F46', // Dark green
    borderColor: '#34D399',
    icon: '🏷️',
  },
};

/**
 * Get annotation styles based on theme
 */
function getAnnotationStylesByTheme(theme: 'light' | 'dark') {
  return theme === 'dark' ? ANNOTATION_STYLES_DARK : ANNOTATION_STYLES_LIGHT;
}

/**
 * Convert plain text to HTML with annotation markers
 */
export function injectAnnotationsIntoHtml(
  plainText: string,
  annotations: Annotation[],
  theme: 'light' | 'dark' = 'light'
): string {
  if (!plainText || plainText.trim().length === 0) {
    return '<p>Sem conteúdo</p>';
  }

  console.log('🎨 [annotationInjector] Processing annotations:', {
    total: annotations.length,
    theme,
    annotations: annotations.map(a => ({
      id: a.id,
      type: a.type,
      wordIds: a.wordIds,
      preview: a.textNote?.substring(0, 30) || a.transcription?.substring(0, 30) || '[no text]',
    })),
  });

  // Select appropriate styles based on theme
  const annotationStyles = getAnnotationStylesByTheme(theme);

  // Sort annotations by their position (assuming wordIds are sequential)
  const sortedAnnotations = [...annotations].sort((a, b) => {
    const aStart = a.wordIds[0] || '';
    const bStart = b.wordIds[0] || '';
    return aStart.localeCompare(bStart);
  });

  // Split text into words for easier manipulation
  const paragraphs = plainText.split(/\n\n+/);
  let result = '';

  paragraphs.forEach((para, paraIndex) => {
    if (!para.trim()) return;

    const words = para.split(/(\s+)/); // Keep whitespace
    let htmlContent = '';
    let wordIndex = 0;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];

      // Skip pure whitespace
      if (/^\s+$/.test(word)) {
        htmlContent += word;
        continue;
      }

      const wordId = `p${paraIndex}-w${wordIndex}`;

      // Check if this word is part of any annotation
      const annotation = sortedAnnotations.find((ann) =>
        ann.wordIds && ann.wordIds.includes(wordId)
      );

      if (annotation) {
        console.log(`🎯 Found annotation for wordId ${wordId}:`, {
          id: annotation.id,
          type: annotation.type,
          word: word,
        });
        const isFirstWord = annotation.wordIds[0] === wordId;
        const isLastWord =
          annotation.wordIds[annotation.wordIds.length - 1] === wordId;

        const style = annotationStyles[annotation.type];

        if (isFirstWord) {
          // Start annotation span
          htmlContent += `<span class="annotation annotation-${annotation.type}" data-annotation-id="${annotation.id}" style="background-color: ${style.color}; border-bottom: 2px solid ${style.borderColor}; padding: 2px 0; cursor: pointer;">`;
        }

        htmlContent += word;

        if (isLastWord) {
          // End annotation span with icon
          htmlContent += `<span class="annotation-icon" style="font-size: 0.7em; margin-left: 2px; opacity: 0.7;">${style.icon}</span></span>`;
        }
      } else {
        htmlContent += word;
      }

      wordIndex++;
    }

    result += `<p>${htmlContent}</p>\n`;
  });

  return result;
}

/**
 * Generate CSS for annotation highlighting
 */
export function getAnnotationStyles(): string {
  return `
    .annotation {
      position: relative;
      display: inline;
      border-radius: 3px;
      transition: opacity 0.2s;
    }
    
    .annotation:active {
      opacity: 0.7;
    }
    
    .annotation-icon {
      display: inline;
      pointer-events: none;
    }
    
    /* Prevent text selection on annotation icons */
    .annotation-icon::selection {
      background: transparent;
    }
  `;
}

