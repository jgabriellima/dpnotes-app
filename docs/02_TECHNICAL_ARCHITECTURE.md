# 📐 Arquitetura Técnica - Deep Research Notes

## Stack Tecnológico

### Frontend Mobile
- **Framework**: Expo (Managed Workflow) + React Native
- **Linguagem**: TypeScript (strict mode)
- **Navegação**: expo-router (file-based routing)
- **Estado**: Zustand (lightweight state management)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Banco Local**: expo-sqlite
- **Áudio**: expo-av (recording/playback)
- **Clipboard**: expo-clipboard
- **Ads**: expo-ads-admob (free tier)

### Backend & Serviços
- **STT Primário**: Groq Whisper API
- **STT Fallback**: Whisper local (on-device)
- **Sync Enterprise**: Supabase + Row Level Security
- **Auth Enterprise**: Supabase Auth (Google, Apple, Twitter, Facebook)
- **Encryption**: AES-GCM (client-side)

## Estrutura de Dados

### SQLite Schema (Local)

```sql
-- Projetos do usuário
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Documentos importados
CREATE TABLE documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER,
  title TEXT,
  content TEXT NOT NULL,
  source_type TEXT DEFAULT 'clipboard', -- clipboard, manual, etc
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Sentenças segmentadas
CREATE TABLE sentences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  paragraph_index INTEGER NOT NULL,
  sentence_index INTEGER NOT NULL,
  FOREIGN KEY (document_id) REFERENCES documents(id),
  UNIQUE(document_id, order_index)
);

-- Labels/Tags
CREATE TABLE labels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  is_predefined BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Anotações nas sentenças
CREATE TABLE annotations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sentence_id INTEGER NOT NULL,
  label_id INTEGER,
  text_note TEXT,
  audio_file_path TEXT,
  audio_transcription TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sentence_id) REFERENCES sentences(id),
  FOREIGN KEY (label_id) REFERENCES labels(id)
);

-- Metadados de áudio
CREATE TABLE audio_blobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  annotation_id INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  duration_ms INTEGER,
  transcription_status TEXT DEFAULT 'pending', -- pending, completed, failed
  FOREIGN KEY (annotation_id) REFERENCES annotations(id)
);
```

## Arquitetura de Componentes

### Estrutura de Pastas
```
src/
├── app/                    # expo-router pages
├── components/             # Componentes reutilizáveis
│   ├── ui/                # Componentes básicos (Button, Input, etc)
│   ├── text/              # Componentes de texto (SentenceHighlight, etc)
│   ├── audio/             # Componentes de áudio
│   └── export/            # Componentes de exportação
├── services/              # Serviços e APIs
│   ├── database/          # SQLite operations
│   ├── transcription/     # STT services
│   ├── text-processing/   # Segmentação de texto
│   └── export/            # Geração de prompts
├── stores/                # Zustand stores
├── types/                 # TypeScript types
├── utils/                 # Utilidades
├── constants/             # Constantes e configurações
└── locales/               # Internacionalização
```

## Interfaces TypeScript Principais

```typescript
interface Project {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Document {
  id: number;
  projectId?: number;
  title?: string;
  content: string;
  sourceType: 'clipboard' | 'manual' | 'import';
  createdAt: Date;
  updatedAt: Date;
}

interface Sentence {
  id: number;
  documentId: number;
  content: string;
  orderIndex: number;
  paragraphIndex: number;
  sentenceIndex: number;
}

interface Label {
  id: number;
  projectId?: number;
  name: string;
  color: string;
  isPredefined: boolean;
  usageCount: number;
  createdAt: Date;
}

interface Annotation {
  id: number;
  sentenceId: number;
  labelId?: number;
  textNote?: string;
  audioFilePath?: string;
  audioTranscription?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TranscriptionResult {
  text: string;
  language: string;
  confidence: number;
}

interface Transcriber {
  transcribe(audioUri: string): Promise<TranscriptionResult>;
}
```

## Fluxo de Dados

### 1. Importação de Texto
```
Clipboard → TextProcessor → Document → Sentences → UI
```

### 2. Anotação
```
User Selection → Annotation Modal → Label/Audio → Database → UI Update
```

### 3. Transcrição
```
Audio Recording → GroqWhisper/LocalWhisper → Transcription → Database
```

### 4. Exportação
```
Document + Annotations → ExportService → Formatted Prompt → Clipboard
```

## Padrões de Design

### Strategy Pattern - Transcription
```typescript
class TranscriptionService {
  private transcriber: Transcriber;
  
  constructor(useLocal: boolean = false) {
    this.transcriber = useLocal 
      ? new LocalWhisperTranscriber()
      : new GroqWhisperTranscriber();
  }
  
  async transcribe(audioUri: string): Promise<TranscriptionResult> {
    return this.transcriber.transcribe(audioUri);
  }
}
```

### Repository Pattern - Database
```typescript
interface DocumentRepository {
  create(document: Omit<Document, 'id'>): Promise<Document>;
  findById(id: number): Promise<Document | null>;
  findByProject(projectId: number): Promise<Document[]>;
  update(id: number, updates: Partial<Document>): Promise<Document>;
  delete(id: number): Promise<void>;
}
```

### Observer Pattern - State Management
```typescript
interface AppStore {
  // Current document being edited
  currentDocument: Document | null;
  selectedSentences: number[];
  annotations: Record<number, Annotation[]>;
  
  // Actions
  setCurrentDocument: (doc: Document) => void;
  addAnnotation: (annotation: Annotation) => void;
  selectSentence: (sentenceId: number) => void;
}
```

## Performance Considerations

### Text Processing
- Segmentação lazy loading para documentos grandes
- Virtualização da lista de sentenças
- Debounce para anotações de texto

### Audio
- Compressão de áudio antes do upload
- Cache local de transcrições
- Fallback automático entre providers

### Database
- Índices otimizados para queries frequentes
- Paginação para listas grandes
- Soft delete para preservar histórico

## Segurança (Enterprise)

### Client-Side Encryption
```typescript
class EncryptionService {
  private key: CryptoKey;
  
  async encrypt(data: string): Promise<string> {
    // AES-GCM encryption
  }
  
  async decrypt(encryptedData: string): Promise<string> {
    // AES-GCM decryption
  }
}
```

### Supabase RLS
```sql
-- Row Level Security
CREATE POLICY "Users can only access their own data" 
ON documents FOR ALL 
USING (auth.uid() = user_id);
```