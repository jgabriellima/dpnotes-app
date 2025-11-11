/**
 * Markdown Exporter
 * 
 * Exports documents with annotations to Markdown format
 */

import type { EditorDocument, Annotation } from '../../types/editor.types';

interface WordPosition {
  wordId: string;
  globalIndex: number;
  text: string;
}

/**
 * Export document to Markdown format with annotations
 */
export function exportToMarkdown(document: EditorDocument, title?: string): string {
  const { content, annotations } = document;
  
  // Parse content into words with positions
  const words: WordPosition[] = [];
  const paragraphs = content.split('\n');
  let globalIndex = 0;
  
  paragraphs.forEach((paragraph, pIndex) => {
    const wordTexts = paragraph.split(/(\s+)/).filter(w => w.trim().length > 0);
    wordTexts.forEach((text, wIndex) => {
      words.push({
        wordId: `p${pIndex}-w${wIndex}`,
        globalIndex: globalIndex++,
        text,
      });
    });
  });

  // Build word ID to annotation map
  const wordToAnnotation = new Map<string, Annotation>();
  annotations.forEach(annotation => {
    annotation.wordIds.forEach(wordId => {
      wordToAnnotation.set(wordId, annotation);
    });
  });

  // Build Markdown content
  let markdown = '';
  
  // Title
  if (title) {
    markdown += `# ${title}\n\n`;
  }

  // Content with inline annotation markers
  let annotationCounter = 1;
  const annotationReferences = new Map<string, number>();
  const paragraphLines: string[] = [];
  let currentParagraph: string[] = [];
  let lastParagraphIndex = -1;

  words.forEach((word, index) => {
    const annotation = wordToAnnotation.get(word.wordId);
    const paragraphIndex = parseInt(word.wordId.split('-')[0].substring(1));

    // New paragraph
    if (paragraphIndex !== lastParagraphIndex && currentParagraph.length > 0) {
      paragraphLines.push(currentParagraph.join(' '));
      currentParagraph = [];
    }
    lastParagraphIndex = paragraphIndex;

    if (annotation) {
      // Check if this is the first word of the annotation
      const isFirstWord = annotation.wordIds[0] === word.wordId;
      
      if (isFirstWord) {
        // Add annotation reference
        if (!annotationReferences.has(annotation.id)) {
          annotationReferences.set(annotation.id, annotationCounter++);
        }
        const refNum = annotationReferences.get(annotation.id)!;
        currentParagraph.push(`**${word.text}**[^${refNum}]`);
      } else {
        currentParagraph.push(word.text);
      }
    } else {
      currentParagraph.push(word.text);
    }
  });

  // Add last paragraph
  if (currentParagraph.length > 0) {
    paragraphLines.push(currentParagraph.join(' '));
  }

  markdown += paragraphLines.join('\n\n');
  markdown += '\n\n---\n\n';

  // Footnotes for quick reference
  if (annotations.length > 0) {
    annotations.forEach(annotation => {
      const refNum = annotationReferences.get(annotation.id);
      if (!refNum) return;

      markdown += `[^${refNum}]: `;

      if (annotation.type === 'text') {
        markdown += `Text note: "${annotation.textNote}"`;
      } else if (annotation.type === 'audio') {
        markdown += `Audio transcription: "${annotation.transcription}"`;
      } else if (annotation.type === 'tags') {
        const tagLabels = annotation.tags?.map(t => `#${t.label}`).join(' ') || '';
        markdown += `Tags: ${tagLabels}`;
      }

      markdown += '\n';
    });

    markdown += '\n';
  }

  // Detailed annotations section
  if (annotations.length > 0) {
    markdown += '## Annotations\n\n';

    annotations.forEach((annotation, index) => {
      const refNum = annotationReferences.get(annotation.id);
      if (!refNum) return;

      // Get annotated text
      const annotatedWords = words.filter(w => annotation.wordIds.includes(w.wordId));
      const annotatedText = annotatedWords.map(w => w.text).join(' ');
      
      // Get word range
      const startIndex = annotatedWords[0]?.globalIndex ?? 0;
      const endIndex = annotatedWords[annotatedWords.length - 1]?.globalIndex ?? 0;

      markdown += `${index + 1}. **${annotatedText}** (word range: ${startIndex}-${endIndex})\n`;

      if (annotation.type === 'text') {
        markdown += `   - Type: text\n`;
        markdown += `   - Note: "${annotation.textNote}"\n`;
      } else if (annotation.type === 'audio') {
        markdown += `   - Type: audio\n`;
        markdown += `   - Transcription: "${annotation.transcription}"\n`;
        if (annotation.audioUri) {
          const duration = 0; // TODO: Calculate from audio metadata
          markdown += `   - Duration: ${duration}s\n`;
        }
      } else if (annotation.type === 'tags') {
        markdown += `   - Type: tags\n`;
        markdown += `   - Tags:\n`;
        annotation.tags?.forEach(tag => {
          markdown += `     - #${tag.label}: "${tag.description}"\n`;
        });
      }

      markdown += '\n';
    });
  }

  return markdown;
}

