/**
 * AnnotationAudioModal Component
 * 
 * Modal for creating audio annotations with transcription
 */

import React, { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { AudioRecorder } from '../audio/AudioRecorder';
import { transcribeAudio } from '../../services/transcription';
import { File } from 'expo-file-system/next';
import * as FileSystem from 'expo-file-system/legacy';
import { Icon } from '../ui/Icon';

interface AnnotationAudioModalProps {
  visible: boolean;
  selectedText: string;
  onSave: (audioUri: string, audioBytes: Uint8Array, transcription: string, duration: number) => void;
  onClose: () => void;
}

export function AnnotationAudioModal({
  visible,
  selectedText,
  onSave,
  onClose,
}: AnnotationAudioModalProps) {
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const handleRecordingComplete = (uri: string, recordDuration: number) => {
    setAudioUri(uri);
    setDuration(recordDuration);
  };

  const handleSave = async () => {
    if (!audioUri) {
      Alert.alert('Erro', 'Nenhuma gravação de áudio disponível');
      return;
    }

    try {
      setIsTranscribing(true);

      // Check if audio file exists using new File API
      const file = new File(audioUri);
      if (!file.exists) {
        throw new Error('Audio file not found');
      }

      const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      const audioBytes = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0));

      // Transcribe audio
      const transcription = await transcribeAudio(audioUri);

      // Save with all data
      onSave(audioUri, audioBytes, transcription, duration);

      // Reset state
      setAudioUri(null);
      setDuration(0);
      setIsTranscribing(false);
    } catch (error) {
      console.error('Error saving audio annotation:', error);
      Alert.alert(
        'Erro',
        'Não foi possível processar a gravação de áudio'
      );
      setIsTranscribing(false);
    }
  };

  const handleClose = () => {
    setAudioUri(null);
    setDuration(0);
    setIsTranscribing(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Anotação de Áudio</Text>
          <Pressable onPress={handleClose} disabled={isTranscribing}>
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

        {/* Audio Recorder */}
        <View style={styles.recorderContainer}>
          <Text style={styles.recorderLabel}>Grave sua nota de áudio:</Text>
          <AudioRecorder
            onRecordingComplete={handleRecordingComplete}
            maxDuration={120}
            className="mt-4"
          />
        </View>

        {/* Transcribing Indicator */}
        {isTranscribing && (
          <View style={styles.transcribingContainer}>
            <ActivityIndicator size="small" color="#8b5cf6" />
            <Text style={styles.transcribingText}>Transcrevendo áudio...</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={styles.cancelButton}
            onPress={handleClose}
            disabled={isTranscribing}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </Pressable>

          <Pressable
            style={[
              styles.saveButton,
              (!audioUri || isTranscribing) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!audioUri || isTranscribing}
          >
            {isTranscribing ? (
              <>
                <ActivityIndicator size="small" color="#ffffff" />
                <Text style={styles.saveButtonText}>Processando...</Text>
              </>
            ) : (
              <>
                <Icon name="check" size={20} color="#ffffff" />
                <Text style={styles.saveButtonText}>Salvar</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
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
    backgroundColor: '#EDE9FE',
    padding: 12,
    borderRadius: 8,
  },
  previewText: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 24,
  },
  recorderContainer: {
    flex: 1,
    padding: 16,
  },
  recorderLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 16,
  },
  transcribingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    backgroundColor: '#f9fafb',
  },
  transcribingText: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '500',
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
    backgroundColor: '#8b5cf6',
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

