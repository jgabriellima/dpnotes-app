/**
 * Projects Hook
 * 
 * React Query hook for managing projects with Supabase.
 * Provides elegant data fetching, caching, and mutation handling.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import * as LocalStorage from '../services/storage/local';
import type { Database } from '../types/database.types';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

interface ProjectWithStats extends Project {
  documents_count: number;
  annotations_count: number;
}

/**
 * Fetch all projects for the current user
 */
export function useProjects() {
  const { isAnonymous } = useAuth();
  
  return useQuery({
    queryKey: ['projects', isAnonymous ? 'local' : 'cloud'],
    queryFn: async (): Promise<ProjectWithStats[]> => {
      // Modo anônimo: usa storage local
      if (isAnonymous) {
        const projects = await LocalStorage.getLocalProjects();
        
        // Calcula stats locais
        const projectsWithStats = await Promise.all(
          projects.map(async (project) => {
            const documents = await LocalStorage.getLocalDocuments(project.id);
            const annotations = await LocalStorage.getLocalAnnotations();
            const projectAnnotations = annotations.filter(a => 
              documents.some(d => d.id === a.document_id)
            );
            
            return {
              ...project,
              documents_count: documents.length,
              annotations_count: projectAnnotations.length,
            };
          })
        );
        
        return projectsWithStats;
      }
      
      // Modo autenticado: usa Supabase
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          documents (id)
        `)
        .order('last_accessed_at', { ascending: false });

      if (error) throw error;

      // Calculate stats for each project
      const projectsWithStats = await Promise.all(
        (data || []).map(async (project) => {
          const { count: annotationsCount } = await supabase
            .from('annotations')
            .select('*', { count: 'exact', head: true })
            .in('document_id', project.documents?.map((d: any) => d.id) || []);

          return {
            ...project,
            documents_count: project.documents?.length || 0,
            annotations_count: annotationsCount || 0,
          };
        })
      );

      return projectsWithStats;
    },
  });
}

/**
 * Fetch a single project by ID
 */
export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: async (): Promise<ProjectWithStats> => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          documents (id)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      const { count: annotationsCount } = await supabase
        .from('annotations')
        .select('*', { count: 'exact', head: true })
        .in('document_id', data.documents?.map((d: any) => d.id) || []);

      return {
        ...data,
        documents_count: data.documents?.length || 0,
        annotations_count: annotationsCount || 0,
      };
    },
    enabled: !!id,
  });
}

/**
 * Create a new project
 */
export function useCreateProject() {
  const queryClient = useQueryClient();
  const { isAnonymous } = useAuth();

  return useMutation<Project, Error, Omit<ProjectInsert, 'user_id'>>({
    mutationFn: async (project: Omit<ProjectInsert, 'user_id'>): Promise<Project> => {
      // Modo anônimo: usa storage local
      if (isAnonymous) {
        return await LocalStorage.createLocalProject(project);
      }
      
      // Modo autenticado: usa Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...project,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

/**
 * Update an existing project
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { isAnonymous } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ProjectUpdate & { id: string }) => {
      // Modo anônimo: usa storage local
      if (isAnonymous) {
        return await LocalStorage.updateLocalProject(id, updates as any);
      }
      
      // Modo autenticado: usa Supabase
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', data.id] });
    },
  });
}

/**
 * Delete a project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { isAnonymous } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      // Modo anônimo: usa storage local
      if (isAnonymous) {
        await LocalStorage.deleteLocalProject(id);
        return;
      }
      
      // Modo autenticado: usa Supabase
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

/**
 * Update project's last accessed time
 */
export function useUpdateProjectAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

