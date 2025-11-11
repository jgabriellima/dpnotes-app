/**
 * AnnotationTextModal Component
 * 
 * Modal for creating text note annotations
 */

import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Modal, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Icon } from '../ui/Icon';

interface AnnotationTextModalProps {
  visible: boolean;
  selectedText: string;
  onSave: (description: string) => void;
  onClose: () => void;
}

export function AnnotationTextModal({
  visible,
  selectedText,
  onSave,
  onClose,
}: AnnotationTextModalProps) {
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (description.trim()) {
      onSave(description.trim());
      setDescription('');
    }
  };

  const handleClose = () => {
    setDescription('');
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
          <Text style={styles.headerTitle}>Anotação de Texto</Text>
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

        {/* Description Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Sua nota:</Text>
          <TextInput
            style={styles.textInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Escreva sua nota aqui..."
            placeholderTextColor="#9ca3af"
            multiline
            textAlignVertical="top"
            autoFocus
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </Pressable>

          <Pressable
            style={[
              styles.saveButton,
              !description.trim() && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!description.trim()}
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
    backgroundColor: '#FFE6E1',
    padding: 12,
    borderRadius: 8,
  },
  previewText: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 24,
  },
  inputContainer: {
    flex: 1,
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
    backgroundColor: '#ff6b52',
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

