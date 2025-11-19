/**
 * AudioPlayer Component
 * 
 * Simple audio player for playback of recorded annotations
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import { Icon } from '../ui/Icon';

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
        <View style={styles.transcriptionBox}>
          <Text style={styles.transcriptionLabel}>Transcrição:</Text>
          <Text style={styles.transcriptionText} numberOfLines={2}>
            {transcription}
          </Text>
        </View>
      )}

      {/* Player Controls */}
      <View style={styles.playerContainer}>
        <Pressable 
          style={styles.playButton} 
          onPress={handlePlayPause}
        >
          <Icon 
            name={isPlaying ? 'pause' : 'play_arrow'} 
            size={24} 
            color="#8b5cf6" 
          />
        </Pressable>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {onDelete && (
          <Pressable style={styles.deleteButton} onPress={onDelete}>
            <Icon name="delete" size={20} color="#ef4444" />
            <Text style={styles.deleteButtonText}>Deletar</Text>
          </Pressable>
        )}
        
        {onReRecord && (
          <Pressable style={styles.reRecordButton} onPress={onReRecord}>
            <Icon name="mic" size={20} color="#8b5cf6" />
            <Text style={styles.reRecordButtonText}>Re-gravar</Text>
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
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  transcriptionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  transcriptionText: {
    fontSize: 13,
    color: '#374151',
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
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flex: 1,
    gap: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 11,
    color: '#6b7280',
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
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
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
    backgroundColor: '#f5f3ff',
    borderWidth: 1,
    borderColor: '#ddd6fe',
  },
  reRecordButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b5cf6',
  },
});

