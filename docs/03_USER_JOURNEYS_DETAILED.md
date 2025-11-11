# 🚀 Jornadas do Usuário - Detalhamento Técnico

## Jornada 1: Importação de Conteúdo

### Fluxo Completo: Clipboard → App
```
1. [ChatGPT] → Usuário copia texto longo
2. [Deep Research Notes] → App detecta mudança no clipboard
3. [Permission] → App solicita permissão para acessar clipboard (primeira vez)
4. [Detection] → App mostra toast: "Texto detectado. Importar?"
5. [Confirmation] → Usuário confirma importação
6. [Processing] → App processa texto:
   - Normalização (quebras de linha, espaços)
   - Segmentação em parágrafos
   - Segmentação em sentenças
   - Detecção de idioma
7. [Storage] → Salva no SQLite local
8. [Navigation] → Navega para tela de edição
9. [Render] → Renderiza texto segmentado com tipografia elegante
```

### Casos Edge
- **Texto muito longo**: Mostra indicador de progresso
- **Texto mal formatado**: Algoritmo de limpeza inteligente
- **Clipboard vazio**: Botão manual "Colar Texto"
- **Texto duplicado**: Detecta e pergunta se quer substituir ou criar novo

### Implementação Técnica
```typescript
class ClipboardService {
  async detectClipboardChange(): Promise<string | null> {
    // Monitora clipboard em foreground
  }
  
  async processText(rawText: string): Promise<ProcessedDocument> {
    // 1. Normalização
    // 2. Segmentação
    // 3. Validação
  }
}
```

---

## Jornada 2: Seleção e Anotação

### Fluxo: Toque → Anotação
```
1. [Selection] → Usuário toca em sentença/parágrafo
2. [Highlight] → Texto é destacado com animação suave
3. [Modal] → Aparece painel contextual discreto:
   ┌─────────────────────────┐
   │ 🏷️  Aplicar Label       │
   │ 🎤  Gravar Áudio        │
   │ ✏️  Anotação Texto      │
   │ ⚙️  Editar Tags         │
   └─────────────────────────┘
4. [Action] → Usuário escolhe uma ação
5. [Processing] → App processa anotação
6. [Visual] → Atualiza UI com indicadores visuais
7. [Persistence] → Salva no banco local
```

### Sub-fluxo: Aplicar Label
```
1. [Label List] → Mostra labels disponíveis:
   - Labels pré-definidas (Expandir, Simplificar, etc.)
   - Labels do projeto atual
   - Labels usadas recentemente
   - "Criar nova label"
2. [Selection] → Usuário seleciona ou cria label
3. [Application] → Label é aplicada à sentença
4. [Visual Update] → Aparece "bolha" colorida ao lado do texto
5. [Usage Update] → Incrementa contador de uso da label
```

### Sub-fluxo: Gravação de Áudio
```
1. [Permission] → Solicita permissão de microfone (primeira vez)
2. [Recording UI] → Mostra interface de gravação:
   ┌─────────────────────┐
   │  🔴 Gravando...     │
   │  [===  ] 00:15     │
   │  [⏹️] [▶️] [🗑️]     │
   └─────────────────────┘
3. [Recording] → Grava áudio (máx 2 minutos)
4. [Preview] → Permite ouvir antes de confirmar
5. [Transcription] → Envia para Groq Whisper
6. [Processing] → Processa transcrição:
   - Detecção de idioma
   - Limpeza de texto
   - Identificação de intenções
7. [Storage] → Salva áudio local + transcrição
8. [Visual] → Mostra ícone de áudio discreto
```

### Sub-fluxo: Anotação de Texto
```
1. [Text Input] → Abre campo de texto expandido
2. [Typing] → Usuário digita anotação
3. [Suggestions] → App sugere labels baseado no texto
4. [Auto-save] → Salva automaticamente a cada 2 segundos
5. [Completion] → Usuário finaliza e confirma
```

---

## Jornada 3: Visualização de Anotações

### Estados Visuais
```
Sentença sem anotação:
"Este é um exemplo de texto normal."

Sentença com label:
"Este é um exemplo de texto normal." [🏷️ Expandir]

Sentença com áudio:
"Este é um exemplo de texto normal." [🎤]

Sentença com texto + áudio:
"Este é um exemplo de texto normal." [✏️] [🎤]

Sentença com múltiplas anotações:
"Este é um exemplo de texto normal." [🏷️ Expandir] [✏️] [🎤]
```

