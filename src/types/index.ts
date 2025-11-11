// Type definitions for Deep Research Notes

export interface Project {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: number;
  projectId?: number;
  title?: string;
  content: string;
  sourceType: 'clipboard' | 'manual' | 'import';
  createdAt: Date;
  updatedAt: Date;
}

export interface Sentence {
  id: number;
  documentId: number;
  content: string;
  orderIndex: number;
  paragraphIndex: number;
  sentenceIndex: number;
}

export interface Label {
  id: number;
  projectId?: number;
  name: string;
  color: string;
  isPredefined: boolean;
  usageCount: number;
  createdAt: Date;
}

export type AnnotationType = 'label' | 'note' | 'audio' | 'mixed';
export type AnnotationSource = 'manual_selection' | 'audio_transcription' | 'quick_note';

export interface Annotation {
  id: string;
  document_id: string;
  marker_id: string;
  text_note: string | null;
  annotation_type: AnnotationType;
  source: AnnotationSource;
  is_custom_label: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnnotationWithLabels extends Annotation {
  labels: Label[];
  has_audio: boolean;
}

export interface TranscriptionResult {
  text: string;
  language: string;
  confidence: number;
}

export interface Transcriber {
  transcribe(audioUri: string): Promise<TranscriptionResult>;
}

export interface ProcessedDocument {
  paragraphs: string[];
  sentences: Sentence[];
  wordCount: number;
  characterCount: number;
  estimatedReadingTime: number;
  detectedLanguage: 'pt' | 'en' | 'es';
}

