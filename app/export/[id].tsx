/**
 * Export Preview Screen
 * 
 * Preview and export annotated document as ChatGPT prompt.
 * Includes summary, annotations, and formatted text.
 * 
 * Reference: docs/UX_UI_REFERENCES/export_preview/
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useDocument } from '../../src/hooks/useDocuments';
import { useAnnotations } from '../../src/hooks/useAnnotations';
import { generatePrompt, generateStatistics } from '../../src/services/export/promptGenerator';
import { setClipboardContent } from '../../src/services/clipboard';
import { Icon } from '../../src/components/ui/Icon';
import { Button } from '../../src/components/ui/Button';
import { Badge } from '../../src/components/ui/Badge';

export default function ExportPreviewScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const { data: document, isLoading: loadingDocument } = useDocument(params.id);
  const { data: annotations = [], isLoading: loadingAnnotations } = useAnnotations(params.id);

  const [includeAudio, setIncludeAudio] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);

  const handleCopyPrompt = async () => {
    if (!document) return;

    try {
      const prompt = generatePrompt(
        document.title,
        document.content,
        annotations,
        {
          includeAudioTranscriptions: includeAudio,
          includeTextNotes: includeNotes,
          includeLabelDescriptions: true,
          language: document.language as 'pt' | 'en' | 'es' || 'pt',
        }
      );

      await setClipboardContent(prompt);
      Alert.alert('Sucesso', 'Prompt copiado para o clipboard!');
    } catch (error) {
      console.error('Copy error:', error);
      Alert.alert('Erro', 'Não foi possível copiar o prompt.');
    }
  };

  if (loadingDocument || loadingAnnotations) {
    return (
      <View className="flex-1 bg-primary-lightest items-center justify-center">
        <Text className="text-text-secondary">Carregando...</Text>
      </View>
    );
  }

  if (!document) {
    return (
      <View className="flex-1 bg-primary-lightest items-center justify-center">
        <Text className="text-text-secondary">Documento não encontrado</Text>
      </View>
    );
  }

  const stats = generateStatistics(annotations);
  const prompt = generatePrompt(
    document.title,
    document.content,
    annotations,
    {
      includeAudioTranscriptions: includeAudio,
      includeTextNotes: includeNotes,
      includeLabelDescriptions: true,
      language: document.language as 'pt' | 'en' | 'es' || 'pt',
    }
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 bg-primary-lightest">
        {/* Header */}
        <View className="flex flex-row items-center justify-between px-4 pt-12 pb-4 bg-primary-lightest border-b border-primary-light">
          <Pressable onPress={() => router.back()}>
            <Icon name="arrow_back" size={24} color="#2D313E" />
          </Pressable>

          <Text className="text-lg font-bold text-text-primary flex-1 text-center px-4">
            dpnotes.ai
          </Text>

          <View className="w-12" />
        </View>

        {/* Content */}
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 py-6 gap-6"
          showsVerticalScrollIndicator={false}
        >
          {/* Statistics Card */}
          <View className="bg-white rounded-xl p-4">
            <Text className="text-base font-bold text-text-primary mb-3">
              Estatísticas
            </Text>
            <View className="flex flex-col gap-2">
              <View className="flex flex-row justify-between">
                <Text className="text-text-secondary text-sm">Total de anotações:</Text>
                <Text className="text-text-primary text-sm font-semibold">
                  {stats.totalAnnotations}
                </Text>
              </View>
              <View className="flex flex-row justify-between">
                <Text className="text-text-secondary text-sm">Labels únicas:</Text>
                <Text className="text-text-primary text-sm font-semibold">
                  {stats.totalLabels}
                </Text>
              </View>
              <View className="flex flex-row justify-between">
                <Text className="text-text-secondary text-sm">Notas de texto:</Text>
                <Text className="text-text-primary text-sm font-semibold">
                  {stats.totalTextNotes}
                </Text>
              </View>
              <View className="flex flex-row justify-between">
                <Text className="text-text-secondary text-sm">Notas de áudio:</Text>
                <Text className="text-text-primary text-sm font-semibold">
                  {stats.totalAudioNotes}
                </Text>
              </View>
            </View>
          </View>

          {/* Export Options */}
          <View className="bg-white rounded-xl p-4">
            <Text className="text-base font-bold text-text-primary mb-3">
              Opções de Exportação
            </Text>
            
            <Pressable
              onPress={() => setIncludeNotes(!includeNotes)}
              className="flex flex-row items-center justify-between py-2"
            >
              <Text className="text-text-primary text-sm">Incluir notas de texto</Text>
              <View className={`size-6 rounded border-2 ${includeNotes ? 'bg-primary border-primary' : 'border-gray-300'} items-center justify-center`}>
                {includeNotes && <Icon name="check" size={16} color="#8B2500" />}
              </View>
            </Pressable>

            <Pressable
              onPress={() => setIncludeAudio(!includeAudio)}
              className="flex flex-row items-center justify-between py-2"
            >
              <Text className="text-text-primary text-sm">Incluir transcrições de áudio</Text>
              <View className={`size-6 rounded border-2 ${includeAudio ? 'bg-primary border-primary' : 'border-gray-300'} items-center justify-center`}>
                {includeAudio && <Icon name="check" size={16} color="#8B2500" />}
              </View>
            </Pressable>
          </View>

          {/* Annotations Summary */}
          {annotations.length > 0 && (
            <View className="flex flex-col gap-3">
              <Text className="text-base font-bold text-text-primary">
                Sumário das Anotações
              </Text>
              
              {annotations.map((annotation, index) => (
                <View
                  key={annotation.id}
                  className="bg-white rounded-xl p-4"
                >
                  <View className="flex flex-row items-start gap-2">
                    <Badge>T{index + 1}</Badge>
                    <View className="flex-1">
                      {/* Labels */}
                      {annotation.labels.length > 0 && (
                        <View className="flex flex-row flex-wrap gap-1 mb-2">
                          {annotation.labels.map(label => (
                            <Badge
                              key={label.id}
                              icon={<Icon name="sell" size={12} color="#ff6b52" />}
                            >
                              {label.name}
                            </Badge>
                          ))}
                        </View>
                      )}

                      {/* Sentence */}
                      <Text className="text-text-primary text-sm mb-2">
                        "{annotation.sentenceText}"
                      </Text>

                      {/* Text Note */}
                      {annotation.textNote && includeNotes && (
                        <View className="p-2 bg-primary-lightest rounded mt-2">
                          <Text className="text-text-secondary text-xs">
                            {annotation.textNote}
                          </Text>
                        </View>
                      )}

                      {/* Audio Transcription */}
                      {annotation.audio.length > 0 && includeAudio && (
                        <View className="p-2 bg-primary-lightest rounded mt-2">
                          {annotation.audio.map((audio, i) => (
                            audio.transcription && (
                              <Text key={i} className="text-text-secondary text-xs">
                                🎤 {audio.transcription}
                              </Text>
                            )
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Preview */}
          <View className="bg-white rounded-xl p-4">
            <Text className="text-base font-bold text-text-primary mb-3">
              Preview do Prompt
            </Text>
            <ScrollView 
              className="max-h-[300px] bg-primary-lightest rounded p-3"
              nestedScrollEnabled
            >
              <Text className="text-text-primary text-xs font-mono leading-5">
                {prompt}
              </Text>
            </ScrollView>
          </View>
        </ScrollView>

        {/* Copy Button (Fixed) */}
        <View className="px-4 py-4 bg-white border-t border-primary-light">
          <Button
            variant="primary"
            onPress={handleCopyPrompt}
            icon={<Icon name="content_copy" size={20} color="#8B2500" />}
            fullWidth
          >
            Copiar Prompt
          </Button>
        </View>
      </View>
    </>
  );
}
