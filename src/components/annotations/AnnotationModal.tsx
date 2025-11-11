/**
 * Annotation Modal Component
 * 
 * Comprehensive modal for creating/editing annotations.
 * Integrates labels, audio recording, and text notes.
 * 
 * Reference: docs/UX_UI_REFERENCES/annotation_modal/
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { BottomSheetModal } from '../ui/Modal';
import { LabelChip, AddLabelButton } from '../ui/Badge';
import { TextArea } from '../ui/Input';
import { Button } from '../ui/Button';
import { AudioRecorder } from '../audio/AudioRecorder';
import { useLabels } from '../../hooks/useLabels';
import { useUpsertAnnotation, useAddLabelsToAnnotation } from '../../hooks/useAnnotations';
import { transcribeAudio } from '../../services/transcription';
import { supabase } from '../../services/supabase/client';

interface AnnotationModalProps {
  visible: boolean;
  onClose: () => void;
  documentId: string;
  sentenceIndex: number;
  sentenceText: string;
  existingAnnotation?: {
    id: string;
    labels: Array<{ id: string; name: string }>;
    textNote: string | null;
    audioUrl: string | null;
  };
  onSave?: () => void;
}

export const AnnotationModal: React.FC<AnnotationModalProps> = ({
  visible,
  onClose,
  documentId,
  sentenceIndex,
  sentenceText,
  existingAnnotation,
  onSave,
}) => {
  const { data: labels = [] } = useLabels();
  const upsertAnnotation = useUpsertAnnotation();
  const addLabels = useAddLabelsToAnnotation();

  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>(
    existingAnnotation?.labels.map(l => l.id) || []
  );
  const [textNote, setTextNote] = useState(existingAnnotation?.textNote || '');
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      // Reset state when modal opens
      setSelectedLabelIds(existingAnnotation?.labels.map(l => l.id) || []);
      setTextNote(existingAnnotation?.textNote || '');
      setAudioUri(null);
    }
  }, [visible, existingAnnotation]);

  const toggleLabel = (labelId: string) => {
    setSelectedLabelIds(prev =>
      prev.includes(labelId)
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  const handleAudioComplete = async (uri: string, duration: number) => {
    setAudioUri(uri);

    // Auto-transcribe
    Alert.alert(
      'Transcrever Áudio?',
      'Deseja transcrever automaticamente o áudio gravado?',
      [
        {
          text: 'Não',
          style: 'cancel',
        },
        {
          text: 'Sim',
          onPress: () => transcribeRecording(uri),
        },
      ]
    );
  };

  const transcribeRecording = async (uri: string) => {
    setIsTranscribing(true);
    try {
      const result = await transcribeAudio(uri);
      setTextNote(prev => 
        prev 
          ? `${prev}\n\n[Transcrição de áudio]: ${result.text}`
          : `[Transcrição de áudio]: ${result.text}`
      );
      Alert.alert('Sucesso', 'Áudio transcrito com sucesso!');
    } catch (error) {
      console.error('Transcription error:', error);
      Alert.alert('Erro', 'Não foi possível transcrever o áudio.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const uploadAudio = async (uri: string, annotationId: string): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const filename = `${user.id}/${annotationId}/${Date.now()}.m4a`;
      
      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();

      const { data, error } = await supabase.storage
        .from('audio-recordings')
        .upload(filename, arrayBuffer, {
          contentType: 'audio/m4a',
          upsert: false,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('audio-recordings')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Audio upload error:', error);
      return null;
    }
  };

  const handleSave = async () => {
    if (selectedLabelIds.length === 0 && !textNote && !audioUri) {
      Alert.alert('Anotação vazia', 'Adicione pelo menos um label, nota de texto ou áudio.');
      return;
    }

    setIsSaving(true);
    try {
      // 1. Create/update annotation
      const annotation = await upsertAnnotation.mutateAsync({
        document_id: documentId,
        sentence_index: sentenceIndex,
        sentence_text: sentenceText,
        text_note: textNote || null,
      });

      // 2. Add labels
      if (selectedLabelIds.length > 0) {
        await addLabels.mutateAsync({
          annotationId: annotation.id,
          labelIds: selectedLabelIds,
        });
      }

      // 3. Upload and save audio if recorded
      if (audioUri) {
        const audioUrl = await uploadAudio(audioUri, annotation.id);
        
        if (audioUrl) {
          await supabase.from('audio_recordings').insert({
            annotation_id: annotation.id,
            audio_url: audioUrl,
            transcription: null, // Can be filled later
          });
        }
      }

      Alert.alert('Sucesso', 'Anotação salva!');
      onSave?.();
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Erro', 'Não foi possível salvar a anotação.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNewLabel = () => {
    Alert.alert('Em desenvolvimento', 'Funcionalidade de criar label customizada será implementada em breve.');
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose} maxHeight="90%">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex flex-col gap-6">
          {/* Header */}
          <Text className="text-xl font-bold text-text-primary">
            Adicionar Anotação
          </Text>

          {/* Selected Sentence */}
          <View className="p-3 bg-primary-lightest rounded-lg border-l-2 border-primary">
            <Text className="text-text-primary text-sm leading-relaxed">
              {sentenceText}
            </Text>
          </View>

          {/* Labels Section */}
          <View className="flex flex-col gap-3">
            <Text className="text-base font-semibold text-text-primary">
              Labels
            </Text>
            <View className="flex flex-row flex-wrap gap-2">
              {labels.map(label => (
                <LabelChip
                  key={label.id}
                  label={label.name}
                  selected={selectedLabelIds.includes(label.id)}
                  onPress={() => toggleLabel(label.id)}
                />
              ))}
              <AddLabelButton onPress={handleAddNewLabel} />
            </View>
          </View>

          {/* Audio Recording Section */}
          <View className="flex flex-col gap-3">
            <Text className="text-base font-semibold text-text-primary">
              Gravação de Áudio
            </Text>
            <AudioRecorder
              onRecordingComplete={handleAudioComplete}
              maxDuration={120}
            />
            {isTranscribing && (
              <Text className="text-sm text-text-secondary text-center">
                Transcrevendo áudio...
              </Text>
            )}
          </View>

          {/* Text Note Section */}
          <View className="flex flex-col gap-3">
            <Text className="text-base font-semibold text-text-primary">
              Anotação de Texto
            </Text>
            <TextArea
              value={textNote}
              onChangeText={setTextNote}
              placeholder="Digite sua anotação..."
              minHeight={100}
            />
          </View>

          {/* Actions */}
          <View className="flex flex-row gap-3 mt-4">
            <Button
              variant="secondary"
              onPress={onClose}
              fullWidth
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onPress={handleSave}
              loading={isSaving}
              fullWidth
            >
              Salvar
            </Button>
          </View>
        </View>
      </ScrollView>
    </BottomSheetModal>
  );
};

export default AnnotationModal;

