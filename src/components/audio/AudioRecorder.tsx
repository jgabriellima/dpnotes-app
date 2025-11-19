/**
 * Audio Recorder Component
 * 
 * Complete audio recording flow: Record → Preview → Send or Re-record
 * Uses custom SVG waveform compatible with Expo Go.
 */

import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { CustomWaveform } from './CustomWaveform';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { Icon } from '../ui/Icon';
import { cn } from '../../utils/cn';
import { transcribeAudio } from '../../services/transcription/groq';

type RecorderState = 'idle' | 'recording' | 'preview';

interface AudioRecorderProps {
  onRecordingComplete?: (uri: string, duration: number, transcription?: string) => void;
  onRecordingError?: (error: Error) => void;
  maxDuration?: number; // Maximum recording duration in seconds (default: 120)
  className?: string;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  onRecordingError,
  maxDuration = 120,
  className,
}) => {
  const [state, setState] = useState<RecorderState>('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  // Playback state
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  
  const { isRecording, isPaused, duration, start, stop, pause, resume, recording } = useAudioRecorder();

  const formatDuration = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleStart = useCallback(async () => {
    try {
      setState('recording');
      await start();
    } catch (error) {
      console.error('Recording start error:', error);
      setState('idle');
      onRecordingError?.(error as Error);
    }
  }, [start, onRecordingError]);

  const handleStop = useCallback(async () => {
    try {
      const uri = await stop();
      
      if (uri) {
        setRecordedUri(uri);
        setRecordedDuration(duration);
        setState('preview');
      }
    } catch (error) {
      console.error('Recording stop error:', error);
      setState('idle');
      onRecordingError?.(error as Error);
    }
  }, [stop, duration, onRecordingError]);

  const handleReRecord = useCallback(async () => {
    // Cleanup previous recording
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
    setRecordedUri(null);
    setRecordedDuration(0);
    setTranscription(null);
    setPlaybackPosition(0);
    setIsPlaying(false);
    setState('idle');
  }, [sound]);

  const handleSend = useCallback(async () => {
    if (!recordedUri) {
      console.error('❌ [AudioRecorder] No recorded URI available');
      return;
    }
    
    try {
      setIsTranscribing(true);
      console.log('🎤 [AudioRecorder] Starting transcription...');
      console.log('🎤 [AudioRecorder] Audio URI:', recordedUri);
      console.log('🎤 [AudioRecorder] Audio duration:', recordedDuration, 'seconds');
      
      // Transcribe audio
      const result = await transcribeAudio(recordedUri, {
        language: 'pt', // Auto-detect ou configurável
        prompt: 'Transcrição de anotação de pesquisa acadêmica.', // Context hint
      });
      
      console.log('✅ [AudioRecorder] Transcription complete!');
      console.log('✅ [AudioRecorder] Transcribed text:', result.text.substring(0, 100) + (result.text.length > 100 ? '...' : ''));
      setTranscription(result.text);
      
      // Send with transcription
      onRecordingComplete?.(recordedUri, recordedDuration, result.text);
      
      // Reset to idle
      await handleReRecord();
    } catch (error) {
      console.error('❌ [AudioRecorder] Transcription failed:', error);
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [AudioRecorder] Error details:', errorMessage);
      
      // Even if transcription fails, send the audio without transcription
      console.log('📤 [AudioRecorder] Sending audio without transcription');
      onRecordingComplete?.(recordedUri, recordedDuration, undefined);
      await handleReRecord();
    } finally {
      setIsTranscribing(false);
    }
  }, [recordedUri, recordedDuration, onRecordingComplete, handleReRecord]);

  const handlePause = useCallback(async () => {
    try {
      await pause();
    } catch (error) {
      console.error('Recording pause error:', error);
      onRecordingError?.(error as Error);
    }
  }, [pause, onRecordingError]);

  const handleResume = useCallback(async () => {
    try {
      await resume();
    } catch (error) {
      console.error('Recording resume error:', error);
      onRecordingError?.(error as Error);
    }
  }, [resume, onRecordingError]);

  // Monitor audio levels during recording
  useEffect(() => {
    if (!recording || !isRecording) {
      setAudioLevel(0);
      return;
    }

    const interval = setInterval(async () => {
      try {
        const status = await recording.getStatusAsync();
        if (status.isRecording && status.metering !== undefined) {
          // Normalize metering value (typically -160 to 0)
          setAudioLevel(status.metering);
        }
      } catch (error) {
        console.error('Error getting audio level:', error);
      }
    }, 100); // Update every 100ms

    return () => clearInterval(interval);
  }, [recording, isRecording]);

  // Playback controls
  const handlePlayPause = useCallback(async () => {
    try {
      if (!recordedUri) return;

      if (isPlaying && sound) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else if (sound) {
        await sound.playAsync();
        setIsPlaying(true);
      } else {
        // Load and play
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: recordedUri },
          { shouldPlay: true },
          (status) => {
            if (status.isLoaded) {
              setPlaybackPosition(status.positionMillis / 1000);
              if (status.didJustFinish) {
                setIsPlaying(false);
                setPlaybackPosition(0);
              }
            }
          }
        );
        setSound(newSound);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Playback error:', error);
    }
  }, [recordedUri, sound, isPlaying]);

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Auto-stop when reaching max duration
  useEffect(() => {
    if (duration >= maxDuration && isRecording) {
      handleStop();
    }
  }, [duration, maxDuration, isRecording, handleStop]);

  // IDLE STATE: Ready to record
  if (state === 'idle') {
    return (
      <View className={cn('flex flex-col gap-4', className)}>
        <View className="bg-primary-lightest rounded-lg overflow-hidden" style={{ height: 96 }}>
          <CustomWaveform
            isRecording={false}
            isPaused={false}
            audioLevel={0}
            height={96}
            barCount={20}
            barColor="#8B5CF6"
            barWidth={3}
            barGap={4}
          />
        </View>

        <View className="flex flex-row items-center justify-between">
          <Text className="text-text-secondary text-sm">
            Pressione para gravar
          </Text>
          
          <Pressable
            onPress={handleStart}
            className="size-14 flex items-center justify-center rounded-full bg-primary active:opacity-80"
          >
            <Icon name="mic" size={24} color="#ffffff" />
          </Pressable>
        </View>
      </View>
    );
  }

  // RECORDING STATE: Active recording
  if (state === 'recording') {
    return (
      <View className={cn('flex flex-col gap-4', className)}>
        <View className="bg-primary-lightest rounded-lg overflow-hidden" style={{ height: 96 }}>
          <CustomWaveform
            isRecording={isRecording}
            isPaused={isPaused}
            audioLevel={audioLevel}
            height={96}
            barCount={20}
            barColor="#8B5CF6"
            barWidth={3}
            barGap={4}
          />
        </View>

        <View className="flex flex-row items-center justify-between">
          <View className="flex flex-col">
            <Text className="text-text-primary text-sm font-medium">
              {isPaused ? 'Pausado' : 'Gravando...'}
            </Text>
            <Text className="text-text-secondary text-xs">
              {formatDuration(duration)} / {formatDuration(maxDuration)}
            </Text>
          </View>

          <View className="flex flex-row gap-3 items-center">
            {(isRecording || isPaused) && (
              <Pressable
                onPress={isPaused ? handleResume : handlePause}
                className="size-12 flex items-center justify-center rounded-full bg-primary-light active:opacity-80"
              >
                <Icon 
                  name={isPaused ? 'play_arrow' : 'pause'} 
                  size={20} 
                  color="#8B5CF6" 
                />
              </Pressable>
            )}

            <Pressable
              onPress={handleStop}
              className="size-14 flex items-center justify-center rounded-full bg-destructive active:opacity-80"
            >
              <Icon name="stop" size={24} color="#ffffff" />
            </Pressable>
          </View>
        </View>

        <View className="h-1 bg-primary-lighter rounded-full overflow-hidden">
          <View
            className={cn('h-full rounded-full', isPaused ? 'bg-primary-light' : 'bg-primary')}
            style={{ width: `${(duration / maxDuration) * 100}%` }}
          />
        </View>
      </View>
    );
  }

  // PREVIEW STATE: Recorded, can listen, re-record or send
  return (
    <View className={cn('flex flex-col gap-4', className)}>
      <View className="bg-primary-lightest rounded-lg overflow-hidden" style={{ height: 96 }}>
        <CustomWaveform
          isRecording={false}
          isPaused={!isPlaying}
          audioLevel={0}
          height={96}
          barCount={20}
          barColor="#8B5CF6"
          barWidth={3}
          barGap={4}
        />
      </View>

      {/* Playback Controls */}
      <View className="flex flex-row items-center justify-between">
        <View className="flex flex-col">
          {isTranscribing ? (
            <View className="flex flex-row items-center gap-2">
              <ActivityIndicator size="small" color="#8B5CF6" />
              <Text className="text-primary text-sm font-medium">
                Transcrevendo áudio...
              </Text>
            </View>
          ) : (
            <Text className="text-text-primary text-sm font-medium">
              {isPlaying ? 'Reproduzindo...' : transcription ? 'Gravação transcrita' : 'Gravação concluída'}
            </Text>
          )}
          <Text className="text-text-secondary text-xs">
            {formatDuration(Math.floor(playbackPosition))} / {formatDuration(recordedDuration)}
          </Text>
        </View>

        <Pressable
          onPress={handlePlayPause}
          className="size-12 flex items-center justify-center rounded-full bg-primary-light active:opacity-80"
        >
          <Icon 
            name={isPlaying ? 'pause' : 'play_arrow'} 
            size={20} 
            color="#8B5CF6" 
          />
        </Pressable>
      </View>

      {/* Playback Progress */}
      <View className="h-1 bg-primary-lighter rounded-full overflow-hidden">
        <View
          className="h-full rounded-full bg-primary"
          style={{ width: `${(playbackPosition / recordedDuration) * 100}%` }}
        />
      </View>

      {/* Transcription Display (if available) */}
      {transcription && !isTranscribing && (
        <View className="bg-primary-lightest rounded-lg p-3">
          <Text className="text-text-secondary text-sm italic">
            "{transcription}"
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View className="flex flex-row gap-3">
        <Pressable
          onPress={handleReRecord}
          disabled={isTranscribing}
          className={cn(
            "flex-1 py-3 px-4 rounded-lg bg-surface-secondary flex-row items-center justify-center gap-2",
            isTranscribing ? "opacity-50" : "active:opacity-80"
          )}
        >
          <Icon name="refresh" size={18} color="#64748b" />
          <Text className="text-text-secondary font-medium">Regravar</Text>
        </Pressable>

        <Pressable
          onPress={handleSend}
          disabled={isTranscribing}
          className={cn(
            "flex-1 py-3 px-4 rounded-lg bg-primary flex-row items-center justify-center gap-2",
            isTranscribing ? "opacity-50" : "active:opacity-80"
          )}
        >
          <Icon name="check" size={18} color="#ffffff" />
          <Text className="text-white font-medium">{isTranscribing ? 'Transcrevendo...' : 'Enviar'}</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default AudioRecorder;

