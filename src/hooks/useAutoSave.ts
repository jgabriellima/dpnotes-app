/**
 * Auto-Save Hook
 * 
 * Debounced auto-save for document content with visual feedback.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useUpdateDocumentContent } from './useDocuments';

export interface AutoSaveStatus {
  isSaving: boolean;
  lastSaved: Date | null;
  error: Error | null;
}

/**
 * Auto-save hook with debouncing
 * 
 * @param documentId - The document ID to save
 * @param content - The content to save
 * @param delay - Debounce delay in milliseconds (default: 2000ms)
 * @param enabled - Whether auto-save is enabled (default: true)
 * @returns Status object with saving state and last saved time
 * 
 * @example
 * const { isSaving, lastSaved, error } = useAutoSave(docId, content, 2000);
 */
export function useAutoSave(
  documentId: string,
  content: string,
  delay: number = 2000,
  enabled: boolean = true
): AutoSaveStatus {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const updateContent = useUpdateDocumentContent();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastContentRef = useRef<string>(content);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled || !documentId) {
      return;
    }

    // Skip if content hasn't changed
    if (content === lastContentRef.current) {
      return;
    }

    lastContentRef.current = content;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(async () => {
      if (!isMountedRef.current) return;

      setIsSaving(true);
      setError(null);

      try {
        await updateContent.mutateAsync({ id: documentId, content });
        
        if (isMountedRef.current) {
          setLastSaved(new Date());
          setError(null);
        }
      } catch (err) {
        console.error('Auto-save failed:', err);
        if (isMountedRef.current) {
          setError(err as Error);
        }
      } finally {
        if (isMountedRef.current) {
          setIsSaving(false);
        }
      }
    }, delay);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, documentId, delay, enabled, updateContent]);

  return { isSaving, lastSaved, error };
}

/**
 * Format the last saved time for display
 * 
 * @param lastSaved - The last saved date
 * @returns Formatted string
 * 
 * @example
 * const displayText = formatLastSaved(lastSaved);
 * // Returns: "Saved just now" or "Saved 2 minutes ago"
 */
export function formatLastSaved(lastSaved: Date | null): string {
  if (!lastSaved) {
    return 'Not saved';
  }

  const now = new Date();
  const diffInMs = now.getTime() - lastSaved.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);

  if (diffInSeconds < 10) {
    return 'Saved just now';
  } else if (diffInSeconds < 60) {
    return `Saved ${diffInSeconds} seconds ago`;
  } else if (diffInMinutes === 1) {
    return 'Saved 1 minute ago';
  } else if (diffInMinutes < 60) {
    return `Saved ${diffInMinutes} minutes ago`;
  } else {
    const hours = Math.floor(diffInMinutes / 60);
    return `Saved ${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
}

/**
 * Get save status indicator text
 * 
 * @param status - Auto-save status
 * @returns Status text
 */
export function getSaveStatusText(status: AutoSaveStatus): string {
  if (status.error) {
    return 'Save failed';
  }
  if (status.isSaving) {
    return 'Saving...';
  }
  if (status.lastSaved) {
    return formatLastSaved(status.lastSaved);
  }
  return 'Not saved';
}

/**
 * Get save status color
 * 
 * @param status - Auto-save status
 * @returns Color code
 */
export function getSaveStatusColor(status: AutoSaveStatus): string {
  if (status.error) {
    return '#ef4444'; // red
  }
  if (status.isSaving) {
    return '#3b82f6'; // blue
  }
  if (status.lastSaved) {
    return '#10b981'; // green
  }
  return '#6b7280'; // gray
}