### Interações na Visualização
- **Toque na sentença**: Abre painel de edição
- **Toque na label**: Mostra detalhes da anotação
- **Toque no ícone de áudio**: Reproduz áudio
- **Long press**: Menu contextual (editar, excluir, duplicar)

---

## Jornada 4: Composição e Exportação

### Fluxo: Exportar → ChatGPT
```
1. [Export Button] → Usuário clica em "Exportar" (sempre visível)
2. [Processing] → App compila todas as anotações:
   - Mapeia sentenças → anotações
   - Organiza labels por tipo
   - Formata transcrições de áudio
   - Gera índice de referências
3. [Preview] → Mostra preview do prompt final:
   ┌─────────────────────────────────┐
   │ ## Sumário das Anotações        │
   │ [T1] Expandir → Descrição...    │
   │ [T2] Simplificar → Descrição... │
   │                                 │
   │ ## Texto Anotado               │
   │ Parágrafo 1:                   │
   │ Sentença original [T1]         │
   │                                 │
   │ [📋 Copiar] [✏️ Editar]        │
   └─────────────────────────────────┘
4. [Copy] → Usuário copia prompt formatado
5. [Success] → Toast de confirmação: "Prompt copiado!"
6. [External] → Usuário cola no ChatGPT
```

### Formato de Exportação Dinâmico
```typescript
interface ExportFormat {
  language: 'pt' | 'en' | 'es';
  style: 'concise' | 'detailed' | 'academic';
  includeAudio: boolean;
  includeMetadata: boolean;
}

class ExportService {
  generatePrompt(document: Document, format: ExportFormat): string {
    // Gera prompt personalizado baseado nas preferências
  }
}
```

---

## Jornada 5: Gestão de Projetos

### Fluxo: Organização
```
1. [Home] → Usuário vê lista de projetos
2. [Create Project] → Cria novo projeto com:
   - Nome
   - Descrição opcional
   - Labels padrão do projeto
3. [Document Management] → Dentro do projeto:
   - Lista documentos
   - Estatísticas (total de anotações, labels mais usadas)
   - Histórico de atividades
4. [Label Evolution] → Sistema sugere:
   - Merge de labels similares
   - Criação de labels padrão
   - Labels mais eficientes baseadas no uso
```

---

## Jornada 6: Labels Evolutivas e Sugestões

### Fluxo: Aprendizado Inteligente
```
1. [Usage Tracking] → App monitora padrões:
   - Labels mais usadas
   - Combinações frequentes
   - Textos de anotação repetitivos
2. [Pattern Detection] → Identifica padrões:
   - "Sempre que uso 'Expandir', adiciono contexto sobre X"
   - "Gravo áudio similar para tipos específicos de texto"
3. [Smart Suggestions] → Sugere:
   ┌─────────────────────────────────┐
   │ 💡 Sugestão Inteligente         │
   │                                 │
   │ Notei que você frequentemente   │
   │ grava "adicionar exemplos".     │
   │                                 │
   │ Quer criar a label             │
   │ "Adicionar Exemplos"?           │
   │                                 │
   │ [✅ Criar] [❌ Ignorar] [⏭️ Não perguntar] │
   └─────────────────────────────────┘
4. [Label Creation] → Cria automaticamente se aceito
5. [Future Application] → Sugere label em contextos similares
```

---

## Jornada 7: Configurações e Personalização

### Preferências do Usuário
```
Settings:
├── Idioma (PT, EN, ES)
├── Tema (Claro/Escuro/Auto)
├── Transcrição
│   ├── Provider (Groq/Local)
│   ├── Idioma padrão
│   └── Qualidade áudio
├── Exportação
│   ├── Formato padrão
│   ├── Incluir metadados
│   └── Estilo de prompt
├── Labels
│   ├── Labels padrão
│   ├── Cores personalizadas
│   └── Sugestões automáticas
└── Dados
    ├── Backup local
    ├── Limpar cache
    └── Exportar dados
```

---

## Tratamento de Erros e Estados

### Estados de Loading
- **Importação**: Spinner + "Processando texto..."
- **Transcrição**: Pulse + "Transcrevendo áudio..."
- **Exportação**: Progress + "Gerando prompt..."

### Estados de Erro
- **Sem conexão**: Fallback para Whisper local
- **Áudio falhou**: Permite regravar ou pular
- **Texto corrompido**: Oferece edição manual
- **Quota excedida**: Upgrade para Enterprise

### Estados Vazios
- **Nenhum projeto**: Onboarding com exemplo
- **Documento vazio**: Dicas de como importar
- **Sem anotações**: Tutorial interativo