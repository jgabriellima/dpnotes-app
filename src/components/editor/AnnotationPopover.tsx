/**
 * AnnotationPopover Component
 * 
 * Minimal inline popover for annotations
 * Everything happens inline: text input, audio recorder, tags
 */

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, TextInput, KeyboardAvoidingView, Platform, Keyboard, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Icon } from '../ui/Icon';
import { AudioRecorder } from '../audio/AudioRecorder';
import { AudioPlayer } from '../audio/AudioPlayer';
import { useTagsStore } from '../../stores/tagsStore';
import { useSettingsStore } from '../../stores/settingsStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const POPOVER_WIDTH = 280;
const ARROW_SIZE = 8;
const MARGIN = 16;

type PopoverMode = 'options' | 'text' | 'audio' | 'tags';

export interface PopoverPosition {
  x: number;
  y: number;
  width?: number;
  height?: number;
  touchX?: number;
  touchY?: number;
}

export interface AnnotationPopoverProps {
  visible: boolean;
  position?: PopoverPosition | null;
  selectedText: string;
  editingAnnotation?: Annotation | null;
  onTextNote: (note: string) => void;
  onAudioNote: (uri: string, duration: number, transcription?: string) => void;
  onTagsNote: (tags: string[]) => void;
  onUpdateAnnotation?: (annotationId: string, type: 'text' | 'audio' | 'tags', data: any) => void;
  onDeleteAnnotation?: (annotationId: string) => void;
  onClose: () => void;
  resetKey?: number; // Key to force reset on new selection
}

import type { Annotation } from '../../types/editor.types';

