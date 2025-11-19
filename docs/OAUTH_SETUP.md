# OAuth Setup Guide

Este guia documenta como configurar o login social com Google e X (Twitter) no dpnotes.ai.

## 📋 Visão Geral

O app suporta autenticação via:
- ✅ **Email/Password** (Supabase Auth)
- ✅ **Google OAuth**
- ✅ **X (Twitter) OAuth**

## 🔧 Configuração no Supabase

### 1. Acesse o Dashboard do Supabase

Navegue até: **Authentication > Providers**

### 2. Configurar Google OAuth

#### 2.1 Criar Projeto no Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto ou selecione um existente
3. Ative a **Google+ API**

#### 2.2 Criar Credenciais OAuth 2.0

1. Vá em **APIs & Services > Credentials**
2. Clique em **Create Credentials > OAuth client ID**
3. Tipo: **Web application**
4. Nome: `dpnotes.ai`

5. **Authorized JavaScript origins:**
   ```
   https://<SEU-PROJETO>.supabase.co
   ```

6. **Authorized redirect URIs:**
   ```
   https://<SEU-PROJETO>.supabase.co/auth/v1/callback
   ```

7. Copie o **Client ID** e **Client Secret**

#### 2.3 Configurar no Supabase

1. No Dashboard do Supabase, vá em **Authentication > Providers**
2. Habilite **Google**
3. Cole o **Client ID** e **Client Secret**
4. Salve as alterações

### 3. Configurar X (Twitter) OAuth

#### 3.1 Criar App no Twitter Developer Portal

1. Acesse: https://developer.twitter.com/en/portal/dashboard
2. Crie um novo projeto e app
3. Configure as permissões necessárias

#### 3.2 Obter Credenciais

1. Na aba **Keys and tokens**
2. Copie o **API Key** e **API Secret Key**

#### 3.3 Configurar Callback URL

No Twitter Developer Portal, adicione:
```
https://<SEU-PROJETO>.supabase.co/auth/v1/callback
```

#### 3.4 Configurar no Supabase

1. No Dashboard do Supabase, vá em **Authentication > Providers**
2. Habilite **Twitter**
3. Cole o **API Key** (como Client ID) e **API Secret Key** (como Client Secret)
4. Salve as alterações

## 📱 Configuração no App

### Deep Links

O app está configurado para usar o deep link:
```
dpnotes://auth/callback
```

### app.json

Certifique-se de que o `app.json` inclui:

```json
{
  "expo": {
    "scheme": "dpnotes",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "dpnotes",
              "host": "auth",
              "pathPrefix": "/callback"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    "ios": {
      "bundleIdentifier": "com.dpnotes.app",
      "associatedDomains": ["applinks:dpnotes.app"]
    }
  }
}
```

## 🔒 Segurança

### RLS Policies

Certifique-se de que as políticas de Row Level Security (RLS) estão configuradas para aceitar usuários autenticados via OAuth:

```sql
-- Exemplo de política RLS
CREATE POLICY "Users can access their own data"
ON projects
FOR ALL
USING (auth.uid() = user_id);
```

### Profile Auto-Creation

O sistema cria automaticamente um perfil para usuários OAuth usando o Supabase Auth Hook ou um trigger:

```sql
-- Trigger para criar profile automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 🧪 Testando

### Desenvolvimento Local

Para testar OAuth em desenvolvimento:

1. Use o Expo Go:
   ```bash
   npx expo start
   ```

2. O Expo Go automaticamente gerencia os deep links em desenvolvimento

3. Clique em "Continue with Google" ou "Continue with X"

4. O navegador abrirá para autenticação

5. Após autenticação, você será redirecionado de volta ao app

### Produção

Para produção:

1. Build o app:
   ```bash
   eas build --platform android
   # ou
   eas build --platform ios
   ```

2. Configure os deep links nas lojas (Google Play Store / Apple App Store)

3. Teste o fluxo completo de OAuth

## 📝 Troubleshooting

### Erro: "Invalid redirect URI"

- Verifique se a URL de callback no Google/Twitter está correta
- Certifique-se de incluir o protocolo `https://`

### Erro: "OAuth provider not configured"

- Verifique se o provider está habilitado no Supabase Dashboard
- Confirme que as credenciais foram salvas corretamente

### Deep Link não funciona

- No Android: verifique os `intentFilters` no `app.json`
- No iOS: verifique o `bundleIdentifier` e `associatedDomains`
- Reinstale o app após mudanças no `app.json`

## 🔗 Referências

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [Twitter OAuth Documentation](https://developer.twitter.com/en/docs/authentication/oauth-2-0)
- [Expo Linking](https://docs.expo.dev/guides/linking/)

## ✅ Checklist de Setup

- [ ] Google Cloud Console configurado
- [ ] Twitter Developer Portal configurado
- [ ] Providers habilitados no Supabase
- [ ] Deep links configurados no app.json
- [ ] RLS policies atualizadas
- [ ] Profile auto-creation configurado
- [ ] Testado em desenvolvimento
- [ ] Testado em produção





