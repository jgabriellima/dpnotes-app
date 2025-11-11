/**
 * AnnotationPopover Component
 * 
 * Popover that appears when words are selected, offering annotation options
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Icon } from '../ui/Icon';

interface AnnotationPopoverProps {
  visible: boolean;
  onTextNote: () => void;
  onAudio: () => void;
  onTags: () => void;
  onClose: () => void;
}

export function AnnotationPopover({
  visible,
  onTextNote,
  onAudio,
  onTags,
  onClose,
}: AnnotationPopoverProps) {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.popover}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Adicionar Anotação</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={20} color="#6b7280" />
          </Pressable>
        </View>

        {/* Options */}
        <View style={styles.options}>
          {/* Text Note */}
          <Pressable style={styles.option} onPress={onTextNote}>
            <View style={[styles.iconContainer, styles.textIcon]}>
              <Icon name="edit" size={24} color="#ff6b52" />
            </View>
            <Text style={styles.optionLabel}>Texto</Text>
          </Pressable>

          {/* Audio */}
          <Pressable style={styles.option} onPress={onAudio}>
            <View style={[styles.iconContainer, styles.audioIcon]}>
              <Icon name="mic" size={24} color="#8b5cf6" />
            </View>
            <Text style={styles.optionLabel}>Áudio</Text>
          </Pressable>

          {/* Tags */}
          <Pressable style={styles.option} onPress={onTags}>
            <View style={[styles.iconContainer, styles.tagsIcon]}>
              <Icon name="sell" size={24} color="#eab308" />
            </View>
            <Text style={styles.optionLabel}>Tags</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  popover: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 32,
    paddingTop: 24,
  },
  option: {
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
});

