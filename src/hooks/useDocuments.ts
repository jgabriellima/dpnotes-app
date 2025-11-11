/**
 * Documents Hook
 * 
 * React Query hook for managing documents with Supabase and local storage
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import * as LocalStorage from '../services/storage/local';
import type { Database } from '../types/database.types';

type Document = Database['public']['Tables']['documents']['Row'];
type DocumentInsert = Database['public']['Tables']['documents']['Insert'];
type DocumentUpdate = Database['public']['Tables']['documents']['Update'];

/**
 * Fetch documents for a project
 */
export function useDocuments(projectId: string) {
  const { isAnonymous } = useAuth();
  
  return useQuery({
    queryKey: ['documents', projectId, isAnonymous ? 'local' : 'cloud'],
    queryFn: async (): Promise<Document[]> => {
      // Modo anônimo: usa storage local
      if (isAnonymous) {
        return await LocalStorage.getLocalDocuments(projectId);
      }
      
      // Modo autenticado: usa Supabase
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!projectId,
  });
}

/**
 * Fetch a single document
 */
export function useDocument(id: string) {
  const { isAnonymous } = useAuth();
  
  return useQuery({
    queryKey: ['documents', id, isAnonymous ? 'local' : 'cloud'],
    queryFn: async (): Promise<Document> => {
      // Modo anônimo: usa storage local
      if (isAnonymous) {
        return await LocalStorage.getLocalDocument(id);
      }
      
      // Modo autenticado: usa Supabase
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Create a new document
 */
export function useCreateDocument() {
  const queryClient = useQueryClient();
  const { isAnonymous } = useAuth();

  return useMutation({
    mutationFn: async (document: DocumentInsert): Promise<Document> => {
      // Modo anônimo: usa storage local
      if (isAnonymous) {
        return await LocalStorage.createLocalDocument(document as any);
      }
      
      // Modo autenticado: usa Supabase
      const { data, error } = await supabase
        .from('documents')
        .insert(document)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents', data.project_id] });
    },
  });
}

/**
 * Update a document
 */
export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: DocumentUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents', data.id] });
      queryClient.invalidateQueries({ queryKey: ['documents', data.project_id] });
    },
  });
}

/**
 * Delete a document
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

/**
 * Fetch documents by project ID
 * Alias for useDocuments for clarity in project context
 */
export function useDocumentsByProject(projectId: string) {
  return useDocuments(projectId);
}

/**
 * Update document content specifically
 * Optimized for frequent content updates (auto-save)
 */
export function useUpdateDocumentContent() {
  const queryClient = useQueryClient();
  const { isAnonymous } = useAuth();

  return useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }): Promise<Document> => {
      // Modo anônimo: usa storage local
      if (isAnonymous) {
        return await LocalStorage.updateLocalDocument(id, { 
          content, 
          updated_at: new Date().toISOString() 
        });
      }
      
      // Modo autenticado: usa Supabase
      const { data, error } = await supabase
        .from('documents')
        .update({ 
          content, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents', data.id] });
      queryClient.invalidateQueries({ queryKey: ['documents', data.project_id] });
    },
  });
}

