/**
 * Audio Recorder Component
 * 
 * Elegant audio recorder with live waveform visualization.
 * Integrates expo-audio with Simform's waveform library.
 */

import React, { useRef, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Waveform, type IWaveformRef } from '@simform_solutions/react-native-audio-waveform';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { Icon } from '../ui/Icon';
import { cn } from '../../utils/cn';

interface AudioRecorderProps {
  onRecordingComplete?: (uri: string, duration: number) => void;
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
  const waveformRef = useRef<IWaveformRef>(null);
  const { isRecording, duration, start, stop } = useAudioRecorder();

  const formatDuration = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleStart = useCallback(async () => {
    try {
      await start();
      waveformRef.current?.startRecording();
    } catch (error) {
      console.error('Recording start error:', error);
      onRecordingError?.(error as Error);
    }
  }, [start, onRecordingError]);

  const handleStop = useCallback(async () => {
    try {
      waveformRef.current?.stopRecording();
      const uri = await stop();
      
      if (uri) {
        onRecordingComplete?.(uri, duration);
      }
    } catch (error) {
      console.error('Recording stop error:', error);
      onRecordingError?.(error as Error);
    }
  }, [stop, duration, onRecordingComplete, onRecordingError]);

  // Auto-stop when reaching max duration
  React.useEffect(() => {
    if (duration >= maxDuration && isRecording) {
      handleStop();
    }
  }, [duration, maxDuration, isRecording, handleStop]);

  return (
    <View className={cn('flex flex-col gap-4', className)}>
      {/* Waveform Display */}
      <View className="bg-primary-lightest rounded-lg overflow-hidden" style={{ height: 96 }}>
        <Waveform
          ref={waveformRef}
          mode="live"
          candleWidth={3}
          candleSpace={2}
          waveColor="#ffccc3"
          containerStyle={styles.waveform}
        />
      </View>

      {/* Recording Info & Controls */}
      <View className="flex flex-row items-center justify-between">
        <View className="flex flex-col">
          <Text className="text-text-primary text-sm font-medium">
            {isRecording ? 'Gravando...' : 'Toque para gravar'}
          </Text>
          <Text className="text-text-secondary text-xs">
            {formatDuration(duration)} / {formatDuration(maxDuration)}
          </Text>
        </View>

        {/* Record/Stop Button */}
        <Pressable
          onPress={isRecording ? handleStop : handleStart}
          className={cn(
            'size-14 flex items-center justify-center rounded-full',
            isRecording ? 'bg-destructive' : 'bg-primary',
            'active:opacity-80 transition-opacity'
          )}
        >
          <Icon 
            name={isRecording ? 'stop' : 'mic'} 
            size={24} 
            color="#ffffff" 
          />
        </Pressable>
      </View>

      {/* Progress Bar */}
      {isRecording && (
        <View className="h-1 bg-primary-lighter rounded-full overflow-hidden">
          <View
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${(duration / maxDuration) * 100}%` }}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  waveform: {
    height: 96,
    borderRadius: 12,
    overflow: 'hidden',
  },
});

export default AudioRecorder;

