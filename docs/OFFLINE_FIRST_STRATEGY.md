# Estratégia Offline-First - dpnotes.ai

## 🎯 Visão Geral

O **dpnotes.ai** segue uma arquitetura **offline-first**, permitindo que usuários utilizem o app sem necessidade de autenticação ou conexão com internet.

## 📋 Princípios

### 1. Modo Anônimo por Padrão
- ✅ Usuário pode usar o app sem criar conta
- ✅ Todos os dados são salvos localmente
- ✅ Funcionalidades completas disponíveis offline
- ✅ Autenticação é **opcional** e pode ser feita a qualquer momento

### 2. Dados Locais Primeiro
- ✅ Todos os dados são armazenados localmente (AsyncStorage / SQLite)
- ✅ App funciona 100% sem internet
- ✅ Sincronização com Supabase é opcional
- ✅ Quando autenticado, dados locais são sincronizados com a nuvem

### 3. Sincronização Opcional
- ✅ Usuário decide quando quer sincronizar
- ✅ Autenticação desbloqueia sincronização e backup
- ✅ Conflitos são resolvidos priorizando dados mais recentes
- ✅ Sincronização bidirecional (local ↔ nuvem)

## 🏗️ Arquitetura

### Camadas de Dados

```
┌─────────────────────────────────────┐
│         UI Components               │
│    (React Native Screens)           │
└─────────────────────────────────────┘
              ↓ ↑
┌─────────────────────────────────────┐
│      Hooks (useProjects, etc)       │
│    (React Query + Local State)      │
└─────────────────────────────────────┘
              ↓ ↑
┌─────────────────────────────────────┐
│       Storage Service               │
│   (Abstração: Local ou Cloud)       │
└─────────────────────────────────────┘
         ↓ ↑              ↓ ↑
┌──────────────────┐  ┌──────────────┐
│  Local Storage   │  │   Supabase   │
│  (AsyncStorage)  │  │   (Cloud)    │
└──────────────────┘  └──────────────┘
```

### Fluxo de Dados

#### Modo Anônimo (Padrão)
```
1. Usuário abre o app
2. Dados são lidos do AsyncStorage
3. Usuário cria projetos, documentos, anotações
4. Tudo é salvo localmente
5. Nenhuma sincronização acontece
```

#### Modo Autenticado (Opcional)
```
1. Usuário cria conta ou faz login
2. Dados locais são enviados para Supabase
3. Dados remotos são baixados e mesclados
4. Daqui pra frente: sync bidirecional automático
5. Usuário pode fazer logout e continuar offline
```

## 📱 Fluxo de Usuário

### Primeiro Acesso

```
┌─────────────────────────────────────┐
│      Tela de Boas-Vindas            │
│                                     │
│  [Continuar sem conta]  ← Destaque  │
│                                     │
│  ────────── ou ──────────           │
│                                     │
│  [Login]  [Criar conta]             │
└─────────────────────────────────────┘
```

**Opção Recomendada:** "Continuar sem conta" (modo anônimo)

### Durante o Uso (Anônimo)

```
Home Screen:
┌─────────────────────────────────────┐
│  👤 Modo Anônimo                    │
│                                     │
│  💡 Dica: Crie uma conta para       │
│     fazer backup dos seus dados     │
│                                     │
│  [Criar conta agora]                │
└─────────────────────────────────────┘
```

### Convertendo para Conta

```
Settings → Criar Conta:
┌─────────────────────────────────────┐
│  Você tem X projetos e Y anotações  │
│                                     │
│  Crie uma conta para:               │
│  ✓ Fazer backup na nuvem            │
│  ✓ Sincronizar entre dispositivos   │
│  ✓ Nunca perder seus dados          │
│                                     │
│  [Email] [Senha]                    │
│  [Criar conta e sincronizar]        │
└─────────────────────────────────────┘
```

Após criar conta:
- Dados locais são enviados para Supabase
- Modal de progresso: "Sincronizando seus dados..."
- Sucesso: "Todos os dados foram salvos na nuvem!"

## 🔧 Implementação Técnica

### Storage Service (Abstração)

