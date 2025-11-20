/**
 * Editor Types
 * 
 * Type definitions for the component-based editor system
 */

export type WordId = string; // Format: "p{paragraphIndex}-w{wordIndex}"

export type AnnotationType = 'text' | 'audio' | 'tags';

export interface Tag {
  label: string;
  description: string;
}

export interface Annotation {
  id: string;
  wordIds: WordId[];
  type: AnnotationType;
  textNote?: string;
  audioUri?: string;
  audioBytes?: Uint8Array;
  transcription?: string;
  tags?: Tag[];
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
}

export interface EditorDocument {
  id: string;
  content: string;
  annotations: Annotation[];
  title?: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WordData {
  id: WordId;
  text: string;
  paragraphIndex: number;
  wordIndex: number;
}

export interface ParagraphData {
  index: number;
  words: WordData[];
}

export interface TagWithUsage extends Tag {
  usageCount: number;
}

