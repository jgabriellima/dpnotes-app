/**
 * Local Storage Service
 * 
 * Implementa storage local usando AsyncStorage para modo anônimo/offline
 * Todos os dados são salvos localmente no dispositivo
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Project, Document, Annotation, Label } from '../../types/database.types';

// Storage Keys
const STORAGE_KEYS = {
  PROJECTS: '@dpnotes:projects',
  DOCUMENTS: '@dpnotes:documents',
  ANNOTATIONS: '@dpnotes:annotations',
  LABELS: '@dpnotes:labels',
  LAST_PROJECT_ID: '@dpnotes:last_project_id',
  LAST_DOCUMENT_ID: '@dpnotes:last_document_id',
  LAST_ANNOTATION_ID: '@dpnotes:last_annotation_id',
};

// Helper para gerar IDs únicos locais
function generateLocalId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// PROJECTS
// ============================================================================

export async function getLocalProjects(): Promise<Project[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PROJECTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading local projects:', error);
    return [];
  }
}

export async function createLocalProject(
  project: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'user_id'>
): Promise<Project> {
  try {
    const projects = await getLocalProjects();
    
    const newProject: Project = {
      ...project,
      id: generateLocalId('project'),
      user_id: 'local_user', // ID fixo para modo local
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    projects.push(newProject);
    await AsyncStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    
    return newProject;
  } catch (error) {
    console.error('Error creating local project:', error);
    throw error;
  }
}

export async function updateLocalProject(
  id: string,
  updates: Partial<Project>
): Promise<Project> {
  try {
    const projects = await getLocalProjects();
    const index = projects.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error('Project not found');
    }
    
    projects[index] = {
      ...projects[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    
    return projects[index];
  } catch (error) {
    console.error('Error updating local project:', error);
    throw error;
  }
}

export async function deleteLocalProject(id: string): Promise<void> {
  try {
    const projects = await getLocalProjects();
    const filtered = projects.filter(p => p.id !== id);
    
    await AsyncStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));
    
    // Também deletar documentos relacionados
    const documents = await getLocalDocuments(id);
    for (const doc of documents) {
      await deleteLocalDocument(doc.id);
    }
  } catch (error) {
    console.error('Error deleting local project:', error);
    throw error;
  }
}

// ============================================================================
// DOCUMENTS
// ============================================================================

export async function getLocalDocuments(projectId?: string): Promise<Document[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    const documents: Document[] = data ? JSON.parse(data) : [];
    
    if (projectId) {
      return documents.filter(d => d.project_id === projectId);
    }
    
    return documents;
  } catch (error) {
    console.error('Error loading local documents:', error);
    return [];
  }
}

export async function getLocalDocument(id: string): Promise<Document | null> {
  try {
    const documents = await getLocalDocuments();
    return documents.find(d => d.id === id) || null;
  } catch (error) {
    console.error('Error loading local document:', error);
    return null;
  }
}

export async function createLocalDocument(
  document: Omit<Document, 'id' | 'created_at' | 'updated_at'>
): Promise<Document> {
  try {
    const documents = await getLocalDocuments();
    
    const newDocument: Document = {
      ...document,
      id: generateLocalId('document'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    documents.push(newDocument);
    await AsyncStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    
    return newDocument;
  } catch (error) {
    console.error('Error creating local document:', error);
    throw error;
  }
}

export async function updateLocalDocument(
  id: string,
  updates: Partial<Document>
): Promise<Document> {
  try {
    const documents = await getLocalDocuments();
    const index = documents.findIndex(d => d.id === id);
    
    if (index === -1) {
      throw new Error('Document not found');
    }
    
    documents[index] = {
      ...documents[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    
    return documents[index];
  } catch (error) {
    console.error('Error updating local document:', error);
    throw error;
  }
}

export async function deleteLocalDocument(id: string): Promise<void> {
  try {
    const documents = await getLocalDocuments();
    const filtered = documents.filter(d => d.id !== id);
    
    await AsyncStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(filtered));
    
    // Também deletar anotações relacionadas
    const annotations = await getLocalAnnotations(id);
    for (const annotation of annotations) {
      await deleteLocalAnnotation(annotation.id);
    }
  } catch (error) {
    console.error('Error deleting local document:', error);
    throw error;
  }
}

// ============================================================================
// ANNOTATIONS
// ============================================================================

export async function getLocalAnnotations(documentId?: string): Promise<Annotation[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ANNOTATIONS);
    const annotations: Annotation[] = data ? JSON.parse(data) : [];
    
    if (documentId) {
      return annotations.filter(a => a.document_id === documentId);
    }
    
    return annotations;
  } catch (error) {
    console.error('Error loading local annotations:', error);
    return [];
  }
}

export async function createLocalAnnotation(
  annotation: Omit<Annotation, 'id' | 'created_at' | 'updated_at'>
): Promise<Annotation> {
  try {
    const annotations = await getLocalAnnotations();
    
    const newAnnotation: Annotation = {
      ...annotation,
      id: generateLocalId('annotation'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    annotations.push(newAnnotation);
    await AsyncStorage.setItem(STORAGE_KEYS.ANNOTATIONS, JSON.stringify(annotations));
    
    return newAnnotation;
  } catch (error) {
    console.error('Error creating local annotation:', error);
    throw error;
  }
}

export async function updateLocalAnnotation(
  id: string,
  updates: Partial<Annotation>
): Promise<Annotation> {
  try {
    const annotations = await getLocalAnnotations();
    const index = annotations.findIndex(a => a.id === id);
    
    if (index === -1) {
      throw new Error('Annotation not found');
    }
    
    annotations[index] = {
      ...annotations[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem(STORAGE_KEYS.ANNOTATIONS, JSON.stringify(annotations));
    
    return annotations[index];
  } catch (error) {
    console.error('Error updating local annotation:', error);
    throw error;
  }
}

export async function deleteLocalAnnotation(id: string): Promise<void> {
  try {
    const annotations = await getLocalAnnotations();
    const filtered = annotations.filter(a => a.id !== id);
    
    await AsyncStorage.setItem(STORAGE_KEYS.ANNOTATIONS, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting local annotation:', error);
    throw error;
  }
}

// ============================================================================
// LABELS
// ============================================================================

export async function getLocalLabels(): Promise<Label[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.LABELS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading local labels:', error);
    return [];
  }
}

export async function createLocalLabel(
  label: Omit<Label, 'id' | 'created_at' | 'user_id'>
): Promise<Label> {
  try {
    const labels = await getLocalLabels();
    
    const newLabel: Label = {
      ...label,
      id: generateLocalId('label'),
      user_id: 'local_user',
      created_at: new Date().toISOString(),
    };
    
    labels.push(newLabel);
    await AsyncStorage.setItem(STORAGE_KEYS.LABELS, JSON.stringify(labels));
    
    return newLabel;
  } catch (error) {
    console.error('Error creating local label:', error);
    throw error;
  }
}

export async function updateLocalLabel(
  id: string,
  updates: Partial<Label>
): Promise<Label> {
  try {
    const labels = await getLocalLabels();
    const index = labels.findIndex(l => l.id === id);
    
    if (index === -1) {
      throw new Error('Label not found');
    }
    
    labels[index] = {
      ...labels[index],
      ...updates,
    };
    
    await AsyncStorage.setItem(STORAGE_KEYS.LABELS, JSON.stringify(labels));
    
    return labels[index];
  } catch (error) {
    console.error('Error updating local label:', error);
    throw error;
  }
}

export async function deleteLocalLabel(id: string): Promise<void> {
  try {
    const labels = await getLocalLabels();
    const filtered = labels.filter(l => l.id !== id);
    
    await AsyncStorage.setItem(STORAGE_KEYS.LABELS, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting local label:', error);
    throw error;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export async function clearAllLocalData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.PROJECTS,
      STORAGE_KEYS.DOCUMENTS,
      STORAGE_KEYS.ANNOTATIONS,
      STORAGE_KEYS.LABELS,
    ]);
  } catch (error) {
    console.error('Error clearing local data:', error);
    throw error;
  }
}

export async function getLocalDataStats(): Promise<{
  projects: number;
  documents: number;
  annotations: number;
  labels: number;
}> {
  try {
    const [projects, documents, annotations, labels] = await Promise.all([
      getLocalProjects(),
      getLocalDocuments(),
      getLocalAnnotations(),
      getLocalLabels(),
    ]);
    
    return {
      projects: projects.length,
      documents: documents.length,
      annotations: annotations.length,
      labels: labels.length,
    };
  } catch (error) {
    console.error('Error getting local data stats:', error);
    return { projects: 0, documents: 0, annotations: 0, labels: 0 };
  }
}

