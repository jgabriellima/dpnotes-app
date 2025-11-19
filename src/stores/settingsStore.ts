/**
 * Settings Store
 * 
 * Manages app settings with AsyncStorage persistence
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_STORAGE_KEY = '@dpnotes/settings';

export type ScrollPosition = 'left' | 'right';
export type FontSize = 'small' | 'medium' | 'large';
export type Theme = 'light' | 'dark';

export interface AppSettings {
  scrollPosition: ScrollPosition;
  fontSize: FontSize;
  theme: Theme;
  highContrast: boolean;
}

interface SettingsState {
  settings: AppSettings;
  isLoaded: boolean;
  
  // Actions
  loadSettings: () => Promise<void>;
  updateScrollPosition: (position: ScrollPosition) => Promise<void>;
  updateFontSize: (size: FontSize) => Promise<void>;
  updateTheme: (theme: Theme) => Promise<void>;
  updateHighContrast: (enabled: boolean) => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
}

// Default settings
const DEFAULT_SETTINGS: AppSettings = {
  scrollPosition: 'left',
  fontSize: 'medium',
  theme: 'light',
  highContrast: false,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoaded: false,

  loadSettings: async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const settings = JSON.parse(stored);
        set({ settings, isLoaded: true });
        console.log('⚙️ [Settings] Loaded:', settings);
      } else {
        set({ isLoaded: true });
        console.log('⚙️ [Settings] Using defaults');
      }
    } catch (error) {
      console.error('❌ [Settings] Load error:', error);
      set({ isLoaded: true });
    }
  },

  updateScrollPosition: async (position: ScrollPosition) => {
    const { settings } = get();
    const updated = { ...settings, scrollPosition: position };
    set({ settings: updated });
    await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    console.log('⚙️ [Settings] Updated scroll position:', position);
  },

  updateFontSize: async (size: FontSize) => {
    const { settings } = get();
    const updated = { ...settings, fontSize: size };
    set({ settings: updated });
    await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    console.log('⚙️ [Settings] Updated font size:', size);
  },

  updateTheme: async (theme: Theme) => {
    const { settings } = get();
    const updated = { ...settings, theme };
    set({ settings: updated });
    await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    console.log('⚙️ [Settings] Updated theme:', theme);
  },

  updateHighContrast: async (enabled: boolean) => {
    const { settings } = get();
    const updated = { ...settings, highContrast: enabled };
    set({ settings: updated });
    await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    console.log('⚙️ [Settings] Updated high contrast:', enabled);
  },

  updateSettings: async (updates: Partial<AppSettings>) => {
    const { settings } = get();
    const updated = { ...settings, ...updates };
    set({ settings: updated });
    await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    console.log('⚙️ [Settings] Updated multiple settings:', updates);
  },
}));

