// Constants for Deep Research Notes

export const LABEL_COLORS = [
  '#3B82F6', // Blue - Expandir
  '#10B981', // Green - Simplificar
  '#F59E0B', // Amber - Esclarecer
  '#EF4444', // Red - Remover
  '#8B5CF6', // Purple - Contrapor
  '#06B6D4', // Cyan - Exemplificar
  '#EC4899', // Pink - Personalizar
  '#84CC16', // Lime - Corrigir
] as const;

export const PREDEFINED_LABELS = [
  { name: 'Expandir', color: LABEL_COLORS[0], isPredefined: true },
  { name: 'Simplificar', color: LABEL_COLORS[1], isPredefined: true },
  { name: 'Esclarecer', color: LABEL_COLORS[2], isPredefined: true },
  { name: 'Remover', color: LABEL_COLORS[3], isPredefined: true },
  { name: 'Contrapor', color: LABEL_COLORS[4], isPredefined: true },
  { name: 'Exemplificar', color: LABEL_COLORS[5], isPredefined: true },
] as const;

export const SUPPORTED_LANGUAGES = ['pt', 'en', 'es'] as const;

export const MAX_AUDIO_DURATION_MS = 120000; // 2 minutes

export const STT_PROVIDERS = {
  GROQ: 'groq',
  LOCAL: 'local',
} as const;

