/**
 * WebView Selectable Editor
 * 
 * Usa WebView como engine de seleção (browser nativo)
 * Performance e UX nativos do browser
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { buildHtmlFromMarkdown } from '../../utils/htmlTemplate';
import { injectAnnotationsIntoHtml } from '../../utils/annotationInjector';
import { EmptyState } from './EmptyState';
import { useSettingsStore } from '../../stores/settingsStore';
import type { Annotation } from '../../types/editor.types';

export interface SelectionData {
  text: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  wordIds: string[];
}

interface WebViewSelectableEditorProps {
  content: string;
  annotations?: Annotation[];
  onSelectionChange?: (data: SelectionData) => void;
  onAnnotationPress?: (annotation: Annotation, rect?: { x: number; y: number; width: number; height: number }) => void;
  onImportPress?: () => void;
  isImporting?: boolean;
}

type SelectionInfo = {
  text: string;
  rect: { x: number; y: number; width: number; height: number };
};

// Função simples para converter texto em HTML (sem marked)
function textToHtml(text: string): string {
  // Converte quebras de linha em parágrafos
  const paragraphs = text
    .split(/\n\n+/)
    .filter(p => p.trim().length > 0)
    .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('\n');
  
  return paragraphs || '<p>Sem conteúdo</p>';
}

/**
 * Calculate wordIds based on the position of selected text in the full content
 * Returns array of wordIds in format: ["p0-w5", "p0-w6", "p0-w7"]
 */
function calculateWordIds(fullContent: string, selectedText: string): string[] {
  if (!selectedText || !fullContent) return [];
  
  // Find where the selected text appears in the full content
  const selectedStartIndex = fullContent.indexOf(selectedText);
  if (selectedStartIndex === -1) {
    console.warn('⚠️ Selected text not found in content');
    return [];
  }
  
  // Split content into paragraphs
  const paragraphs = fullContent.split(/\n\n+/);
  
  let currentCharIndex = 0;
  let wordIds: string[] = [];
  let found = false;
  
  // Process each paragraph to find the selection
  for (let paraIndex = 0; paraIndex < paragraphs.length; paraIndex++) {
    const para = paragraphs[paraIndex];
    const paraStartIndex = currentCharIndex;
    const paraEndIndex = paraStartIndex + para.length;
    
    // Check if selection is in this paragraph
    if (selectedStartIndex >= paraStartIndex && selectedStartIndex < paraEndIndex) {
      // Calculate relative position within paragraph
      const relativeStart = selectedStartIndex - paraStartIndex;
      const relativeEnd = relativeStart + selectedText.length;
      
      // Split paragraph into words
      const words = para.split(/(\s+)/); // Keep whitespace
      let currentWordCharIndex = 0;
      let wordIndex = 0;
      
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        
        // Skip pure whitespace
        if (/^\s+$/.test(word)) {
          currentWordCharIndex += word.length;
          continue;
        }
        
        const wordStart = currentWordCharIndex;
        const wordEnd = wordStart + word.length;
        
        // Check if this word overlaps with the selection
        if (wordEnd > relativeStart && wordStart < relativeEnd) {
          wordIds.push(`p${paraIndex}-w${wordIndex}`);
        }
        
        currentWordCharIndex += word.length;
        wordIndex++;
        
        // Stop if we've passed the selection
        if (wordStart >= relativeEnd) {
          found = true;
          break;
        }
      }
      
      if (found) break;
    }
    
    // Account for paragraph separator (double newline)
    currentCharIndex = paraEndIndex + 2; // +2 for \n\n
    
    if (found) break;
  }
  
  console.log('🔍 Word ID calculation:', {
    selectedText: selectedText.substring(0, 30) + '...',
    selectedStartIndex,
    wordIds,
  });
  
  return wordIds;
}

