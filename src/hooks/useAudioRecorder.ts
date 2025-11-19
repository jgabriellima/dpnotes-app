/**
 * Audio Recorder Hook
 * 
 * Elegant hook for recording audio with React Native.
 * Based on the React Native Live Waveform Recording guide.
 * 
 * Features:
 * - Record audio using expo-av
 * - Start/stop recording
 * - Get recorded file URI
 * - Permission handling
 */

import { useCallback, useRef, useState } from 'react';
import { Audio } from 'expo-av';

interface UseAudioRecorderReturn {
  isRecording: boolean;
  isPaused: boolean;
  uri: string | null;
  duration: number;
  recording: Audio.Recording | null;
  start: () => Promise<void>;
  stop: () => Promise<string | null>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  requestPermissions: () => Promise<boolean>;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const recorderRef = useRef<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [uri, setUri] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const { status, granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        console.warn('🎤 [useAudioRecorder] Microphone permission denied, status:', status);
      } else {
        console.log('🎤 [useAudioRecorder] Microphone permission granted');
      }
      return granted;
    } catch (error) {
      console.error('🎤 [useAudioRecorder] Error requesting permissions:', error);
      return false;
    }
  }, []);

  const start = useCallback(async () => {
    try {
      console.log('🎤 [useAudioRecorder] Starting recording...');
      
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        throw new Error('Microphone permission denied');
      }

      console.log('🎤 [useAudioRecorder] Setting audio mode...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('🎤 [useAudioRecorder] Creating recording instance...');
      const recording = new Audio.Recording();
      
      console.log('🎤 [useAudioRecorder] Preparing to record...');
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      console.log('🎤 [useAudioRecorder] Starting recording...');
      await recording.startAsync();
      recorderRef.current = recording;
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);

      // Update duration every second
      intervalRef.current = setInterval(async () => {
        if (recorderRef.current) {
          try {
            const status = await recorderRef.current.getStatusAsync();
            if (status.isRecording && status.durationMillis) {
              setDuration(Math.floor(status.durationMillis / 1000));
            }
          } catch (err) {
            console.error('🎤 [useAudioRecorder] Error getting status:', err);
          }
        }
      }, 1000);

      console.log('🎤 [useAudioRecorder] Recording started successfully!');
    } catch (error) {
      console.error('🎤 [useAudioRecorder] Error starting recording:', error);
      setIsRecording(false);
      throw error;
    }
  }, [requestPermissions]);

  const stop = useCallback(async (): Promise<string | null> => {
    try {
      console.log('🎤 [useAudioRecorder] Stopping recording...');
      const rec = recorderRef.current;
      if (!rec) {
        console.warn('🎤 [useAudioRecorder] No recording to stop');
        return null;
      }

      // Clear interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      await rec.stopAndUnloadAsync();
      const fileUri = rec.getURI() ?? null;
      
      if (fileUri) {
        console.log('🎤 [useAudioRecorder] Recording saved to:', fileUri);
      }
      
      setUri(fileUri);
      recorderRef.current = null;
      setIsRecording(false);
      setIsPaused(false);

      return fileUri;
    } catch (error) {
      console.error('🎤 [useAudioRecorder] Error stopping recording:', error);
      setIsRecording(false);
      return null;
    }
  }, []);

  const pause = useCallback(async () => {
    try {
      console.log('🎤 [useAudioRecorder] Pausing recording...');
      const rec = recorderRef.current;
      if (!rec) return;

      await rec.pauseAsync();
      setIsRecording(false);
      setIsPaused(true);
      
      // Pause the interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } catch (error) {
      console.error('🎤 [useAudioRecorder] Error pausing recording:', error);
    }
  }, []);

  const resume = useCallback(async () => {
    try {
      console.log('🎤 [useAudioRecorder] Resuming recording...');
      const rec = recorderRef.current;
      if (!rec) return;

      await rec.startAsync();
      setIsRecording(true);
      setIsPaused(false);
      
      // Restart the interval
      intervalRef.current = setInterval(async () => {
        if (recorderRef.current) {
          try {
            const status = await recorderRef.current.getStatusAsync();
            if (status.isRecording && status.durationMillis) {
              setDuration(Math.floor(status.durationMillis / 1000));
            }
          } catch (err) {
            console.error('🎤 [useAudioRecorder] Error getting status:', err);
          }
        }
      }, 1000);
    } catch (error) {
      console.error('🎤 [useAudioRecorder] Error resuming recording:', error);
    }
  }, []);

  return {
    isRecording,
    isPaused,
    uri,
    duration,
    recording: recorderRef.current,
    start,
    stop,
    pause,
    resume,
    requestPermissions,
  };
}

export default useAudioRecorder;

