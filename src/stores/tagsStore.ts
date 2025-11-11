/**
 * Tags Store
 * 
 * Zustand store for managing tags with usage tracking
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Tag, TagWithUsage } from '../types/editor.types';

const TAGS_STORAGE_KEY = '@deep-research-notes:tags';

interface TagsState {
  tags: TagWithUsage[];
  isLoaded: boolean;
  loadTags: () => Promise<void>;
  addTag: (tag: Tag) => void;
  incrementUsage: (label: string) => void;
  updateTag: (label: string, updates: Partial<Tag>) => void;
  deleteTag: (label: string) => void;
}

export const useTagsStore = create<TagsState>((set, get) => ({
  tags: [],
  isLoaded: false,

  loadTags: async () => {
    try {
      const stored = await AsyncStorage.getItem(TAGS_STORAGE_KEY);
      if (stored) {
        const tags = JSON.parse(stored) as TagWithUsage[];
        // Sort by usage count descending
        const sorted = tags.sort((a, b) => b.usageCount - a.usageCount);
        set({ tags: sorted, isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch (error) {
      console.error('Error loading tags:', error);
      set({ isLoaded: true });
    }
  },

  addTag: (tag: Tag) => {
    const { tags } = get();
    
    // Check if tag already exists
    const existing = tags.find(t => t.label === tag.label);
    if (existing) {
      // Increment usage if it exists
      get().incrementUsage(tag.label);
      return;
    }

    // Add new tag with usage count 1
    const newTag: TagWithUsage = {
      ...tag,
      usageCount: 1,
    };

    const updated = [...tags, newTag].sort((a, b) => b.usageCount - a.usageCount);
    set({ tags: updated });

    // Persist to AsyncStorage
    AsyncStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(updated)).catch(error => {
      console.error('Error saving tags:', error);
    });
  },

  incrementUsage: (label: string) => {
    const { tags } = get();
    
    const updated = tags.map(tag =>
      tag.label === label
        ? { ...tag, usageCount: tag.usageCount + 1 }
        : tag
    ).sort((a, b) => b.usageCount - a.usageCount);

    set({ tags: updated });

    // Persist to AsyncStorage
    AsyncStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(updated)).catch(error => {
      console.error('Error saving tags:', error);
    });
  },

  updateTag: (label: string, updates: Partial<Tag>) => {
    const { tags } = get();
    
    const updated = tags.map(tag =>
      tag.label === label
        ? { ...tag, ...updates }
        : tag
    );

    set({ tags: updated });

    // Persist to AsyncStorage
    AsyncStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(updated)).catch(error => {
      console.error('Error saving tags:', error);
    });
  },

  deleteTag: (label: string) => {
    const { tags } = get();
    
    const updated = tags.filter(tag => tag.label !== label);
    set({ tags: updated });

    // Persist to AsyncStorage
    AsyncStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(updated)).catch(error => {
      console.error('Error saving tags:', error);
    });
  },
}));

