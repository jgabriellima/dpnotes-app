/**
 * Documents Store
 * 
 * Zustand store for managing documents and annotations (offline-first)
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { EditorDocument, Annotation, WordId, Tag } from '../types/editor.types';
import { importFromClipboard } from '../services/clipboard/import';

const DOCUMENTS_STORAGE_KEY = '@deep-research-notes:documents';

interface DocumentsState {
  documents: Map<string, EditorDocument>;
  isLoaded: boolean;
  loadDocuments: () => Promise<void>;
  getDocument: (id: string) => EditorDocument | undefined;
  createDocument: (id: string, content: string) => void;
  updateDocumentContent: (id: string, content: string) => void;
  importDocumentFromClipboard: () => Promise<string>;
  addAnnotation: (documentId: string, annotation: Annotation) => void;
  updateAnnotation: (documentId: string, annotationId: string, updates: Partial<Annotation>) => void;
  deleteAnnotation: (documentId: string, annotationId: string) => void;
  clearAllAnnotations: (documentId: string) => void;
  getAnnotationsForWords: (documentId: string, wordIds: WordId[]) => Annotation | undefined;
}

export const useDocumentsStore = create<DocumentsState>((set, get) => ({
  documents: new Map(),
  isLoaded: false,

  loadDocuments: async () => {
    try {
      const stored = await AsyncStorage.getItem(DOCUMENTS_STORAGE_KEY);
      if (stored) {
        const documentsArray = JSON.parse(stored) as EditorDocument[];
        
        // Migrate old documents without timestamps
        const now = new Date().toISOString();
        const migratedDocs = documentsArray.map(doc => ({
          ...doc,
          createdAt: doc.createdAt || now,
          updatedAt: doc.updatedAt || now,
          title: doc.title || 'Sem título',
        }));
        
        const documentsMap = new Map(migratedDocs.map(doc => [doc.id, doc]));
        set({ documents: documentsMap, isLoaded: true });
        
        console.log('📚 [DocumentsStore] Loaded documents:', migratedDocs.length);
      } else {
        set({ isLoaded: true });
        console.log('📚 [DocumentsStore] No stored documents');
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      set({ isLoaded: true });
    }
  },

  getDocument: (id: string) => {
    return get().documents.get(id);
  },

  createDocument: (id: string, content: string) => {
    const { documents } = get();
    
    const now = new Date().toISOString();
    const newDoc: EditorDocument = {
      id,
      content,
      annotations: [],
      title: 'Sem título',
      createdAt: now,
      updatedAt: now,
    };

    const updated = new Map(documents);
    updated.set(id, newDoc);
    set({ documents: updated });

    // Persist to AsyncStorage
    const documentsArray = Array.from(updated.values());
    AsyncStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(documentsArray)).catch(error => {
      console.error('Error saving documents:', error);
    });
  },

  updateDocumentContent: (id: string, content: string) => {
    const { documents } = get();
    const doc = documents.get(id);
    
    if (!doc) {
      // Create new document if it doesn't exist
      get().createDocument(id, content);
      return;
    }

    const updated = new Map(documents);
    updated.set(id, { 
      ...doc, 
      content,
      updatedAt: new Date().toISOString(),
    });
    set({ documents: updated });

    // Persist to AsyncStorage
    const documentsArray = Array.from(updated.values());
    AsyncStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(documentsArray)).catch(error => {
      console.error('Error saving documents:', error);
    });
  },

  importDocumentFromClipboard: async () => {
    try {
      const { content, wordCount, source } = await importFromClipboard();
      
      // Generate unique ID for new document
      const docId = `doc-${Date.now()}`;
      
      // Create document
      get().createDocument(docId, content);
      
      console.log(`📄 Imported document: ${docId} (${wordCount} words, source: ${source})`);
      
      return docId;
    } catch (error) {
      console.error('Error importing from clipboard:', error);
      throw error;
    }
  },

  addAnnotation: (documentId: string, annotation: Annotation) => {
    const { documents } = get();
    const doc = documents.get(documentId);
    
    if (!doc) return;

    const updated = new Map(documents);
    updated.set(documentId, {
      ...doc,
      annotations: [...doc.annotations, annotation],
      updatedAt: new Date().toISOString(),
    });
    set({ documents: updated });

    // Persist to AsyncStorage
    const documentsArray = Array.from(updated.values());
    AsyncStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(documentsArray)).catch(error => {
      console.error('Error saving documents:', error);
    });
  },

  updateAnnotation: (documentId: string, annotationId: string, updates: Partial<Annotation>) => {
    const { documents } = get();
    const doc = documents.get(documentId);
    
    if (!doc) return;

    const updated = new Map(documents);
    updated.set(documentId, {
      ...doc,
      annotations: doc.annotations.map(ann =>
        ann.id === annotationId ? { ...ann, ...updates } : ann
      ),
    });
    set({ documents: updated });

    // Persist to AsyncStorage
    const documentsArray = Array.from(updated.values());
    AsyncStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(documentsArray)).catch(error => {
      console.error('Error saving documents:', error);
    });
  },

  deleteAnnotation: (documentId: string, annotationId: string) => {
    const { documents } = get();
    const doc = documents.get(documentId);
    
    if (!doc) return;

    const updated = new Map(documents);
    updated.set(documentId, {
      ...doc,
      annotations: doc.annotations.filter(ann => ann.id !== annotationId),
    });
    set({ documents: updated });

    // Persist to AsyncStorage
    const documentsArray = Array.from(updated.values());
    AsyncStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(documentsArray)).catch(error => {
      console.error('Error saving documents:', error);
    });
  },

  clearAllAnnotations: (documentId: string) => {
    const { documents } = get();
    const doc = documents.get(documentId);
    
    if (!doc) return;

    console.log('🧹 [DocumentsStore] Clearing all annotations for document:', documentId);

    const updated = new Map(documents);
    updated.set(documentId, {
      ...doc,
      annotations: [],
    });
    set({ documents: updated });

    // Persist to AsyncStorage
    const documentsArray = Array.from(updated.values());
    AsyncStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(documentsArray)).catch(error => {
      console.error('Error saving documents:', error);
    });
  },

  getAnnotationsForWords: (documentId: string, wordIds: WordId[]) => {
    const doc = get().documents.get(documentId);
    if (!doc) return undefined;

    return doc.annotations.find(ann =>
      ann.wordIds.some(wid => wordIds.includes(wid))
    );
  },
}));

