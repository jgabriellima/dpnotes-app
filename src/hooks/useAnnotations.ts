/**
 * Annotations Hook
 * 
 * React Query hooks for managing annotations with Supabase and local storage
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import * as LocalStorage from '../services/storage/local';
import type { Database } from '../types/database.types';

type Annotation = Database['public']['Tables']['annotations']['Row'];
type AnnotationInsert = Database['public']['Tables']['annotations']['Insert'];
type AnnotationUpdate = Database['public']['Tables']['annotations']['Update'];

interface AnnotationWithDetails extends Annotation {
  labels: Array<{
    id: string;
    name: string;
    description: string | null;
    color: string;
  }>;
  audio: Array<{
    id: string;
    audio_url: string;
    duration_seconds: number | null;
    transcription: string | null;
  }>;
}

/**
 * Fetch annotations for a document
 */
export function useAnnotations(documentId: string) {
  return useQuery({
    queryKey: ['annotations', documentId],
    queryFn: async (): Promise<AnnotationWithDetails[]> => {
      const { data, error } = await supabase
        .from('annotations')
        .select(`
          *,
          annotation_labels (
            label:labels (
              id,
              name,
              description,
              color
            )
          ),
          audio_recordings (
            id,
            audio_url,
            duration_seconds,
            transcription
          )
        `)
        .eq('document_id', documentId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Transform the data to a cleaner structure
      return (data || []).map(annotation => ({
        ...annotation,
        labels: (annotation.annotation_labels || [])
          .map((al: any) => al.label)
          .filter(Boolean),
        audio: annotation.audio_recordings || [],
      }));
    },
    enabled: !!documentId,
  });
}

/**
 * Fetch annotations with labels for a document as a Map keyed by marker_id
 */
export function useAnnotationsWithLabels(documentId: string) {
  const { isAnonymous } = useAuth();
  
  return useQuery({
    queryKey: ['annotations', 'map', documentId, isAnonymous ? 'local' : 'cloud'],
    queryFn: async (): Promise<Map<string, AnnotationWithDetails & { has_audio: boolean }>> => {
      // Modo anônimo: usa storage local (simplified - no labels/audio for now)
      if (isAnonymous) {
        const annotations = await LocalStorage.getLocalAnnotations();
        const documentAnnotations = annotations.filter(a => a.document_id === documentId);
        
        const annotationMap = new Map();
        documentAnnotations.forEach((annotation: any) => {
          annotationMap.set(annotation.marker_id || annotation.id, {
            ...annotation,
            labels: [],
            audio: [],
            has_audio: false,
          });
        });
        
        return annotationMap;
      }
      
      // Modo autenticado: usa Supabase
      const { data, error } = await supabase
        .from('annotations')
        .select(`
          *,
          annotation_labels (
            label:labels (
              id,
              name,
              description,
              color,
              is_predefined
            )
          ),
          audio_recordings (
            id,
            audio_url,
            duration_seconds,
            transcription
          )
        `)
        .eq('document_id', documentId);

      if (error) throw error;

      // Convert to Map keyed by marker_id
      const annotationMap = new Map();
      (data || []).forEach(annotation => {
        annotationMap.set(annotation.marker_id, {
          ...annotation,
          labels: (annotation.annotation_labels || [])
            .map((al: any) => al.label)
            .filter(Boolean),
          audio: annotation.audio_recordings || [],
          has_audio: (annotation.audio_recordings || []).length > 0,
        });
      });
      
      return annotationMap;
    },
    enabled: !!documentId,
  });
}

/**
 * Create or update annotation (marker-based)
 */
export function useUpsertAnnotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (annotation: AnnotationInsert) => {
      const { data, error } = await supabase
        .from('annotations')
        .upsert(annotation, {
          onConflict: 'marker_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['annotations', data.document_id] });
    },
  });
}

/**
 * Create new annotation with marker
 */
export function useCreateAnnotation() {
  const queryClient = useQueryClient();
  const { isAnonymous } = useAuth();

  return useMutation({
    mutationFn: async (annotation: AnnotationInsert): Promise<Annotation> => {
      // Modo anônimo: usa storage local
      if (isAnonymous) {
        return await LocalStorage.createLocalAnnotation(annotation as any);
      }
      
      // Modo autenticado: usa Supabase
      const { data, error } = await supabase
        .from('annotations')
        .insert(annotation)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['annotations', data.document_id] });
    },
  });
}

/**
 * Add labels to annotation
 */
export function useAddLabelsToAnnotation() {
  const queryClient = useQueryClient();
  const { isAnonymous } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      annotationId, 
      labelIds 
    }: { 
      annotationId: string; 
      labelIds: string[] 
    }) => {
      // Modo anônimo: não suportado por enquanto (labels são feature premium)
      if (isAnonymous) {
        console.warn('Labels not supported in anonymous mode');
        return [];
      }
      
      const entries = labelIds.map(labelId => ({
        annotation_id: annotationId,
        label_id: labelId,
      }));

      const { data, error } = await supabase
        .from('annotation_labels')
        .insert(entries)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotations'] });
    },
  });
}

/**
 * Remove label from annotation
 */
export function useRemoveLabelFromAnnotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      annotationId, 
      labelId 
    }: { 
      annotationId: string; 
      labelId: string 
    }) => {
      const { error } = await supabase
        .from('annotation_labels')
        .delete()
        .eq('annotation_id', annotationId)
        .eq('label_id', labelId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotations'] });
    },
  });
}

/**
 * Delete annotation
 */
export function useDeleteAnnotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('annotations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotations'] });
    },
  });
}

