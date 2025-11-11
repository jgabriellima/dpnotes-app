/**
 * Labels Hook
 * 
 * React Query hooks for managing labels (tags) with Supabase
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase/client';
import type { Database } from '../types/database.types';

type Label = Database['public']['Tables']['labels']['Row'];
type LabelInsert = Database['public']['Tables']['labels']['Insert'];
type LabelUpdate = Database['public']['Tables']['labels']['Update'];

/**
 * Fetch all labels (predefined + user's custom)
 */
export function useLabels(projectId?: string) {
  return useQuery({
    queryKey: ['labels', projectId],
    queryFn: async (): Promise<Label[]> => {
      let query = supabase
        .from('labels')
        .select('*')
        .order('is_predefined', { ascending: false })
        .order('usage_count', { ascending: false });

      // Get predefined labels + user's labels for this project
      if (projectId) {
        query = query.or(`is_predefined.eq.true,project_id.eq.${projectId}`);
      } else {
        query = query.eq('is_predefined', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
  });
}

/**
 * Fetch predefined labels only
 */
export function usePredefinedLabels() {
  return useQuery({
    queryKey: ['labels', 'predefined'],
    queryFn: async (): Promise<Label[]> => {
      const { data, error } = await supabase
        .from('labels')
        .select('*')
        .eq('is_predefined', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}

/**
 * Fetch user's custom labels
 */
export function useCustomLabels(projectId?: string) {
  return useQuery({
    queryKey: ['labels', 'custom', projectId],
    queryFn: async (): Promise<Label[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('labels')
        .select('*')
        .eq('is_predefined', false)
        .eq('user_id', user.id)
        .order('usage_count', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
  });
}

/**
 * Create a new custom label
 */
export function useCreateLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (label: Omit<LabelInsert, 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('labels')
        .insert({
          ...label,
          user_id: user.id,
          is_predefined: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
    },
  });
}

/**
 * Update a label
 */
export function useUpdateLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: LabelUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('labels')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
    },
  });
}

/**
 * Delete a label (only custom labels)
 */
export function useDeleteLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('labels')
        .delete()
        .eq('id', id)
        .eq('is_predefined', false); // Safety check

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
    },
  });
}