export function AnnotationPopover({
  visible,
  position,
  selectedText,
  editingAnnotation,
  onTextNote,
  onAudioNote,
  onTagsNote,
  onUpdateAnnotation,
  onDeleteAnnotation,
  onClose,
  resetKey = 0,
}: AnnotationPopoverProps) {
  const router = useRouter();
  const { tags } = useTagsStore();
  const { settings } = useSettingsStore();
  const systemColorScheme = useColorScheme();
  
  // Determine effective theme
  const isDark = settings.theme === 'dark' || (settings.theme === 'light' ? false : systemColorScheme === 'dark');
  
  const theme = {
    background: isDark ? '#1a1a1a' : '#ffffff',
    secondaryBg: isDark ? '#2a2a2a' : '#f5f5f5',
    tertiaryBg: isDark ? '#3a3a3a' : '#f9fafb',
    text: isDark ? '#ffffff' : '#1f2937',
    textSecondary: isDark ? '#a0a0a0' : '#6b7280',
    textTertiary: isDark ? '#707070' : '#9ca3af',
    border: isDark ? '#3a3a3a' : '#e5e7eb',
    inputBg: isDark ? '#2a2a2a' : '#ffffff',
    inputBorder: isDark ? '#3a3a3a' : '#e5e7eb',
    dragHandle: isDark ? '#4a4a4a' : '#d1d5db',
    // Icon backgrounds
    textIconBg: isDark ? '#ff6b5230' : '#FFE6E1',
    audioIconBg: isDark ? '#8b5cf630' : '#EDE9FE',
    tagsIconBg: isDark ? '#eab30830' : '#FEF3C7',
    // Accent colors (keep vibrant)
    accent: '#8b5cf6',
    accentLight: isDark ? '#8b5cf620' : '#ede9fe',
    error: '#ef4444',
    errorBg: isDark ? '#7f1d1d' : '#fee2e2',
  };
  
  const [mode, setMode] = useState<PopoverMode>('options');
  const [layout, setLayout] = useState({ x: 0, y: 0, showArrowTop: false });
  const [textInput, setTextInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [manualOffset, setManualOffset] = useState({ x: 0, y: 0 });
  
  // Reanimated shared values for better performance
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  
  const isEditing = !!editingAnnotation;

  // Helper function for logging from worklet (safe wrapper)
  const logDragRelease = (offsetX: number, offsetY: number) => {
    console.log('🎯 [Popover] Drag release:', {
      newOffset: { x: offsetX, y: offsetY },
    });
  };

  // Create Pan Gesture for dragging (runs on UI thread for better performance)
  const panGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      runOnJS(setIsDragging)(true);
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      'worklet';
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      'worklet';
      runOnJS(setIsDragging)(false);
      
      // Update manual offset in JS thread for state persistence
      const newOffsetX = translateX.value;
      const newOffsetY = translateY.value;
      
      runOnJS(setManualOffset)({ x: newOffsetX, y: newOffsetY });
      runOnJS(logDragRelease)(newOffsetX, newOffsetY);
    });

  // Listen to keyboard events
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Track if this is the first time popover opens in this session
  const isFirstOpen = useRef(true);
  const lastEditingAnnotationId = useRef<string | null>(null);

  // Reset completely when resetKey changes (new selection)
  useEffect(() => {
    console.log('🔄 [Popover] Reset triggered - clearing all state');
    
    // Reset all state to initial
    setMode('options');
    setTextInput('');
    setSelectedTags([]);
    setShowAudioRecorder(false);
    setManualOffset({ x: 0, y: 0 });
    translateX.value = 0;
    translateY.value = 0;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    hasInitialPosition.current = false; // ⭐ CRITICAL: Reset position flag too!
    isFirstOpen.current = true;
    lastEditingAnnotationId.current = null;
  }, [resetKey]);

  // Reset or populate mode when popover becomes visible
  useEffect(() => {
    if (!visible) {
      // Reset flag when popover closes
      isFirstOpen.current = true;
      lastEditingAnnotationId.current = null;
      return;
    }

    // Only run when visible = true from here on
    
    // Only reset offset on first open of this popover session
    if (isFirstOpen.current) {
      console.log('🔄 [Popover] First open - resetting manual offset');
      setManualOffset({ x: 0, y: 0 });
      translateX.value = 0;
      translateY.value = 0;
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
      isFirstOpen.current = false;
    }
    
    // Only update mode if annotation changed or it's a new session
    const currentAnnotationId = editingAnnotation?.id || null;
    if (lastEditingAnnotationId.current === currentAnnotationId && mode !== 'options') {
      console.log('⏩ [Popover] Skipping mode update - same annotation');
      return;
    }
    
    lastEditingAnnotationId.current = currentAnnotationId;
    
    if (editingAnnotation) {
      console.log('✏️ [Popover] Editing annotation:', {
        id: editingAnnotation.id,
        type: editingAnnotation.type,
      });
      
      // Editing mode - pre-populate data
      if (editingAnnotation.type === 'text') {
        setMode('text');
        setTextInput(editingAnnotation.textNote || '');
        setSelectedTags([]);
        setShowAudioRecorder(false);
      } else if (editingAnnotation.type === 'audio') {
        console.log('🎵 [Popover] Setting audio mode with player');
        Keyboard.dismiss();
        setMode('audio');
        setTextInput('');
        setSelectedTags([]);
        setShowAudioRecorder(false);
      } else if (editingAnnotation.type === 'tags') {
        Keyboard.dismiss();
        setMode('tags');
        setTextInput('');
        setSelectedTags(editingAnnotation.tags?.map(t => t.label) || []);
        setShowAudioRecorder(false);
      }
    } else {
      console.log('➕ [Popover] New annotation mode');
      setMode('options');
      setTextInput('');
      setSelectedTags([]);
      setShowAudioRecorder(false);
    }
  }, [visible, editingAnnotation?.id]);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { 
        damping: 15,
        stiffness: 150,
      });
    } else {
      opacity.value = 0;
      scale.value = 0.9;
    }
  }, [visible]);

  // Calculate dynamic height based on mode
  const getPopoverHeight = () => {
    switch (mode) {
      case 'options': return 70; // Just the 3 buttons
      case 'text': return 150; // Input + button
      case 'audio': {
        // If editing and showing player (not recorder), smaller height
        if (isEditing && !showAudioRecorder) {
          return editingAnnotation?.transcription ? 240 : 180; // With/without transcription
        }
        return 220; // AudioRecorder
      }
      case 'tags': return Math.min(300, tags.length * 40 + 100); // Tags list + buttons
      default: return 70;
    }
  };

  // Track if we've already calculated initial position
  const hasInitialPosition = useRef(false);

  useEffect(() => {
    if (position && visible) {
      // Only recalculate position when popover first opens
      // Don't recalculate if already positioned or if user has dragged
      if (hasInitialPosition.current) {
        console.log('📍 [Popover] Keeping existing position (already positioned)');
        return;
      }

      const POPOVER_HEIGHT = getPopoverHeight();
      const touchX = position.touchX;
      const touchY = position.touchY;
      const availableHeight = SCREEN_HEIGHT - keyboardHeight;

      console.log('📍 [Popover] Calculating initial position:', {
        keyboardHeight,
        availableHeight,
        POPOVER_HEIGHT,
        touchY,
        SCREEN_HEIGHT,
      });

      let popoverX: number;
      let popoverY: number;
      let showArrowTop = true;

      if (touchX !== undefined && touchY !== undefined) {
        popoverX = touchX - POPOVER_WIDTH / 2;
        popoverX = Math.max(MARGIN, Math.min(popoverX, SCREEN_WIDTH - POPOVER_WIDTH - MARGIN));

        const SPACING = 16;
        popoverY = touchY + SPACING;
        showArrowTop = true;

        // Check if popover would be covered by keyboard
        if (popoverY + POPOVER_HEIGHT + MARGIN > availableHeight) {
          console.log('⚠️ [Popover] Would be covered by keyboard, repositioning above...');
          
          // Try to place it above the selection
          popoverY = touchY - POPOVER_HEIGHT - SPACING;
          showArrowTop = false;
          
          // If still doesn't fit above, place it at the top of available space
          if (popoverY < MARGIN) {
            console.log('⚠️ [Popover] Doesnt fit above, placing at top of available space');
            popoverY = MARGIN;
            showArrowTop = true;
          }
        }

        // Ensure popover doesn't go below available height (keyboard area)
        const maxY = availableHeight - POPOVER_HEIGHT - MARGIN;
        if (popoverY > maxY) {
          console.log('⚠️ [Popover] Adjusting to fit above keyboard');
          popoverY = maxY;
        }

        popoverY = Math.max(MARGIN, popoverY);
      } else {
        const selectionCenterX = position.x + (position.width || 0) / 2;
        const selectionBottomY = position.y + (position.height || 0);
        const selectionTopY = position.y;

        popoverX = selectionCenterX - POPOVER_WIDTH / 2;
        popoverX = Math.max(MARGIN, Math.min(popoverX, SCREEN_WIDTH - POPOVER_WIDTH - MARGIN));

        const SPACING = 24;
        const EXTRA_MARGIN = 8;
        popoverY = selectionBottomY + ARROW_SIZE + SPACING + EXTRA_MARGIN;

        // Check if popover would be covered by keyboard
        if (popoverY + POPOVER_HEIGHT + MARGIN > availableHeight) {
          console.log('⚠️ [Popover] Would be covered by keyboard, repositioning above...');
          
          popoverY = selectionTopY - POPOVER_HEIGHT - ARROW_SIZE - SPACING - EXTRA_MARGIN;
          showArrowTop = false;
          
          // If still doesn't fit above, place it in center of available space
          if (popoverY < MARGIN) {
            console.log('⚠️ [Popover] Doesnt fit above, centering in available space');
            popoverY = Math.max(MARGIN, (availableHeight - POPOVER_HEIGHT) / 2);
            showArrowTop = true;
          }
        }

        // Ensure popover doesn't go below available height (keyboard area)
        const maxY = availableHeight - POPOVER_HEIGHT - MARGIN;
        if (popoverY > maxY) {
          console.log('⚠️ [Popover] Adjusting to fit above keyboard');
          popoverY = maxY;
        }

        popoverY = Math.max(MARGIN, popoverY);
      }

      console.log('✅ [Popover] Final position (before manual offset):', { x: popoverX, y: popoverY, showArrowTop });
      
      // Store calculated position WITHOUT manual offset in layout
      // The manual offset will be applied via transform
      setLayout({ x: popoverX, y: popoverY, showArrowTop });
      hasInitialPosition.current = true;
    } else if (!visible) {
      // Reset when popover closes
      hasInitialPosition.current = false;
      setManualOffset({ x: 0, y: 0 });
      translateX.value = 0;
      translateY.value = 0;
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
    }
  }, [position, visible, keyboardHeight]); // Removed manualOffset from dependencies!

  const handleToggleTag = (tagLabel: string) => {
    setSelectedTags(prev => 
      prev.includes(tagLabel)
        ? prev.filter(t => t !== tagLabel)
        : [...prev, tagLabel]
    );
  };

  const handleConfirmText = () => {
    if (textInput.trim()) {
      if (isEditing && editingAnnotation) {
        onUpdateAnnotation?.(editingAnnotation.id, 'text', textInput.trim());
      } else {
        onTextNote(textInput.trim());
      }
      onClose();
    }
  };

  const handleConfirmTags = () => {
    if (selectedTags.length > 0) {
      if (isEditing && editingAnnotation) {
        onUpdateAnnotation?.(editingAnnotation.id, 'tags', selectedTags);
      } else {
        onTagsNote(selectedTags);
      }
      onClose();
    }
  };

  const handleDelete = () => {
    if (isEditing && editingAnnotation && onDeleteAnnotation) {
      onDeleteAnnotation(editingAnnotation.id);
      onClose();
    }
  };

  // Animated styles using useAnimatedStyle for better performance
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  if (!visible || !position) return null;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Animated.View 
        style={[
          styles.popover,
          {
            left: layout.x,
            top: layout.y,
            backgroundColor: theme.background,
          },
          animatedStyle,
        ]}
      >
        {/* Drag Handle with Gesture Detector */}
        <GestureDetector gesture={panGesture}>
          <View style={styles.dragHandleContainer}>
            <View style={[styles.dragHandle, { backgroundColor: theme.dragHandle }]} />
          </View>
        </GestureDetector>

        {/* Arrow */}
        <View 
          style={[
            styles.arrow,
            layout.showArrowTop ? [styles.arrowTop, { borderBottomColor: theme.background }] : [styles.arrowBottom, { borderTopColor: theme.background }],
            { 
              left: Math.max(0, Math.min(position.x + (position.width || 0) / 2 - layout.x - ARROW_SIZE, POPOVER_WIDTH - ARROW_SIZE * 2))
            },
          ]} 
        />

        {/* MODE: Options - 3 buttons (only for new annotations) */}
        {mode === 'options' && !isEditing && (
          <View style={styles.options}>
            <Pressable style={styles.option} onPress={() => setMode('text')}>
              <View style={[styles.iconContainer, { backgroundColor: theme.textIconBg }]}>
                <Icon name="edit" size={18} color="#ff6b52" />
              </View>
              <Text style={[styles.optionLabel, { color: theme.text }]}>Texto</Text>
            </Pressable>

            <Pressable style={styles.option} onPress={() => setMode('audio')}>
              <View style={[styles.iconContainer, { backgroundColor: theme.audioIconBg }]}>
                <Icon name="mic" size={18} color="#8b5cf6" />
              </View>
              <Text style={[styles.optionLabel, { color: theme.text }]}>Áudio</Text>
            </Pressable>

            <Pressable style={styles.option} onPress={() => setMode('tags')}>
              <View style={[styles.iconContainer, { backgroundColor: theme.tagsIconBg }]}>
                <Icon name="sell" size={18} color="#eab308" />
              </View>
              <Text style={[styles.optionLabel, { color: theme.text }]}>Tags</Text>
            </Pressable>
          </View>
        )}

        {/* MODE: Text Input */}
        {mode === 'text' && (
          <View style={styles.contentContainer}>
            {isEditing && (() => {
              const currentMode = mode as PopoverMode;
              return (
              <View style={[styles.typeTabs, { backgroundColor: theme.tertiaryBg }]}>
                <Pressable 
                  style={[styles.typeTab, currentMode === 'text' && [styles.typeTabActive, { backgroundColor: theme.background }]]}
                  onPress={() => setMode('text')}
                >
                  <Icon name="edit" size={16} color={currentMode === 'text' ? theme.accent : theme.textTertiary} />
                  <Text style={[styles.typeTabText, { color: theme.textTertiary }, currentMode === 'text' && [styles.typeTabTextActive, { color: theme.accent }]]}>Texto</Text>
                </Pressable>
                <Pressable 
                  style={[styles.typeTab, currentMode === 'audio' && [styles.typeTabActive, { backgroundColor: theme.background }]]}
                  onPress={() => setMode('audio')}
                >
                  <Icon name="mic" size={16} color={currentMode === 'audio' ? theme.accent : theme.textTertiary} />
                  <Text style={[styles.typeTabText, { color: theme.textTertiary }, currentMode === 'audio' && [styles.typeTabTextActive, { color: theme.accent }]]}>Áudio</Text>
                </Pressable>
                <Pressable 
                  style={[styles.typeTab, currentMode === 'tags' && [styles.typeTabActive, { backgroundColor: theme.background }]]}
                  onPress={() => setMode('tags')}
                >
                  <Icon name="sell" size={16} color={currentMode === 'tags' ? theme.accent : theme.textTertiary} />
                  <Text style={[styles.typeTabText, { color: theme.textTertiary }, currentMode === 'tags' && [styles.typeTabTextActive, { color: theme.accent }]]}>Tags</Text>
                </Pressable>
              </View>
              );
            })()}
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: theme.inputBg, 
                borderColor: theme.inputBorder, 
                color: theme.text 
              }]}
              placeholder="Adicione sua nota..."
              placeholderTextColor={theme.textSecondary}
              value={textInput}
              onChangeText={setTextInput}
              multiline
              autoFocus={!isEditing} // Only autofocus for NEW annotations, not when editing
              maxLength={500}
            />
            <View style={styles.actionButtons}>
              {isEditing ? (
                <>
                  <Pressable style={[styles.deleteButton, { backgroundColor: theme.errorBg }]} onPress={handleDelete}>
                    <Icon name="delete" size={20} color={theme.error} />
                  </Pressable>
                  <Pressable 
                    style={[styles.confirmButton, { backgroundColor: theme.accent }, !textInput.trim() && [styles.confirmButtonDisabled, { backgroundColor: theme.border }]]} 
                    onPress={handleConfirmText}
                    disabled={!textInput.trim()}
                  >
                    <Icon name="check" size={20} color="#ffffff" />
                    <Text style={styles.confirmButtonText}>Salvar</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Pressable style={[styles.backButton, { backgroundColor: theme.secondaryBg }]} onPress={() => setMode('options')}>
                    <Icon name="arrow_back" size={20} color={theme.textSecondary} />
                  </Pressable>
                  <Pressable 
                    style={[styles.confirmButton, { backgroundColor: theme.accent }, !textInput.trim() && [styles.confirmButtonDisabled, { backgroundColor: theme.border }]]} 
                    onPress={handleConfirmText}
                    disabled={!textInput.trim()}
                  >
                    <Icon name="check" size={20} color="#ffffff" />
                    <Text style={styles.confirmButtonText}>Confirmar</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        )}

        {/* MODE: Audio - Player or Recorder */}
        {mode === 'audio' && (
          <View style={styles.contentContainer}>
            {isEditing && (() => {
              const currentMode = mode as PopoverMode;
              return (
              <View style={[styles.typeTabs, { backgroundColor: theme.tertiaryBg }]}>
                <Pressable 
                  style={[styles.typeTab, currentMode === 'text' && [styles.typeTabActive, { backgroundColor: theme.background }]]}
                  onPress={() => setMode('text')}
                >
                  <Icon name="edit" size={16} color={currentMode === 'text' ? theme.accent : theme.textTertiary} />
                  <Text style={[styles.typeTabText, { color: theme.textTertiary }, currentMode === 'text' && [styles.typeTabTextActive, { color: theme.accent }]]}>Texto</Text>
                </Pressable>
                <Pressable 
                  style={[styles.typeTab, currentMode === 'audio' && [styles.typeTabActive, { backgroundColor: theme.background }]]}
                  onPress={() => setMode('audio')}
                >
                  <Icon name="mic" size={16} color={currentMode === 'audio' ? theme.accent : theme.textTertiary} />
                  <Text style={[styles.typeTabText, { color: theme.textTertiary }, currentMode === 'audio' && [styles.typeTabTextActive, { color: theme.accent }]]}>Áudio</Text>
                </Pressable>
                <Pressable 
                  style={[styles.typeTab, currentMode === 'tags' && [styles.typeTabActive, { backgroundColor: theme.background }]]}
                  onPress={() => setMode('tags')}
                >
                  <Icon name="sell" size={16} color={currentMode === 'tags' ? theme.accent : theme.textTertiary} />
                  <Text style={[styles.typeTabText, { color: theme.textTertiary }, currentMode === 'tags' && [styles.typeTabTextActive, { color: theme.accent }]]}>Tags</Text>
                </Pressable>
              </View>
              );
            })()}
            
            {/* Show AudioPlayer if editing and has audio */}
            {isEditing && editingAnnotation?.audioUri && !showAudioRecorder ? (
              <AudioPlayer
                key={`player-${editingAnnotation.id}`}
                audioUri={editingAnnotation.audioUri}
                transcription={editingAnnotation.transcription}
                onDelete={handleDelete}
                onReRecord={() => setShowAudioRecorder(true)}
              />
            ) : (
              /* Show AudioRecorder for new annotations or re-recording */
              <AudioRecorder
                key={`recorder-${visible ? 'active' : 'inactive'}-${mode}`}
                onRecordingComplete={(uri, duration, transcription) => {
                  console.log('🎤 [AnnotationPopover] Audio complete:', { uri, duration, transcription });
                  if (isEditing && editingAnnotation) {
                    onUpdateAnnotation?.(editingAnnotation.id, 'audio', { uri, duration, transcription });
                  } else {
                    onAudioNote(uri, duration, transcription);
                  }
                  setShowAudioRecorder(false);
                  onClose();
                }}
                maxDuration={120}
              />
            )}
            
            {/* Show back button only when NOT editing and in recorder mode */}
            {!isEditing && (
              <Pressable style={[styles.backButtonSingle, { backgroundColor: theme.secondaryBg }]} onPress={() => setMode('options')}>
                <Icon name="arrow_back" size={18} color={theme.textSecondary} />
                <Text style={[styles.backButtonText, { color: theme.textSecondary }]}>Voltar</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* MODE: Tags Selector */}
        {mode === 'tags' && (
          <View style={styles.contentContainer}>
            {isEditing && (() => {
              const currentMode = mode as PopoverMode;
              return (
              <View style={[styles.typeTabs, { backgroundColor: theme.tertiaryBg }]}>
                <Pressable 
                  style={[styles.typeTab, currentMode === 'text' && [styles.typeTabActive, { backgroundColor: theme.background }]]}
                  onPress={() => setMode('text')}
                >
                  <Icon name="edit" size={16} color={currentMode === 'text' ? theme.accent : theme.textTertiary} />
                  <Text style={[styles.typeTabText, { color: theme.textTertiary }, currentMode === 'text' && [styles.typeTabTextActive, { color: theme.accent }]]}>Texto</Text>
                </Pressable>
                <Pressable 
                  style={[styles.typeTab, currentMode === 'audio' && [styles.typeTabActive, { backgroundColor: theme.background }]]}
                  onPress={() => setMode('audio')}
                >
                  <Icon name="mic" size={16} color={currentMode === 'audio' ? theme.accent : theme.textTertiary} />
                  <Text style={[styles.typeTabText, { color: theme.textTertiary }, currentMode === 'audio' && [styles.typeTabTextActive, { color: theme.accent }]]}>Áudio</Text>
                </Pressable>
                <Pressable 
                  style={[styles.typeTab, currentMode === 'tags' && [styles.typeTabActive, { backgroundColor: theme.background }]]}
                  onPress={() => setMode('tags')}
                >
                  <Icon name="sell" size={16} color={currentMode === 'tags' ? theme.accent : theme.textTertiary} />
                  <Text style={[styles.typeTabText, { color: theme.textTertiary }, currentMode === 'tags' && [styles.typeTabTextActive, { color: theme.accent }]]}>Tags</Text>
                </Pressable>
              </View>
              );
            })()}
            <View style={styles.tagsContainer}>
              {tags.map((tag) => (
                <Pressable
                  key={tag.label}
                  style={[
                    styles.tagChip,
                    { 
                      backgroundColor: theme.secondaryBg, 
                      borderColor: theme.border 
                    },
                    selectedTags.includes(tag.label) && [styles.tagChipSelected, { 
                      backgroundColor: theme.accentLight, 
                      borderColor: theme.accent 
                    }],
                  ]}
                  onPress={() => handleToggleTag(tag.label)}
                >
                  <Text style={[
                    styles.tagChipText,
                    { color: theme.textSecondary },
                    selectedTags.includes(tag.label) && [styles.tagChipTextSelected, { color: theme.accent }],
                  ]}>
                    {tag.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            
            <Pressable 
              style={[styles.manageTagsButton, { 
                backgroundColor: theme.tertiaryBg, 
                borderColor: theme.border 
              }]}
              onPress={() => {
                onClose();
                router.push('/(tabs)/labels');
              }}
            >
              <Icon name="settings" size={16} color={theme.accent} />
              <Text style={[styles.manageTagsText, { color: theme.accent }]}>Gerenciar Tags</Text>
            </Pressable>

            <View style={styles.actionButtons}>
              {isEditing ? (
                <>
                  <Pressable style={[styles.deleteButton, { backgroundColor: theme.errorBg }]} onPress={handleDelete}>
                    <Icon name="delete" size={20} color={theme.error} />
                  </Pressable>
                  <Pressable 
                    style={[styles.confirmButton, { backgroundColor: theme.accent }, selectedTags.length === 0 && [styles.confirmButtonDisabled, { backgroundColor: theme.border }]]} 
                    onPress={handleConfirmTags}
                    disabled={selectedTags.length === 0}
                  >
                    <Icon name="check" size={20} color="#ffffff" />
                    <Text style={styles.confirmButtonText}>Salvar</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Pressable style={[styles.backButton, { backgroundColor: theme.secondaryBg }]} onPress={() => setMode('options')}>
                    <Icon name="arrow_back" size={20} color={theme.textSecondary} />
                  </Pressable>
                  <Pressable 
                    style={[styles.confirmButton, { backgroundColor: theme.accent }, selectedTags.length === 0 && [styles.confirmButtonDisabled, { backgroundColor: theme.border }]]} 
                    onPress={handleConfirmTags}
                    disabled={selectedTags.length === 0}
                  >
                    <Icon name="check" size={20} color="#ffffff" />
                    <Text style={styles.confirmButtonText}>Confirmar</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        )}
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'box-none',
  },
  popover: {
    position: 'absolute',
    width: POPOVER_WIDTH,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    paddingTop: 8,
  },
  dragHandleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  dragHandle: {
    width: 32,
    height: 4,
    borderRadius: 2,
  },
  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: ARROW_SIZE,
    borderRightWidth: ARROW_SIZE,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  arrowTop: {
    top: -ARROW_SIZE,
    borderBottomWidth: ARROW_SIZE,
  },
  arrowBottom: {
    bottom: -ARROW_SIZE,
    borderTopWidth: ARROW_SIZE,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  option: {
    alignItems: 'center',
    gap: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#374151',
  },
  contentContainer: {
    padding: 12,
    gap: 12,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    maxHeight: 120,
    textAlignVertical: 'top',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonSingle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 8,
  },
  confirmButtonDisabled: {
    // Dynamic color applied inline
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    maxHeight: 150,
  },
  tagChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  tagChipSelected: {
    // Dynamic colors applied inline
  },
  tagChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  tagChipTextSelected: {
    // Dynamic colors applied inline
  },
  manageTagsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  manageTagsText: {
    fontSize: 12,
    fontWeight: '500',
  },
  typeTabs: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
    borderRadius: 8,
    padding: 4,
  },
  typeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  typeTabActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  typeTabText: {
    fontSize: 12,
    fontWeight: '500',
  },
  typeTabTextActive: {
    fontWeight: '600',
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});


