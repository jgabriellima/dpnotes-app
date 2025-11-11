# 📊 Sistema de Logging - Deep Research Notes

## Visão Geral

O app possui um sistema completo de logging com **total observabilidade** que captura:
- ✅ Erros JavaScript/TypeScript
- ✅ Erros de módulos nativos (Java/Kotlin/Swift)
- ✅ Erros de bridge (comunicação JS ↔ Native)
- ✅ Erros não tratados de Promises
- ✅ Erros de componentes React (Error Boundary)
- ✅ Erros globais não capturados
- ✅ Logs de debug, info, warn, error e fatal
- ✅ Persistência de logs em AsyncStorage
- ✅ Histórico de logs com exportação
- ✅ Informações de dispositivo e sessão

## Como Usar

### Logging Básico

```typescript
import { logger, logInfo, logError, logWarn, logDebug } from '../utils/logger';

// Log de informação
logger.info('Usuário fez login', { userId: '123' });
logInfo('Operação concluída');

// Log de warning
logger.warn('Cache quase cheio', { usage: '85%' });
logWarn('Atenção necessária');

// Log de erro
logger.error('Falha ao salvar', error);
logError('Erro crítico', error, { context: 'save' });

// Log de debug (só aparece em desenvolvimento)
logger.debug('Estado atualizado', { state });
logDebug('Debug info');
```

### Logging de Erros Nativos

Para capturar erros Java como `java.lang.String cannot be cast to java.lang.Boolean`:

```typescript
import { logger } from '../utils/logger';

try {
  // Chamada a módulo nativo
  await NativeModule.someMethod();
} catch (error) {
  logger.logNativeError('NativeModule', 'someMethod', error);
}
```

### Logging de Erros de Bridge

```typescript
import { logger } from '../utils/logger';

try {
  const result = await bridge.callMethod('getData');
} catch (error) {
  logger.logBridgeError('getData', error);
}
```

## Visualizando Logs

### Durante Desenvolvimento

Os logs aparecem automaticamente no console:
- **Info/Warn**: Console normal
- **Error/Fatal**: Console.error (vermelho)
- **Debug**: Só em `__DEV__`

### Log Viewer Component

Em desenvolvimento, você pode usar o componente `LogViewer` para visualizar todos os logs:

```typescript
import { LogViewer } from '../src/components/LogViewer';
import { useState } from 'react';

function MyScreen() {
  const [showLogs, setShowLogs] = useState(false);
  
  return (
    <>
      <Button onPress={() => setShowLogs(true)}>Ver Logs</Button>
      <LogViewer visible={showLogs} onClose={() => setShowLogs(false)} />
    </>
  );
}
```

O LogViewer oferece:
- Visualização em tempo real
- Filtros por nível (debug, info, warn, error, fatal)
- Exportação de logs
- Limpeza de histórico
- Stack traces completos

### No Android (Logcat)

Para ver logs nativos do Android:

```bash
# Ver todos os logs do app
adb logcat | grep -i "deep.research"

# Ver apenas erros
adb logcat *:E | grep -i "deep.research"

# Ver logs em tempo real
adb logcat -c && adb logcat | grep -E "(ReactNative|DeepResearch|NATIVE-ANDROID)"
```

### Exportar Logs

```typescript
import { logger } from '../utils/logger';

// Obter logs recentes
const recentErrors = logger.getRecentLogs('error', 50);

// Exportar todos os logs como string
const logString = logger.exportLogs();
console.log(logString);

// Limpar histórico
logger.clearHistory();
```

## Estrutura dos Logs

Cada log contém:
- **timestamp**: ISO 8601
- **level**: debug | info | warn | error
- **message**: Mensagem descritiva
- **platform**: android | ios | web
- **data**: Dados adicionais (JSON)
- **stack**: Stack trace (se erro)

Exemplo:
```
[2025-11-09T10:30:45.123Z] [ERROR] [ANDROID] Native Error [NativeModule.someMethod]
Data: {
  "module": "NativeModule",
  "method": "someMethod",
  "errorType": "object",
  "errorString": "java.lang.String cannot be cast to java.lang.Boolean"
}
Stack: Error: java.lang.String cannot be cast to java.lang.Boolean
    at ...
```

## Error Boundary

O app tem um Error Boundary global que captura erros de componentes React:

```typescript
// Erros são automaticamente capturados e logados
// O usuário vê uma tela de erro amigável
```

## Configuração

### Habilitar Logs Verbosos

No `app.json`, já está configurado para:
- Desabilitar ProGuard (facilita debugging)
- Desabilitar shrink resources (mantém nomes de classes)

### Em Produção

Os logs de debug são automaticamente desabilitados. Para produção, considere integrar com:
- Sentry
- Bugsnag
- Firebase Crashlytics

## Troubleshooting

### Erro Java não aparece nos logs

1. Verifique o Logcat do Android:
   ```bash
   adb logcat | grep -i "classcastexception"
   ```

2. Use o logger nativo:
   ```typescript
   logger.logNativeError('ModuleName', 'methodName', error);
   ```

3. Verifique se o erro está sendo capturado pelo Error Boundary

### Logs muito verbosos

Use níveis de log apropriados:
- `debug`: Apenas desenvolvimento
- `info`: Informações importantes
- `warn`: Avisos
- `error`: Apenas erros

## Boas Práticas

1. ✅ Sempre logue erros com contexto
2. ✅ Use `logNativeError` para erros de módulos nativos
3. ✅ Não logue informações sensíveis (senhas, tokens)
4. ✅ Use níveis de log apropriados
5. ✅ Adicione contexto útil nos logs

## Exemplo Completo

```typescript
import { logger } from '../utils/logger';

async function saveDocument(document: Document) {
  try {
    logger.info('Iniciando salvamento', { docId: document.id });
    
    const result = await database.save(document);
    
    logger.info('Documento salvo com sucesso', { 
      docId: document.id,
      resultId: result.id 
    });
    
    return result;
  } catch (error) {
    logger.error('Falha ao salvar documento', error, {
      docId: document.id,
      docSize: document.content.length,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}
```

