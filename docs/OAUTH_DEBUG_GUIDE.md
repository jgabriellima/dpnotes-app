# OAuth Debug Guide - Social Login

## 🔍 Como Debugar o Social Login

### Passo 1: Verificar os Console Logs

Quando você clica em "Continue with Google" ou "Continue with X", o console deve mostrar:

```
🔵 Iniciando Google OAuth...
Redirect URL: exp://192.168.x.x:8081/--/auth/callback
Abrindo navegador...
Resultado do navegador: { type: "success", url: "..." }
✅ Login com Google bem-sucedido!
```

**Se não aparecer nada:** O botão não está conectado ao handler.

**Se aparecer erro:** Veja qual erro específico está sendo mostrado.

### Passo 2: Verificar se o Navegador Abre

Quando você clica no botão, um navegador deve abrir automaticamente.

**Se o navegador não abrir:**
- O OAuth não está configurado no Supabase
- Ou há um erro na configuração

**Se o navegador abrir mas mostrar erro 400:**
- Os providers não estão habilitados no Supabase Dashboard
- Ou as credenciais estão incorretas

### Passo 3: Tipos de Erro Comuns

#### Erro 1: "URL de autenticação não retornada pelo Supabase"
**Causa:** Providers não configurados no Supabase
**Solução:** 
1. Acesse o Supabase Dashboard
2. Vá em Authentication > Providers
3. Habilite Google e/ou Twitter
4. Configure as credenciais

#### Erro 2: "400 Bad Request" no navegador
**Causa:** Provider habilitado mas mal configurado
**Solução:**
1. Verifique se o Client ID e Secret estão corretos
2. Verifique se a Redirect URI está correta no Google/Twitter
3. A URL deve ser: `https://<SEU-PROJETO>.supabase.co/auth/v1/callback`

#### Erro 3: Navegador abre e fecha, mas nada acontece
**Causa:** Redirect não está funcionando ou tokens não estão sendo extraídos
**Solução:** Verificar os console.logs para ver o "Resultado do navegador"

#### Erro 4: "skipBrowserRedirect is not supported"
**Causa:** Versão antiga do Supabase
**Solução:** Atualizar `@supabase/supabase-js` para a versão mais recente

### Passo 4: Testar Passo a Passo

#### Teste 1: Verificar Configuração Básica
```typescript
// No console do app, você deve ver ao clicar:
console.log('🔵 Iniciando Google OAuth...');
```

Se não aparecer, o botão não está chamando a função.

#### Teste 2: Verificar Redirect URL
```typescript
// Deve aparecer algo como:
Redirect URL: exp://192.168.1.10:8081/--/auth/callback
```

Se aparecer, está tudo bem.

#### Teste 3: Verificar Supabase Response
```typescript
// Após chamar signInWithOAuth, deve retornar:
{ data: { url: "https://..." }, error: null }
```

Se `data.url` estiver vazio ou `error` não for null, há problema no Supabase.

#### Teste 4: Verificar WebBrowser
```typescript
// Após abrir o navegador, deve retornar:
{ type: "success", url: "exp://..." }
// ou
{ type: "cancel" }
```

## 🛠️ Comandos de Debug

### Reiniciar o Servidor
```bash
# IMPORTANTE: Reinicie após mudanças no app.json
npx expo start --clear
```

### Verificar Logs em Tempo Real
```bash
# Android
npx expo start --android

# No terminal, você verá todos os console.logs
```

### Verificar Deep Links
```bash
# Testar se deep links estão funcionando
npx uri-scheme open "dpnotes://auth/callback?access_token=test" --android
```

## ⚙️ Configuração Mínima Necessária

### 1. Supabase Dashboard
```
✅ Authentication > Providers > Google > Habilitado
✅ Authentication > Providers > Twitter > Habilitado
✅ Client ID e Secret configurados
✅ Redirect URI configurada
```

### 2. Google Cloud Console (para Google OAuth)
```
✅ OAuth 2.0 Client ID criado
✅ Authorized redirect URIs: https://<PROJETO>.supabase.co/auth/v1/callback
✅ OAuth consent screen configurado
```

### 3. Twitter Developer Portal (para X OAuth)
```
✅ App criado
✅ API Key e Secret copiados
✅ Callback URL: https://<PROJETO>.supabase.co/auth/v1/callback
✅ Permissões: Read + Write (ou só Read)
```

## 🧪 Como Testar SEM Configuração Completa

### Teste Básico (sem Google/Twitter configurados)

1. Clique no botão "Continue with Google"
2. Verifique o console
3. Você deve ver um Alert com erro tipo:

```
"OAuth provider is not enabled"
ou
"Invalid provider"
```

**Isso significa que o código está funcionando**, mas os providers não estão configurados no Supabase.

### Teste com Providers Configurados

1. Configure Google/Twitter no Supabase (veja OAUTH_SETUP.md)
2. Reinicie o servidor: `npx expo start --clear`
3. Clique no botão
4. Navegador deve abrir
5. Faça login no Google/Twitter
6. Você será redirecionado de volta ao app
7. App deve ir para a Home automaticamente

## 📝 Checklist de Troubleshooting

Quando o social login não funcionar, verifique na ordem:

- [ ] **1. Console.log aparece?**
  - Se não: botão não está conectado ao handler
  - Se sim: prossiga

- [ ] **2. "Abrindo navegador..." aparece?**
  - Se não: erro antes de abrir navegador (veja o erro)
  - Se sim: prossiga

- [ ] **3. Navegador abre?**
  - Se não: providers não configurados no Supabase
  - Se sim: prossiga

- [ ] **4. Navegador mostra erro 400?**
  - Provider mal configurado (verifique Client ID/Secret)

- [ ] **5. Navegador fecha mas não loga?**
  - Problema no redirect ou extração de tokens
  - Verifique "Resultado do navegador" no console

- [ ] **6. Tudo funciona mas não redireciona para Home?**
  - Problema no AuthContext detectando a sessão
  - Ou problema no router.replace()

## 🔴 Erros Esperados (Antes de Configurar)

Se você NÃO configurou Google/Twitter ainda, é **ESPERADO** ver estes erros:

```
❌ "OAuth provider is not enabled"
❌ "Invalid provider"
❌ "Provider not found"
```

**Estes erros são NORMAIS** e indicam que você precisa:
1. Configurar Google Cloud Console / Twitter Developer Portal
2. Configurar os providers no Supabase Dashboard
3. Seguir o guia em `docs/OAUTH_SETUP.md`

## ✅ Sinais de Sucesso

Quando tudo estiver funcionando corretamente, você verá:

```
✅ Console: "🔵 Iniciando Google OAuth..."
✅ Console: "Redirect URL: exp://..."
✅ Console: "Abrindo navegador..."
✅ Navegador abre
✅ Você faz login no Google/Twitter
✅ Navegador fecha automaticamente
✅ Console: "Resultado do navegador: { type: success }"
✅ Console: "✅ Login com Google bem-sucedido!"
✅ App redireciona para a Home
✅ Você está logado!
```

## 📞 Precisa de Ajuda?

Se após seguir este guia o OAuth ainda não funcionar:

1. Copie todos os console.logs
2. Tire screenshot do erro (se houver)
3. Verifique se seguiu TODOS os passos do `docs/OAUTH_SETUP.md`
4. Certifique-se de que reiniciou o servidor após mudanças