export function WebViewSelectableEditor({
  content,
  annotations = [],
  onSelectionChange,
  onAnnotationPress,
  onImportPress,
  isImporting = false,
}: WebViewSelectableEditorProps) {
  
  const [selection, setSelection] = React.useState<SelectionInfo | null>(null);
  const { settings } = useSettingsStore();
  const systemColorScheme = useColorScheme();
  
  // Determine effective theme
  const isDark = settings.theme === 'dark' || (settings.theme === 'light' ? false : systemColorScheme === 'dark');
  const backgroundColor = isDark ? '#1a1a1a' : '#ffffff';
  
  // Font size mapping
  const fontSizeMap = {
    small: 15,
    medium: 17,
    large: 19,
  };

  // Convert text to HTML with annotations and settings
  const html = React.useMemo(() => {
    if (!content || content.trim().length === 0) return '';
    
    try {
      // Determine effective theme for annotations
      // Use settings.theme directly (it's already 'light' or 'dark')
      const effectiveTheme = settings.theme;
      
      console.log('🔄 [WebViewEditor] Regenerating HTML with annotations and settings:', {
        contentLength: content.length,
        annotationsCount: annotations?.length || 0,
        fontSize: settings.fontSize,
        theme: effectiveTheme,
        scrollPosition: settings.scrollPosition,
      });
      
      // Inject annotations into HTML with theme support
      const htmlWithAnnotations = injectAnnotationsIntoHtml(
        content, 
        annotations || [], 
        effectiveTheme
      );
      return buildHtmlFromMarkdown(
        htmlWithAnnotations,
        fontSizeMap[settings.fontSize],
        settings.scrollPosition,
        effectiveTheme,
        settings.highContrast,
        settings.scrollAreaWidth
      );
    } catch (error) {
      console.error('❌ Error converting text:', error);
      // Fallback without annotations
      const simpleHtml = textToHtml(content);
      return buildHtmlFromMarkdown(
        simpleHtml,
        fontSizeMap[settings.fontSize],
        settings.scrollPosition,
        settings.theme,
        settings.highContrast,
        settings.scrollAreaWidth
      );
    }
  }, [content, annotations, settings, systemColorScheme]);
  
  // Handle messages from WebView
  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('📨 Message from WebView:', data);
      
      // Handle annotation clicks
      if (data.type === 'ANNOTATION_CLICKED') {
        console.log('🎯 Annotation clicked:', data.annotationId);
        
        // Find the annotation
        const annotation = annotations?.find(a => a.id === data.annotationId);
        if (annotation && onAnnotationPress) {
          // Pass the rect to position the popover correctly
          onAnnotationPress(annotation, data.rect);
        }
        return;
      }
      
      // Handle selection cleared
      if (data.type === 'SELECTION_CLEARED') {
        console.log('🧹 Clearing selection');
        setSelection(null);
        
        // Notify parent that selection was cleared
        if (onSelectionChange) {
          onSelectionChange({
            text: '',
            bounds: null,
            wordIds: [],
          });
        }
        return;
      }
      
      // Handle selection changed
      if (data.type === 'SELECTION_CHANGED') {
        if (!data.text || !data.text.trim()) {
          console.log('🧹 Empty text, clearing selection');
          setSelection(null);
          
          // Notify parent that selection was cleared
          if (onSelectionChange) {
            onSelectionChange({
              text: '',
              bounds: null,
              wordIds: [],
            });
          }
          return;
        }
        
        const selectionInfo: SelectionInfo = {
          text: data.text,
          rect: data.rect,
        };
        
        console.log('✅ Selection set:', selectionInfo.text.substring(0, 30) + '...');
        setSelection(selectionInfo);
        
        // Notify parent
        if (onSelectionChange) {
          // Calculate real wordIds based on position in the full text
          const wordIds = calculateWordIds(content, data.text);
          
          console.log('📍 Calculated wordIds:', wordIds);
          
          onSelectionChange({
            text: data.text,
            bounds: data.rect,
            wordIds,
          });
        }
      }
    } catch (error) {
      console.error('❌ Error parsing WebView message:', error);
    }
  };
  
  // Empty state
  if (!content || content.trim().length === 0) {
    return (
      <EmptyState 
        onImportPress={onImportPress || (() => {})} 
        isLoading={isImporting}
      />
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Safe Scroll Area Indicator - Position based on settings */}
      <View style={[
        styles.safeScrollIndicator,
        { width: settings.scrollAreaWidth },
        settings.scrollPosition === 'right' ? styles.safeScrollRight : styles.safeScrollLeft
      ]}>
        <View style={styles.scrollArrow}>
          <Text style={[styles.arrowText, { color: isDark ? '#a0a0a0' : '#6b7280' }]}>▲</Text>
        </View>
        <View style={[styles.scrollLine, { backgroundColor: isDark ? '#3a3a3a' : '#e5e7eb' }]} />
        <View style={styles.scrollArrow}>
          <Text style={[styles.arrowText, { color: isDark ? '#a0a0a0' : '#6b7280' }]}>▼</Text>
        </View>
      </View>
      
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={[styles.webView, { backgroundColor }]}
        onMessage={handleMessage}
        javaScriptEnabled
        textZoom={100}
        showsVerticalScrollIndicator
        bounces
        scrollEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  safeScrollIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    pointerEvents: 'box-none', // Allow touches to pass through
  },
  safeScrollLeft: {
    left: 0,
  },
  safeScrollRight: {
    right: 0,
  },
  scrollArrow: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.2,
  },
  arrowText: {
    fontSize: 14,
  },
  scrollLine: {
    width: 1,
    flex: 1,
    marginVertical: 8,
    opacity: 0.3,
  },
});

