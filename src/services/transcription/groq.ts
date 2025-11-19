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

import { File } from 'expo-file-system/next';

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
    console.log('🎵 [Groq] Starting transcription for URI:', audioUri);

    // Validate and normalize URI
    let normalizedUri = audioUri;
    if (!audioUri || typeof audioUri !== 'string') {
      throw new Error('Invalid audio URI provided');
    }

    // Ensure file:// protocol for FileSystem API
    if (!audioUri.startsWith('file://')) {
      normalizedUri = `file://${audioUri}`;
      console.log('🎵 [Groq] Normalized URI:', normalizedUri);
    }

    // Try to get file info (optional validation) using new File API
    try {
      const file = new File(normalizedUri);
      const exists = file.exists;
      console.log('🎵 [Groq] File exists:', exists);
      
      if (!exists) {
        console.warn('⚠️ [Groq] File not found at path, but will attempt transcription anyway');
      } else {
        const fileSize = file.size;
        
        // Validate file size (max 100 MB)
        const maxSize = 100 * 1024 * 1024; // 100 MB in bytes
        if (fileSize > maxSize) {
          throw new Error(`Audio file exceeds maximum size of 100 MB (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);
        }
        console.log(`🎵 [Groq] File size: ${(fileSize / 1024).toFixed(2)} KB`);
      }
    } catch (fileCheckError) {
      // Log but don't fail - some platforms may not support file info check
      console.warn('⚠️ [Groq] Could not verify file info, proceeding with transcription:', fileCheckError);
    }

    // Prepare form data
    const formData = new FormData();
    
    // Add audio file - use original URI for FormData (it handles different formats)
    const filename = audioUri.split('/').pop() || 'audio.m4a';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `audio/${match[1]}` : 'audio/m4a';
    
    console.log('🎵 [Groq] File details:', { filename, type });
    
    formData.append('file', {
      uri: audioUri, // Use original URI
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
    console.log('🎵 [Groq] Sending request to API...');
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    console.log('🎵 [Groq] API response status:', response.status);

    if (!response.ok) {
      let errorMessage = `Transcription failed with status ${response.status}`;
      try {
        const errorData: TranscriptionError = await response.json();
        errorMessage = errorData.details || errorData.error || errorMessage;
        console.error('🎵 [Groq] API error details:', errorData);
      } catch (parseError) {
        console.error('🎵 [Groq] Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('🎵 [Groq] Transcription successful, text length:', data.text?.length || 0);

    return {
      text: data.text || '',
      language: data.language,
      duration: data.duration,
    };
  } catch (error) {
    console.error('❌ [Groq] Transcription error:', error);
    
    // Provide more helpful error messages
    if (error instanceof Error) {
      // Check for common issues
      if (error.message.includes('Network request failed')) {
        throw new Error('Falha na conexão com o serviço de transcrição. Verifique sua conexão com a internet.');
      } else if (error.message.includes('Invalid audio URI')) {
        throw new Error('Arquivo de áudio inválido. Tente gravar novamente.');
      } else if (error.message.includes('API key')) {
        throw new Error('Chave de API não configurada. Configure EXPO_PUBLIC_GROQ_API_KEY.');
      }
    }
    
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