```typescript
// src/services/storage/index.ts
export interface StorageService {
  // Projetos
  getProjects(): Promise<Project[]>;
  createProject(project: Omit<Project, 'id'>): Promise<Project>;
  updateProject(id: string, project: Partial<Project>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  
  // Documentos
  getDocuments(projectId: string): Promise<Document[]>;
  createDocument(doc: Omit<Document, 'id'>): Promise<Document>;
  // ... etc
}

// Implementações:
// - LocalStorageService (AsyncStorage) ← Padrão
// - CloudStorageService (Supabase) ← Quando autenticado
// - SyncStorageService (Ambos com sync) ← Quando autenticado
```

### Auth Context (Atualizado)

```typescript
interface AuthContextType {
  user: User | null;
  isAnonymous: boolean;  // ← Novo
  loading: boolean;
  
  // Métodos existentes
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string, name: string): Promise<void>;
  signOut(): Promise<void>;
  
  // Novos métodos
  continueAnonymous(): void;  // ← Novo
  convertToAccount(email: string, password: string): Promise<void>;  // ← Novo
}
```

### Storage Strategy

```typescript
// Determinar qual storage usar
function getStorageService(): StorageService {
  const { isAnonymous } = useAuth();
  
  if (isAnonymous) {
    return new LocalStorageService();  // Apenas local
  } else {
    return new SyncStorageService();   // Local + Cloud com sync
  }
}
```

## 📦 Estrutura de Dados Local

### AsyncStorage Keys

```typescript
const STORAGE_KEYS = {
  PROJECTS: '@dpnotes:projects',
  DOCUMENTS: '@dpnotes:documents',
  ANNOTATIONS: '@dpnotes:annotations',
  LABELS: '@dpnotes:labels',
  USER_PREFERENCES: '@dpnotes:preferences',
  SYNC_STATUS: '@dpnotes:sync_status',
};
```

### Formato de Dados

```json
{
  "id": "local_uuid",
  "created_at": "2024-11-10T12:00:00Z",
  "updated_at": "2024-11-10T12:30:00Z",
  "synced": false,  // ← Flag de sincronização
  "remote_id": null, // ← ID no Supabase (quando sincronizado)
  // ... outros campos
}
```

## 🔄 Sincronização

### Estratégia de Sync

#### 1. Upload (Local → Cloud)
```
Para cada item local não sincronizado:
1. Verificar se já existe no cloud (por remote_id)
2. Se não existe: criar no cloud
3. Se existe: atualizar no cloud (se local mais recente)
4. Marcar como synced
5. Salvar remote_id
```

#### 2. Download (Cloud → Local)
```
Para cada item no cloud:
1. Verificar se já existe localmente (por remote_id)
2. Se não existe: criar localmente
3. Se existe: atualizar local (se cloud mais recente)
4. Marcar como synced
```

#### 3. Resolução de Conflitos
```
Conflito = mesmo item modificado em ambos os lugares

Estratégia: Last-Write-Wins (mais recente ganha)
- Comparar updated_at
- Se local mais recente: usar local
- Se cloud mais recente: usar cloud
- Notificar usuário sobre conflito resolvido
```

## 🎨 UI/UX do Modo Anônimo

### Indicadores Visuais

#### Badge "Modo Anônimo"
```tsx
<View className="flex flex-row items-center gap-2 bg-yellow-50 px-3 py-2 rounded-full">
  <Icon name="cloud_off" size={16} color="#F59E0B" />
  <Text className="text-yellow-700 text-sm">Modo Anônimo</Text>
</View>
```

#### Banner de Incentivo
```tsx
<Card className="bg-blue-50 border-blue-200">
  <View className="flex flex-row items-start gap-3">
    <Icon name="backup" size={24} color="#3B82F6" />
    <View className="flex-1">
      <Text className="font-bold text-blue-900">
        Proteja seus dados
      </Text>
      <Text className="text-blue-700 text-sm mt-1">
        Crie uma conta para fazer backup na nuvem e acessar de qualquer lugar.
      </Text>
      <Button variant="primary" size="sm" className="mt-3">
        Criar conta agora
      </Button>
    </View>
  </View>
</Card>
```

### Settings (Modo Anônimo)

