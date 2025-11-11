/**
 * Groq Whisper Transcription Service
 * 
 * Elegant implementation of Groq's Whisper Large V3 Turbo for audio transcription.
 * 
 * Features:
 * - Fast transcription (216x speed factor)
 * - 99+ languages supported
 * - $0.04 per hour of audio
 * - Max file size: 100 MB
 * - Supported formats: FLAC, MP3, M4A, MPEG, MPGA, OGG, WAV, WEBM
 * 
 * Documentation: https://console.groq.com/docs/model/whisper-large-v3-turbo
 */

import * as FileSystem from 'expo-file-system';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';
const MODEL = 'whisper-large-v3-turbo';

interface TranscriptionOptions {
  language?: string; // Optional: specify language code (e.g., 'en', 'pt', 'es')
  prompt?: string; // Optional: provide context to improve transcription
  temperature?: number; // Optional: 0-1, controls randomness (default: 0)
}

interface TranscriptionResponse {
  text: string;
  language?: string;
  duration?: number;
}

interface TranscriptionError {
  error: string;
  details?: string;
}

/**
 * Transcribe audio file using Groq Whisper API
 */
export async function transcribeAudio(
  audioUri: string,
  options: TranscriptionOptions = {}
): Promise<TranscriptionResponse> {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;

  if (!apiKey) {
    throw new Error(
      'Groq API key not found. Please set EXPO_PUBLIC_GROQ_API_KEY in your .env file and restart the server with --clear flag.'
    );
  }

  try {
    // Validate file exists and get info
    const fileInfo = await FileSystem.getInfoAsync(audioUri);
    if (!fileInfo.exists) {
      throw new Error('Audio file not found');
    }

    // Validate file size (max 100 MB)
    const maxSize = 100 * 1024 * 1024; // 100 MB in bytes
    if (fileInfo.size && fileInfo.size > maxSize) {
      throw new Error('Audio file exceeds maximum size of 100 MB');
    }

    // Prepare form data
    const formData = new FormData();
    
    // Add audio file
    const filename = audioUri.split('/').pop() || 'audio.m4a';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `audio/${match[1]}` : 'audio/m4a';
    
    formData.append('file', {
      uri: audioUri,
      type,
      name: filename,
    } as any);

    // Add required parameters
    formData.append('model', MODEL);

    // Add optional parameters
    if (options.language) {
      formData.append('language', options.language);
    }
    if (options.prompt) {
      formData.append('prompt', options.prompt);
    }
    if (options.temperature !== undefined) {
      formData.append('temperature', options.temperature.toString());
    }

    // Make API request
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData: TranscriptionError = await response.json();
      throw new Error(
        errorData.details || errorData.error || `Transcription failed with status ${response.status}`
      );
    }

    const data = await response.json();

    return {
      text: data.text || '',
      language: data.language,
      duration: data.duration,
    };
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
}

/**
 * Detect language from audio (transcribe without language hint)
 */
export async function detectLanguage(audioUri: string): Promise<string> {
  const result = await transcribeAudio(audioUri, {
    temperature: 0, // Use deterministic output for language detection
  });
  return result.language || 'en';
}

/**
 * Batch transcribe multiple audio files
 */
export async function transcribeBatch(
  audioUris: string[],
  options: TranscriptionOptions = {}
): Promise<TranscriptionResponse[]> {
  const promises = audioUris.map(uri => transcribeAudio(uri, options));
  return Promise.all(promises);
}

/**
 * Validate if audio format is supported by Groq Whisper
 */
export function isSupportedAudioFormat(filename: string): boolean {
  const supportedFormats = ['flac', 'mp3', 'm4a', 'mpeg', 'mpga', 'ogg', 'wav', 'webm'];
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? supportedFormats.includes(extension) : false;
}

/**
 * Calculate estimated transcription cost
 */
export function calculateTranscriptionCost(durationSeconds: number): number {
  const COST_PER_HOUR = 0.04; // $0.04 per hour
  const hours = durationSeconds / 3600;
  return hours * COST_PER_HOUR;
}

export default {
  transcribeAudio,
  detectLanguage,
  transcribeBatch,
  isSupportedAudioFormat,
  calculateTranscriptionCost,
};

