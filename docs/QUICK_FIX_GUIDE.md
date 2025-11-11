# Quick Fix Guide - Environment Variables

## Problema: "supabaseUrl is required"

O erro ocorre porque as variáveis de ambiente não estão sendo lidas corretamente.

### Solução

1. **Verifique se o arquivo `.env` existe na raiz do projeto:**

```bash
ls -la .env
```

2. **Verifique se as variáveis têm o prefixo `EXPO_PUBLIC_`:**

O arquivo `.env` deve conter:

```env
EXPO_PUBLIC_GROQ_API_KEY=your_groq_api_key
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

⚠️ **IMPORTANTE:** As variáveis DEVEM começar com `EXPO_PUBLIC_` para serem acessíveis no código.

3. **Reinicie o servidor com flag --clear:**

```bash
# Pare o servidor atual (Ctrl+C)
npx expo start --clear
```

O flag `--clear` limpa o cache do Metro bundler e força a releitura das variáveis de ambiente.

### Verificação

Após reiniciar, você NÃO deve ver mais o erro:
```
⚠️ Supabase credentials not found...
```

### Teste Rápido

Para verificar se as variáveis estão carregadas, adicione temporariamente no `app/(tabs)/index.tsx`:

```typescript
console.log('SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('Has URL:', !!process.env.EXPO_PUBLIC_SUPABASE_URL);
```

Se mostrar `undefined` ou `false`, o `.env` não está configurado corretamente.

## Outras Correções Feitas

### 1. Correção das Rotas

Removido o tab "Import" que não foi implementado.

### 2. Cores do Tab Bar

Atualizado para usar as cores do tema pastel coral:
- Active: `#ffccc3`
- Inactive: `#6C6F7D`

### 3. Acesso a Environment Variables

Mudado de `Constants.expoConfig.extra` para `process.env` (forma correta no Expo SDK 54).

## Checklist de Verificação

- [ ] Arquivo `.env` existe na raiz
- [ ] Variáveis começam com `EXPO_PUBLIC_`
- [ ] Servidor reiniciado com `--clear`
- [ ] Console não mostra warnings de Supabase
- [ ] App carrega sem erros

## Se Ainda Não Funcionar

1. **Delete a pasta `.expo`:**
```bash
rm -rf .expo
```

2. **Limpe o cache do npm/yarn:**
```bash
rm -rf node_modules
yarn install
# ou
rm -rf node_modules
npm install
```

3. **Reinicie com clear:**
```bash
npx expo start --clear
```

## Valores de Exemplo para Teste

Se quiser testar sem Supabase/Groq, use valores dummy:

```env
EXPO_PUBLIC_GROQ_API_KEY=gsk_test123
EXPO_PUBLIC_SUPABASE_URL=https://test.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=test_anon_key_123
```

⚠️ **Nota:** Com valores dummy, as funcionalidades de banco/transcription não funcionarão, mas o app não crashará na inicialização.

