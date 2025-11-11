# Debug Guide - Crash na Tela de Anotação

## O que foi adicionado:

### 1. ErrorBoundary
Um componente que captura qualquer erro do React e mostra na tela com stack trace completo.

### 2. Logs detalhados
Logs com emojis para facilitar busca:
- 🚀 = Início de renderização
- 🔧 = Inicialização de hooks
- 👆 = Interações (tap, press)
- ❌ = Erros
- 🔴 = Erro crítico capturado pelo ErrorBoundary

### 3. Simplificação temporária
O componente `Word` agora usa `Pressable` simples ao invés de `GestureDetector`, que pode estar causando o crash.

### 4. Captura de logs nativos
Iniciados comandos para capturar logs do iOS e Android em arquivos.

## Como debugar:

### No Terminal do Metro/Expo:
Procure por logs que começam com os emojis acima. Exemplo:
```
🚀 [EditorScreen] Starting render
🔧 [useDocumentEditor] Initializing for documentId: demo
```

### Se o app crashar:
1. **iOS**: Olhe o arquivo `ios-logs.txt` que está sendo gerado
2. **Android**: Olhe o arquivo `android-logs.txt` que está sendo gerado
3. **React**: O ErrorBoundary deve mostrar o erro na tela com detalhes

### Para ver os logs em tempo real:

**iOS:**
```bash
npx react-native log-ios
```

**Android:**
```bash
npx react-native log-android
```

**Expo:**
```bash
npx expo start --clear
# Depois abra o app e olhe o terminal
```

### Comandos úteis:

```bash
# Ver últimas 50 linhas do log iOS
tail -50 ios-logs.txt

# Ver últimas 50 linhas do log Android
tail -50 android-logs.txt

# Buscar por erros
grep "❌\|🔴\|Error\|Exception" ios-logs.txt
grep "❌\|🔴\|Error\|Exception" android-logs.txt
```

## Próximos passos:

1. Recarregue o app (Cmd+R no iOS, R+R no Android)
2. Tente abrir a tela de anotação
3. Se crashar:
   - Veja se aparece a tela vermelha do ErrorBoundary
   - Copie o conteúdo e cole aqui
   - OU envie os logs do terminal/arquivos de log

