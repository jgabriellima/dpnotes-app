/**
 * AudioPlayer Component
 * 
 * Simple audio player for playback of recorded annotations
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { Audio } from 'expo-av';
import { Icon } from '../ui/Icon';
import { useSettingsStore } from '../../stores/settingsStore';

interface AudioPlayerProps {
  audioUri: string;
  transcription?: string;
  onDelete?: () => void;
  onReRecord?: () => void;
}

export function AudioPlayer({ 
  audioUri, 
  transcription,
  onDelete,
  onReRecord,
}: AudioPlayerProps) {
  const { settings } = useSettingsStore();
  const systemColorScheme = useColorScheme();
  
  // Determine effective theme
  const isDark = settings.theme === 'dark' || (settings.theme === 'light' ? false : systemColorScheme === 'dark');
  
  const theme = {
    transcriptionBg: isDark ? '#2a2a2a' : '#f9fafb',
    transcriptionBorder: isDark ? '#3a3a3a' : '#e5e7eb',
    transcriptionLabel: isDark ? '#a0a0a0' : '#6b7280',
    transcriptionText: isDark ? '#e5e7eb' : '#374151',
    playButtonBg: isDark ? '#2a2a2a' : '#f3f4f6',
    progressBg: isDark ? '#3a3a3a' : '#e5e7eb',
    progressFill: '#8b5cf6',
    timeText: isDark ? '#a0a0a0' : '#6b7280',
    deleteButtonBg: isDark ? '#7f1d1d' : '#fef2f2',
    deleteButtonBorder: isDark ? '#991b1b' : '#fecaca',
    deleteButtonText: '#ef4444',
    reRecordButtonBg: isDark ? '#5b21b6' : '#f5f3ff',
    reRecordButtonBorder: isDark ? '#6d28d9' : '#ddd6fe',
    reRecordButtonText: isDark ? '#c4b5fd' : '#8b5cf6',
  };
  
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const [position, setPosition] = useState<number>(0);

  // Load sound
  useEffect(() => {
    let isMounted = true;

    async function loadSound() {
      try {
        console.log('🔊 [AudioPlayer] Loading sound:', audioUri);
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: false },
          onPlaybackStatusUpdate
        );
        
        if (isMounted) {
          setSound(newSound);
          
          // Get duration
          const status = await newSound.getStatusAsync();
          if (status.isLoaded) {
            setDuration(status.durationMillis || 0);
          }
        }
      } catch (error) {
        console.error('❌ [AudioPlayer] Error loading sound:', error);
      }
    }

    loadSound();

    return () => {
      isMounted = false;
      if (sound) {
        console.log('🧹 [AudioPlayer] Unloading sound');
        sound.unloadAsync();
      }
    };
  }, [audioUri]);

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis || 0);
      setIsPlaying(status.isPlaying);
      
      // Auto-stop at end
      if (status.didJustFinish) {
        setIsPlaying(false);
        sound?.setPositionAsync(0);
      }
    }
  };

  const handlePlayPause = async () => {
    if (!sound) return;

    try {
      const status = await sound.getStatusAsync();
      
      if (status.isLoaded) {
        if (isPlaying) {
          await sound.pauseAsync();
        } else {
          await sound.playAsync();
        }
      }
    } catch (error) {
      console.error('❌ [AudioPlayer] Error playing/pausing:', error);
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Transcription Preview */}
      {transcription && (
        <View style={[styles.transcriptionBox, { 
          backgroundColor: theme.transcriptionBg,
          borderColor: theme.transcriptionBorder,
        }]}>
          <Text style={[styles.transcriptionLabel, { color: theme.transcriptionLabel }]}>Transcrição:</Text>
          <Text style={[styles.transcriptionText, { color: theme.transcriptionText }]} numberOfLines={2}>
            {transcription}
          </Text>
        </View>
      )}

      {/* Player Controls */}
      <View style={styles.playerContainer}>
        <Pressable 
          style={[styles.playButton, { backgroundColor: theme.playButtonBg }]} 
          onPress={handlePlayPause}
        >
          <Icon 
            name={isPlaying ? 'pause' : 'play_arrow'} 
            size={24} 
            color={theme.progressFill} 
          />
        </Pressable>

        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: theme.progressBg }]}>
            <View style={[styles.progressFill, { backgroundColor: theme.progressFill, width: `${progress}%` }]} />
          </View>
          <View style={styles.timeContainer}>
            <Text style={[styles.timeText, { color: theme.timeText }]}>{formatTime(position)}</Text>
            <Text style={[styles.timeText, { color: theme.timeText }]}>{formatTime(duration)}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {onDelete && (
          <Pressable style={[styles.deleteButton, {
            backgroundColor: theme.deleteButtonBg,
            borderColor: theme.deleteButtonBorder,
          }]} onPress={onDelete}>
            <Icon name="delete" size={20} color={theme.deleteButtonText} />
            <Text style={[styles.deleteButtonText, { color: theme.deleteButtonText }]}>Deletar</Text>
          </Pressable>
        )}
        
        {onReRecord && (
          <Pressable style={[styles.reRecordButton, {
            backgroundColor: theme.reRecordButtonBg,
            borderColor: theme.reRecordButtonBorder,
          }]} onPress={onReRecord}>
            <Icon name="mic" size={20} color={theme.reRecordButtonText} />
            <Text style={[styles.reRecordButtonText, { color: theme.reRecordButtonText }]}>Re-gravar</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  transcriptionBox: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  transcriptionLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  transcriptionText: {
    fontSize: 13,
    lineHeight: 18,
  },
  playerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flex: 1,
    gap: 4,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reRecordButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  reRecordButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

