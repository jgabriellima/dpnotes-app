/**
 * AnnotationPopover Component
 * 
 * Minimal inline popover for annotations
 * Everything happens inline: text input, audio recorder, tags
 */

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, Animated, TextInput, KeyboardAvoidingView, Platform, Keyboard, PanResponder } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '../ui/Icon';
import { AudioRecorder } from '../audio/AudioRecorder';
import { AudioPlayer } from '../audio/AudioPlayer';
import { useTagsStore } from '../../stores/tagsStore';

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
  
  const [mode, setMode] = useState<PopoverMode>('options');
  const [layout, setLayout] = useState({ x: 0, y: 0, showArrowTop: false });
  const [textInput, setTextInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [manualOffset, setManualOffset] = useState({ x: 0, y: 0 });
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const panX = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;
  const isEditing = !!editingAnnotation;

  // Create PanResponder for dragging
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true);
        // Set offset to current manual offset, and value to 0
        // This allows the drag to start from the current position
        panX.setOffset(manualOffset.x);
        panY.setOffset(manualOffset.y);
        panX.setValue(0);
        panY.setValue(0);
      },
      onPanResponderMove: Animated.event(
        [null, { dx: panX, dy: panY }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gesture) => {
        setIsDragging(false);
        
        // Calculate new offset by adding gesture delta
        const newOffsetX = manualOffset.x + gesture.dx;
        const newOffsetY = manualOffset.y + gesture.dy;
        
        console.log('🎯 [Popover] Drag release:', {
          oldOffset: manualOffset,
          gesture: { dx: gesture.dx, dy: gesture.dy },
          newOffset: { x: newOffsetX, y: newOffsetY },
        });
        
        // Flatten offset into value FIRST (before updating state)
        panX.flattenOffset();
        panY.flattenOffset();
        
        // Now update the manual offset state
        setManualOffset({ x: newOffsetX, y: newOffsetY });
        
        // And set the animated values to the new offset
        // (they're already at newOffset because of flattenOffset, but let's be explicit)
        panX.setValue(newOffsetX);
        panY.setValue(newOffsetY);
      },
    })
  ).current;

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
    panX.setValue(0);
    panY.setValue(0);
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
      panX.setValue(0);
      panY.setValue(0);
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
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible, fadeAnim]);

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
      panX.setValue(0);
      panY.setValue(0);
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
            opacity: fadeAnim,
            transform: [
              {
                translateX: panX,
              },
              {
                translateY: panY,
              },
              {
                scale: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1],
                }),
              },
            ],
          },
        ]}
      >
        {/* Drag Handle */}
        <View style={styles.dragHandleContainer} {...panResponder.panHandlers}>
          <View style={styles.dragHandle} />
        </View>

        {/* Arrow */}
        <View 
          style={[
            styles.arrow,
            layout.showArrowTop ? styles.arrowTop : styles.arrowBottom,
            { 
              left: Math.max(0, Math.min(position.x + (position.width || 0) / 2 - layout.x - ARROW_SIZE, POPOVER_WIDTH - ARROW_SIZE * 2))
            },
          ]} 
        />

        {/* MODE: Options - 3 buttons (only for new annotations) */}
        {mode === 'options' && !isEditing && (
          <View style={styles.options}>
            <Pressable style={styles.option} onPress={() => setMode('text')}>
              <View style={[styles.iconContainer, styles.textIcon]}>
                <Icon name="edit" size={18} color="#ff6b52" />
              </View>
              <Text style={styles.optionLabel}>Texto</Text>
            </Pressable>

            <Pressable style={styles.option} onPress={() => setMode('audio')}>
              <View style={[styles.iconContainer, styles.audioIcon]}>
                <Icon name="mic" size={18} color="#8b5cf6" />
              </View>
              <Text style={styles.optionLabel}>Áudio</Text>
            </Pressable>

            <Pressable style={styles.option} onPress={() => setMode('tags')}>
              <View style={[styles.iconContainer, styles.tagsIcon]}>
                <Icon name="sell" size={18} color="#eab308" />
              </View>
              <Text style={styles.optionLabel}>Tags</Text>
            </Pressable>
          </View>
        )}

        {/* MODE: Text Input */}
        {mode === 'text' && (
          <View style={styles.contentContainer}>
            {isEditing && (
              <View style={styles.typeTabs}>
                <Pressable 
                  style={[styles.typeTab, mode === 'text' && styles.typeTabActive]}
                  onPress={() => setMode('text')}
                >
                  <Icon name="edit" size={16} color={mode === 'text' ? '#8b5cf6' : '#9ca3af'} />
                  <Text style={[styles.typeTabText, mode === 'text' && styles.typeTabTextActive]}>Texto</Text>
                </Pressable>
                <Pressable 
                  style={[styles.typeTab, mode === 'audio' && styles.typeTabActive]}
                  onPress={() => setMode('audio')}
                >
                  <Icon name="mic" size={16} color={mode === 'audio' ? '#8b5cf6' : '#9ca3af'} />
                  <Text style={[styles.typeTabText, mode === 'audio' && styles.typeTabTextActive]}>Áudio</Text>
                </Pressable>
                <Pressable 
                  style={[styles.typeTab, mode === 'tags' && styles.typeTabActive]}
                  onPress={() => setMode('tags')}
                >
                  <Icon name="sell" size={16} color={mode === 'tags' ? '#8b5cf6' : '#9ca3af'} />
                  <Text style={[styles.typeTabText, mode === 'tags' && styles.typeTabTextActive]}>Tags</Text>
                </Pressable>
              </View>
            )}
            <TextInput
              style={styles.textInput}
              placeholder="Adicione sua nota..."
              value={textInput}
              onChangeText={setTextInput}
              multiline
              autoFocus={!isEditing} // Only autofocus for NEW annotations, not when editing
              maxLength={500}
            />
            <View style={styles.actionButtons}>
              {isEditing ? (
                <>
                  <Pressable style={styles.deleteButton} onPress={handleDelete}>
                    <Icon name="delete" size={20} color="#ef4444" />
                  </Pressable>
                  <Pressable 
                    style={[styles.confirmButton, !textInput.trim() && styles.confirmButtonDisabled]} 
                    onPress={handleConfirmText}
                    disabled={!textInput.trim()}
                  >
                    <Icon name="check" size={20} color="#ffffff" />
                    <Text style={styles.confirmButtonText}>Salvar</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Pressable style={styles.backButton} onPress={() => setMode('options')}>
                    <Icon name="arrow_back" size={20} color="#6b7280" />
                  </Pressable>
                  <Pressable 
                    style={[styles.confirmButton, !textInput.trim() && styles.confirmButtonDisabled]} 
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
            {isEditing && (
              <View style={styles.typeTabs}>
                <Pressable 
                  style={[styles.typeTab, mode === 'text' && styles.typeTabActive]}
                  onPress={() => setMode('text')}
                >
                  <Icon name="edit" size={16} color={mode === 'text' ? '#8b5cf6' : '#9ca3af'} />
                  <Text style={[styles.typeTabText, mode === 'text' && styles.typeTabTextActive]}>Texto</Text>
                </Pressable>
                <Pressable 
                  style={[styles.typeTab, mode === 'audio' && styles.typeTabActive]}
                  onPress={() => setMode('audio')}
                >
                  <Icon name="mic" size={16} color={mode === 'audio' ? '#8b5cf6' : '#9ca3af'} />
                  <Text style={[styles.typeTabText, mode === 'audio' && styles.typeTabTextActive]}>Áudio</Text>
                </Pressable>
                <Pressable 
                  style={[styles.typeTab, mode === 'tags' && styles.typeTabActive]}
                  onPress={() => setMode('tags')}
                >
                  <Icon name="sell" size={16} color={mode === 'tags' ? '#8b5cf6' : '#9ca3af'} />
                  <Text style={[styles.typeTabText, mode === 'tags' && styles.typeTabTextActive]}>Tags</Text>
                </Pressable>
              </View>
            )}
            
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
              <Pressable style={styles.backButtonSingle} onPress={() => setMode('options')}>
                <Icon name="arrow_back" size={18} color="#6b7280" />
                <Text style={styles.backButtonText}>Voltar</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* MODE: Tags Selector */}
        {mode === 'tags' && (
          <View style={styles.contentContainer}>
            {isEditing && (
              <View style={styles.typeTabs}>
                <Pressable 
                  style={[styles.typeTab, mode === 'text' && styles.typeTabActive]}
                  onPress={() => setMode('text')}
                >
                  <Icon name="edit" size={16} color={mode === 'text' ? '#8b5cf6' : '#9ca3af'} />
                  <Text style={[styles.typeTabText, mode === 'text' && styles.typeTabTextActive]}>Texto</Text>
                </Pressable>
                <Pressable 
                  style={[styles.typeTab, mode === 'audio' && styles.typeTabActive]}
                  onPress={() => setMode('audio')}
                >
                  <Icon name="mic" size={16} color={mode === 'audio' ? '#8b5cf6' : '#9ca3af'} />
                  <Text style={[styles.typeTabText, mode === 'audio' && styles.typeTabTextActive]}>Áudio</Text>
                </Pressable>
                <Pressable 
                  style={[styles.typeTab, mode === 'tags' && styles.typeTabActive]}
                  onPress={() => setMode('tags')}
                >
                  <Icon name="sell" size={16} color={mode === 'tags' ? '#8b5cf6' : '#9ca3af'} />
                  <Text style={[styles.typeTabText, mode === 'tags' && styles.typeTabTextActive]}>Tags</Text>
                </Pressable>
              </View>
            )}
            <View style={styles.tagsContainer}>
              {tags.map((tag) => (
                <Pressable
                  key={tag.label}
                  style={[
                    styles.tagChip,
                    selectedTags.includes(tag.label) && styles.tagChipSelected,
                  ]}
                  onPress={() => handleToggleTag(tag.label)}
                >
                  <Text style={[
                    styles.tagChipText,
                    selectedTags.includes(tag.label) && styles.tagChipTextSelected,
                  ]}>
                    {tag.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            
            <Pressable 
              style={styles.manageTagsButton}
              onPress={() => {
                onClose();
                router.push('/(tabs)/labels');
              }}
            >
              <Icon name="settings" size={16} color="#8b5cf6" />
              <Text style={styles.manageTagsText}>Gerenciar Tags</Text>
            </Pressable>

            <View style={styles.actionButtons}>
              {isEditing ? (
                <>
                  <Pressable style={styles.deleteButton} onPress={handleDelete}>
                    <Icon name="delete" size={20} color="#ef4444" />
                  </Pressable>
                  <Pressable 
                    style={[styles.confirmButton, selectedTags.length === 0 && styles.confirmButtonDisabled]} 
                    onPress={handleConfirmTags}
                    disabled={selectedTags.length === 0}
                  >
                    <Icon name="check" size={20} color="#ffffff" />
                    <Text style={styles.confirmButtonText}>Salvar</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Pressable style={styles.backButton} onPress={() => setMode('options')}>
                    <Icon name="arrow_back" size={20} color="#6b7280" />
                  </Pressable>
                  <Pressable 
                    style={[styles.confirmButton, selectedTags.length === 0 && styles.confirmButtonDisabled]} 
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
    backgroundColor: '#ffffff',
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
    cursor: 'move',
  },
  dragHandle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
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
    borderBottomColor: '#ffffff',
  },
  arrowBottom: {
    bottom: -ARROW_SIZE,
    borderTopWidth: ARROW_SIZE,
    borderTopColor: '#ffffff',
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
  textIcon: {
    backgroundColor: '#FFE6E1',
  },
  audioIcon: {
    backgroundColor: '#EDE9FE',
  },
  tagsIcon: {
    backgroundColor: '#FEF3C7',
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
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    maxHeight: 120,
    textAlignVertical: 'top',
    color: '#1f2937',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
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
    backgroundColor: '#f3f4f6',
  },
  backButtonText: {
    fontSize: 13,
    color: '#6b7280',
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
    backgroundColor: '#8b5cf6',
  },
  confirmButtonDisabled: {
    backgroundColor: '#d1d5db',
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
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tagChipSelected: {
    backgroundColor: '#ede9fe',
    borderColor: '#8b5cf6',
  },
  tagChipText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  tagChipTextSelected: {
    color: '#8b5cf6',
  },
  manageTagsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  manageTagsText: {
    fontSize: 12,
    color: '#8b5cf6',
    fontWeight: '500',
  },
  typeTabs: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
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
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  typeTabText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  typeTabTextActive: {
    color: '#8b5cf6',
    fontWeight: '600',
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
});