```tsx
<View className="flex flex-col gap-4">
  {/* Perfil Anônimo */}
  <Card>
    <View className="items-center">
      <Icon name="person_outline" size={48} color="#6C6F7D" />
      <Text className="text-xl font-bold mt-2">Usuário Anônimo</Text>
      <Text className="text-text-secondary text-sm">
        Seus dados estão salvos apenas neste dispositivo
      </Text>
    </View>
  </Card>
  
  {/* Estatísticas */}
  <Card>
    <Text className="font-bold mb-2">Seus Dados</Text>
    <Text>📁 3 projetos</Text>
    <Text>📝 12 documentos</Text>
    <Text>🏷️ 24 anotações</Text>
  </Card>
  
  {/* CTA */}
  <Button variant="primary" fullWidth>
    Criar conta e fazer backup
  </Button>
  
  <Button variant="secondary" fullWidth>
    Já tenho conta - Fazer login
  </Button>
</View>
```

## 📊 Vantagens da Abordagem Offline-First

### Para o Usuário
✅ **Uso imediato** - Não precisa criar conta para testar
✅ **Privacidade** - Dados ficam no dispositivo
✅ **Sempre funciona** - Não depende de internet
✅ **Rápido** - Sem latência de rede
✅ **Flexibilidade** - Decide quando quer sincronizar

### Para o Desenvolvimento
✅ **Menos dependências** - Pode desenvolver sem Supabase funcionando
✅ **Mais rápido** - Não precisa configurar auth primeiro
✅ **Melhor UX** - Usuário não enfrenta barreiras iniciais
✅ **Testes mais fáceis** - Não precisa de conta para testar
✅ **Priorização correta** - Foco na funcionalidade core primeiro

## 🚀 Roadmap de Implementação

### Fase 1: Modo Anônimo Básico (Atual) ✅
- [x] Remover proteção obrigatória de rotas
- [x] Adicionar opção "Continuar sem conta"
- [x] Implementar flag isAnonymous no AuthContext
- [x] Permitir uso do app sem login

### Fase 2: Storage Local (Próximo)
- [ ] Implementar LocalStorageService com AsyncStorage
- [ ] Migrar hooks para usar LocalStorageService
- [ ] Testar CRUD completo offline
- [ ] Adicionar indicadores visuais de modo anônimo

### Fase 3: Conversão de Conta
- [ ] Implementar tela de conversão (anônimo → autenticado)
- [ ] Migrar dados locais para Supabase na conversão
- [ ] Adicionar feedback de progresso
- [ ] Testar fluxo completo de conversão

### Fase 4: Sincronização
- [ ] Implementar SyncStorageService
- [ ] Adicionar lógica de upload (local → cloud)
- [ ] Adicionar lógica de download (cloud → local)
- [ ] Implementar resolução de conflitos
- [ ] Adicionar UI de status de sync

### Fase 5: Refinamentos
- [ ] Adicionar sync em background
- [ ] Implementar retry automático em caso de falha
- [ ] Adicionar logs de sync para debug
- [ ] Otimizar performance (batch operations)
- [ ] Implementar sync incremental (apenas mudanças)

## 🎯 Decisões de Design

### Por que Offline-First?
1. **Melhor UX** - Usuário pode usar o app imediatamente
2. **Maior adoção** - Sem barreiras de entrada
3. **Mais confiável** - Funciona mesmo sem internet
4. **Privacidade** - Usuário controla seus dados
5. **Desenvolvimento mais rápido** - Menos dependências

### Por que AsyncStorage (não SQLite)?
- **Simplicidade** - Mais fácil de implementar
- **Suficiente** - Para o volume de dados esperado
- **Nativo** - Já incluído no React Native
- **Migração fácil** - Pode migrar para SQLite depois se necessário

### Por que Sincronização Manual (inicialmente)?
- **Controle** - Usuário decide quando sincronizar
- **Menos complexo** - Não precisa de workers/background tasks
- **Bateria** - Não drena bateria com sync contínuo
- **Evolução** - Pode adicionar auto-sync depois

## ✅ Estado Atual

**Modo Anônimo:** ✅ Implementado
**Storage Local:** 🚧 Em desenvolvimento
**Sincronização:** ⏳ Planejado
**UI Refinada:** ⏳ Planejado

---

**Última atualização:** 10 de Novembro de 2025
**Status:** Estratégia Definida, Implementação Iniciada







