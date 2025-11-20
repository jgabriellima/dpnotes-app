/**
 * Documents Store
 * 
 * Zustand store for managing documents and annotations (offline-first)
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { EditorDocument, Annotation, WordId, Tag, Project } from '../types/editor.types';
import { importFromClipboard } from '../services/clipboard/import';

const DOCUMENTS_STORAGE_KEY = '@deep-research-notes:documents';
const PROJECTS_STORAGE_KEY = '@deep-research-notes:projects';

interface DocumentsState {
  documents: Map<string, EditorDocument>;
  projects: Map<string, Project>;
  isLoaded: boolean;
  loadDocuments: () => Promise<void>;
  getDocument: (id: string) => EditorDocument | undefined;
  createDocument: (id: string, content: string) => void;
  updateDocumentContent: (id: string, content: string) => void;
  importDocumentFromClipboard: () => Promise<string>;
  deleteDocument: (id: string) => void;
  moveDocumentToProject: (documentId: string, projectId: string | undefined) => void;
  addAnnotation: (documentId: string, annotation: Annotation) => void;
  updateAnnotation: (documentId: string, annotationId: string, updates: Partial<Annotation>) => void;
  deleteAnnotation: (documentId: string, annotationId: string) => void;
  clearAllAnnotations: (documentId: string) => void;
  getAnnotationsForWords: (documentId: string, wordIds: WordId[]) => Annotation | undefined;
  createProject: (name: string) => string;
  deleteProject: (id: string) => void;
}

export const useDocumentsStore = create<DocumentsState>((set, get) => ({
  documents: new Map(),
  projects: new Map(),
  isLoaded: false,

  loadDocuments: async () => {
    try {
      const [storedDocs, storedProjects] = await Promise.all([
        AsyncStorage.getItem(DOCUMENTS_STORAGE_KEY),
        AsyncStorage.getItem(PROJECTS_STORAGE_KEY),
      ]);
      
      if (storedDocs) {
        const documentsArray = JSON.parse(storedDocs) as EditorDocument[];
        
        // Migrate old documents without timestamps
        const now = new Date().toISOString();
        const migratedDocs = documentsArray.map(doc => ({
          ...doc,
          createdAt: doc.createdAt || now,
          updatedAt: doc.updatedAt || now,
          title: doc.title || 'Sem título',
        }));
        
        const documentsMap = new Map(migratedDocs.map(doc => [doc.id, doc]));
        set({ documents: documentsMap });
        
        console.log('📚 [DocumentsStore] Loaded documents:', migratedDocs.length);
      }
      
      if (storedProjects) {
        const projectsArray = JSON.parse(storedProjects) as Project[];
        const projectsMap = new Map(projectsArray.map(proj => [proj.id, proj]));
        set({ projects: projectsMap });
        console.log('📁 [DocumentsStore] Loaded projects:', projectsArray.length);
      }
      
      set({ isLoaded: true });
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

  deleteDocument: (id: string) => {
    const { documents } = get();
    const updated = new Map(documents);
    updated.delete(id);
    set({ documents: updated });

    // Persist to AsyncStorage
    const documentsArray = Array.from(updated.values());
    AsyncStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(documentsArray)).catch(error => {
      console.error('Error saving documents:', error);
    });
  },

  moveDocumentToProject: (documentId: string, projectId: string | undefined) => {
    const { documents } = get();
    const doc = documents.get(documentId);
    
    if (!doc) return;

    const updated = new Map(documents);
    updated.set(documentId, {
      ...doc,
      projectId,
      updatedAt: new Date().toISOString(),
    });
    set({ documents: updated });

    // Persist to AsyncStorage
    const documentsArray = Array.from(updated.values());
    AsyncStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(documentsArray)).catch(error => {
      console.error('Error saving documents:', error);
    });
  },

  createProject: (name: string) => {
    const { projects } = get();
    const projectId = `project-${Date.now()}`;
    const newProject: Project = {
      id: projectId,
      name,
      createdAt: new Date().toISOString(),
    };

    const updated = new Map(projects);
    updated.set(projectId, newProject);
    set({ projects: updated });

    // Persist to AsyncStorage
    const projectsArray = Array.from(updated.values());
    AsyncStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projectsArray)).catch(error => {
      console.error('Error saving projects:', error);
    });

    return projectId;
  },

  deleteProject: (id: string) => {
    const { projects, documents } = get();
    
    // Remove project
    const updatedProjects = new Map(projects);
    updatedProjects.delete(id);
    set({ projects: updatedProjects });

    // Move all documents from this project to "no project"
    const updatedDocuments = new Map(documents);
    documents.forEach((doc, docId) => {
      if (doc.projectId === id) {
        updatedDocuments.set(docId, { ...doc, projectId: undefined });
      }
    });
    set({ documents: updatedDocuments });

    // Persist to AsyncStorage
    const projectsArray = Array.from(updatedProjects.values());
    const documentsArray = Array.from(updatedDocuments.values());
    Promise.all([
      AsyncStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projectsArray)),
      AsyncStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(documentsArray)),
    ]).catch(error => {
      console.error('Error saving data:', error);
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

