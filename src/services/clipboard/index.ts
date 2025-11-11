/**
 * Clipboard Service
 * 
 * Elegant service for detecting and handling clipboard content.
 * Implements the clipboard detection flow from user journeys.
 */

import * as Clipboard from 'expo-clipboard';
import { AppState, type AppStateStatus } from 'react-native';
import { useEffect, useRef, useState, useCallback } from 'react';

interface ClipboardChange {
  content: string;
  timestamp: number;
}

/**
 * Hook to monitor clipboard changes when app comes to foreground
 */
export function useClipboardDetection(enabled = true) {
  const [clipboardContent, setClipboardContent] = useState<ClipboardChange | null>(null);
  const lastContent = useRef<string>('');

  const checkClipboard = useCallback(async () => {
    if (!enabled) return;

    try {
      const hasContent = await Clipboard.hasStringAsync();
      if (!hasContent) return;

      const content = await Clipboard.getStringAsync();
      
      // Only notify if content is different and substantial (> 10 chars)
      if (content && content !== lastContent.current && content.trim().length > 10) {
        lastContent.current = content;
        setClipboardContent({
          content,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error('Error checking clipboard:', error);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Check on mount
    checkClipboard();

    // Check when app comes to foreground
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        checkClipboard();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [enabled, checkClipboard]);

  const dismissClipboard = useCallback(() => {
    setClipboardContent(null);
  }, []);

  return {
    clipboardContent,
    dismissClipboard,
    checkClipboard,
  };
}

/**
 * Get clipboard content
 */
export async function getClipboardContent(): Promise<string | null> {
  try {
    const hasContent = await Clipboard.hasStringAsync();
    if (!hasContent) return null;

    return await Clipboard.getStringAsync();
  } catch (error) {
    console.error('Error getting clipboard content:', error);
    return null;
  }
}

/**
 * Set clipboard content
 */
export async function setClipboardContent(content: string): Promise<boolean> {
  try {
    await Clipboard.setStringAsync(content);
    return true;
  } catch (error) {
    console.error('Error setting clipboard content:', error);
    return false;
  }
}

/**
 * Check if clipboard has content
 */
export async function hasClipboardContent(): Promise<boolean> {
  try {
    return await Clipboard.hasStringAsync();
  } catch (error) {
    console.error('Error checking clipboard:', error);
    return false;
  }
}

export default {
  useClipboardDetection,
  getClipboardContent,
  setClipboardContent,
  hasClipboardContent,
};

