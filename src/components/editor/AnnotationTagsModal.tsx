/**
 * AnnotationTagsModal Component
 * 
 * Modal for selecting/creating tags with descriptions
 */

import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Modal, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTagsStore } from '../../stores/tagsStore';
import { Icon } from '../ui/Icon';
import type { Tag } from '../../types/editor.types';

interface AnnotationTagsModalProps {
  visible: boolean;
  selectedText: string;
  onSave: (tags: Tag[]) => void;
  onClose: () => void;
}

export function AnnotationTagsModal({
  visible,
  selectedText,
  onSave,
  onClose,
}: AnnotationTagsModalProps) {
  const { tags, addTag } = useTagsStore();
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [newTagLabel, setNewTagLabel] = useState('');
  const [newTagDescription, setNewTagDescription] = useState('');
  const [editingDescriptions, setEditingDescriptions] = useState<Map<string, string>>(new Map());

  const handleToggleTag = (tag: Tag) => {
    setSelectedTags(prev => {
      const exists = prev.find(t => t.label === tag.label);
      if (exists) {
        return prev.filter(t => t.label !== tag.label);
      } else {
        return [...prev, { ...tag }];
      }
    });
  };

  const handleCreateNewTag = () => {
    if (!newTagLabel.trim()) return;

    const newTag: Tag = {
      label: newTagLabel.trim(),
      description: newTagDescription.trim() || newTagLabel.trim(),
    };

    addTag(newTag);
    setSelectedTags(prev => [...prev, newTag]);
    setNewTagLabel('');
    setNewTagDescription('');
  };

  const handleUpdateDescription = (label: string, description: string) => {
    setEditingDescriptions(prev => {
      const next = new Map(prev);
      next.set(label, description);
      return next;
    });
  };

  const handleSave = () => {
    const finalTags = selectedTags.map(tag => ({
      label: tag.label,
      description: editingDescriptions.get(tag.label) || tag.description,
    }));

    onSave(finalTags);
    setSelectedTags([]);
    setEditingDescriptions(new Map());
    setNewTagLabel('');
    setNewTagDescription('');
  };

  const handleClose = () => {
    setSelectedTags([]);
    setEditingDescriptions(new Map());
    setNewTagLabel('');
    setNewTagDescription('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tags</Text>
          <Pressable onPress={handleClose}>
            <Icon name="close" size={24} color="#374151" />
          </Pressable>
        </View>

        {/* Selected Text Preview */}
        <View style={styles.previewContainer}>
          <Text style={styles.previewLabel}>Texto selecionado:</Text>
          <View style={styles.previewBox}>
            <Text style={styles.previewText}>{selectedText}</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollView}>
          {/* Existing Tags */}
          {tags.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tags disponíveis:</Text>
              <View style={styles.tagsGrid}>
                {tags.map(tag => {
                  const isSelected = selectedTags.some(t => t.label === tag.label);
                  return (
                    <Pressable
                      key={tag.label}
                      style={[
                        styles.tagChip,
                        isSelected && styles.tagChipSelected,
                      ]}
                      onPress={() => handleToggleTag(tag)}
                    >
                      <Icon
                        name={isSelected ? 'check_circle' : 'sell'}
                        size={16}
                        color={isSelected ? '#eab308' : '#9ca3af'}
                      />
                      <Text
                        style={[
                          styles.tagChipText,
                          isSelected && styles.tagChipTextSelected,
                        ]}
                      >
                        {tag.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* Selected Tags with Editable Descriptions */}
          {selectedTags.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tags selecionadas:</Text>
              {selectedTags.map(tag => (
                <View key={tag.label} style={styles.selectedTagItem}>
                  <View style={styles.selectedTagHeader}>
                    <Icon name="sell" size={16} color="#eab308" />
                    <Text style={styles.selectedTagLabel}>{tag.label}</Text>
                  </View>
                  <TextInput
                    style={styles.descriptionInput}
                    value={editingDescriptions.get(tag.label) || tag.description}
                    onChangeText={(text) => handleUpdateDescription(tag.label, text)}
                    placeholder="Descrição da tag..."
                    placeholderTextColor="#9ca3af"
                    multiline
                  />
                </View>
              ))}
            </View>
          )}

          {/* Create New Tag */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Criar nova tag:</Text>
            <View style={styles.newTagContainer}>
              <TextInput
                style={styles.newTagInput}
                value={newTagLabel}
                onChangeText={setNewTagLabel}
                placeholder="Nome da tag..."
                placeholderTextColor="#9ca3af"
              />
              <TextInput
                style={styles.newTagDescriptionInput}
                value={newTagDescription}
                onChangeText={setNewTagDescription}
                placeholder="Descrição (opcional)..."
                placeholderTextColor="#9ca3af"
                multiline
              />
              <Pressable
                style={[
                  styles.createTagButton,
                  !newTagLabel.trim() && styles.createTagButtonDisabled,
                ]}
                onPress={handleCreateNewTag}
                disabled={!newTagLabel.trim()}
              >
                <Icon name="add" size={20} color="#ffffff" />
                <Text style={styles.createTagButtonText}>Adicionar</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </Pressable>

          <Pressable
            style={[
              styles.saveButton,
              selectedTags.length === 0 && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={selectedTags.length === 0}
          >
            <Icon name="check" size={20} color="#ffffff" />
            <Text style={styles.saveButtonText}>Salvar</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  previewContainer: {
    padding: 16,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
  },
  previewBox: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
  },
  previewText: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 24,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tagChipSelected: {
    backgroundColor: '#FEF3C7',
    borderColor: '#eab308',
  },
  tagChipText: {
    fontSize: 14,
    color: '#6b7280',
  },
  tagChipTextSelected: {
    color: '#854d0e',
    fontWeight: '500',
  },
  selectedTagItem: {
    marginBottom: 16,
  },
  selectedTagHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  selectedTagLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#854d0e',
  },
  descriptionInput: {
    fontSize: 14,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 60,
  },
  newTagContainer: {
    gap: 12,
  },
  newTagInput: {
    fontSize: 14,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  newTagDescriptionInput: {
    fontSize: 14,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 80,
  },
  createTagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#eab308',
  },
  createTagButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.5,
  },
  createTagButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#eab308',
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

