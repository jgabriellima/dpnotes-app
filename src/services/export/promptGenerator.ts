/**
 * Prompt Generator Service
 * 
 * Elegant service for generating structured prompts from annotated documents.
 * Formats annotations into a ChatGPT-ready prompt.
 */

interface Label {
  id: string;
  name: string;
  description: string | null;
}

interface Annotation {
  id: string;
  sentenceIndex: number;
  sentenceText: string;
  textNote: string | null;
  labels: Label[];
  audio: Array<{
    transcription: string | null;
  }>;
}

interface ExportOptions {
  includeAudioTranscriptions: boolean;
  includeTextNotes: boolean;
  includeLabelDescriptions: boolean;
  language: 'pt' | 'en' | 'es';
}

const translations = {
  pt: {
    summaryTitle: '<annotations_summary>',
    annotatedTextTitle: '<annotated_text>',
    labelPrefix: '<label>',
    textNotePrefix: '<text_note>',
    audioTranscriptionPrefix: '<audio>',
    instructions: '<instructions> The text below has been annotated with the following labels:',
  },
  en: {
    summaryTitle: '<annotations_summary>',
    annotatedTextTitle: '<annotated_text>',
    labelPrefix: '<label>',
    textNotePrefix: '<text_note>',
    audioTranscriptionPrefix: '<audio>',
    instructions: '<text_annotator_legend>',
  },
  es: {
    summaryTitle: '<annotations_summary>',
    annotatedTextTitle: '<annotated_text>',
    labelPrefix: '<label>',
    textNotePrefix: '<text_note>',
    audioTranscriptionPrefix: '<audio>',
    instructions: '<text_annotator_legend>',
  },
};

/**
 * Generate a structured prompt from annotations
 */
export function generatePrompt(
  documentTitle: string,
  documentContent: string,
  annotations: Annotation[],
  options: ExportOptions = {
    includeAudioTranscriptions: true,
    includeTextNotes: true,
    includeLabelDescriptions: true,
    language: 'pt',
  }
): string {
  const t = translations[options.language];
  const sections: string[] = [];

  // Header with instructions
  sections.push(t.instructions);
  sections.push('');

  // Summary of Annotations
  if (annotations.length > 0) {
    sections.push(t.summaryTitle);
    sections.push('');

    annotations.forEach((annotation, index) => {
      const refId = `T${index + 1}`;
      sections.push(`**[${refId}]**`);

      // Labels
      if (annotation.labels.length > 0) {
        annotation.labels.forEach(label => {
          sections.push(`- ${t.labelPrefix}: **${label.name}**`);
          if (options.includeLabelDescriptions && label.description) {
            sections.push(`  ${label.description}`);
          }
        });
      }

      // Text Note
      if (options.includeTextNotes && annotation.textNote) {
        sections.push(`- ${t.textNotePrefix}: ${annotation.textNote}`);
      }

      // Audio Transcription
      if (options.includeAudioTranscriptions && annotation.audio.length > 0) {
        annotation.audio.forEach(audio => {
          if (audio.transcription) {
            sections.push(`- ${t.audioTranscriptionPrefix}: "${audio.transcription}"`);
          }
        });
      }

      sections.push('');
    });
  }

  // Annotated Text
  sections.push(t.annotatedTextTitle);
  sections.push('');
  sections.push(`**${documentTitle}**`);
  sections.push('');

  // Split content into sentences and add reference markers
  const sentences = documentContent.split(/(?<=[.!?])\s+/);
  const annotationMap = new Map<number, number>(); // sentenceIndex -> referenceId

  annotations.forEach((annotation, index) => {
    annotationMap.set(annotation.sentenceIndex, index + 1);
  });

  sentences.forEach((sentence, index) => {
    const refId = annotationMap.get(index);
    if (refId) {
      sections.push(`${sentence} **[T${refId}]**`);
    } else {
      sections.push(sentence);
    }
  });

  return sections.join('\n');
}

/**
 * Generate a compact summary (for quick export)
 */
export function generateCompactSummary(
  annotations: Annotation[],
  language: 'pt' | 'en' | 'es' = 'pt'
): string {
  const t = translations[language];
  const lines: string[] = [];

  lines.push(t.summaryTitle);
  lines.push('');

  annotations.forEach((annotation, index) => {
    const labels = annotation.labels.map(l => l.name).join(', ');
    lines.push(`${index + 1}. ${labels || '(sem label)'}`);
    
    if (annotation.textNote) {
      lines.push(`   ${annotation.textNote}`);
    }
  });

  return lines.join('\n');
}

/**
 * Generate statistics about annotations
 */
export function generateStatistics(annotations: Annotation[]): {
  totalAnnotations: number;
  totalLabels: number;
  totalTextNotes: number;
  totalAudioNotes: number;
  labelCounts: Record<string, number>;
} {
  const labelCounts: Record<string, number> = {};
  let totalTextNotes = 0;
  let totalAudioNotes = 0;

  annotations.forEach(annotation => {
    annotation.labels.forEach(label => {
      labelCounts[label.name] = (labelCounts[label.name] || 0) + 1;
    });

    if (annotation.textNote) totalTextNotes++;
    if (annotation.audio.length > 0) totalAudioNotes++;
  });

  return {
    totalAnnotations: annotations.length,
    totalLabels: Object.keys(labelCounts).length,
    totalTextNotes,
    totalAudioNotes,
    labelCounts,
  };
}

export default {
  generatePrompt,
  generateCompactSummary,
  generateStatistics,
};

