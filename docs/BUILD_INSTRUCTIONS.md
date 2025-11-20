# 📦 Instruções de Build - Expo EAS Build

Este guia fornece instruções completas para criar builds de produção do aplicativo usando o Expo Application Services (EAS Build).

## 📋 Pré-requisitos

Antes de iniciar o processo de build, certifique-se de ter:

- Node.js instalado (versão 16 ou superior)
- Uma conta Expo (criar em https://expo.dev)
- Acesso à internet
- **Para iOS**: Conta Apple Developer Program (USD $99/ano)
- **Para Android**: Conta Google Play Developer (taxa única de USD $25)

## 🛠️ Instalação do EAS CLI

O EAS CLI é a ferramenta de linha de comando necessária para criar builds. Instale-o globalmente:

```bash
npm install -g eas-cli
```

Verifique a instalação:

```bash
eas --version
```

## 🔐 Autenticação

Faça login na sua conta Expo:

```bash
eas login
```

Você será solicitado a fornecer suas credenciais do Expo. Após o login bem-sucedido, suas credenciais serão armazenadas localmente.

## ⚙️ Configuração Inicial

### 1. Navegue até o diretório do projeto

```bash
cd /caminho/para/seu/projeto
```

### 2. Configure o EAS Build

Execute o comando de configuração:

```bash
eas build:configure
```

Este comando irá:
- Criar um arquivo `eas.json` na raiz do projeto
- Configurar perfis de build padrão (development, preview, production)
- Adicionar configurações básicas para Android e iOS

O arquivo `eas.json` terá uma estrutura similar a:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

## 🚀 Criando Builds

### Build para Android

#### APK (Instalação direta em dispositivos)

```bash
eas build --platform android --profile preview
```

Para gerar especificamente um APK, adicione ao `eas.json`:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

#### AAB (Android App Bundle - recomendado para Google Play Store)

```bash
eas build --platform android --profile production
```

O formato AAB é o padrão e é **obrigatório** para novas submissões na Play Store.

### Build para iOS

```bash
eas build --platform ios --profile production
```

**Nota**: Você precisará fornecer credenciais da Apple Developer Account durante o primeiro build.

### Build para Ambas as Plataformas

```bash
eas build --platform all --profile production
```

## 🔑 Gerenciamento de Credenciais

### Android Keystore

Na primeira execução do build Android, você será perguntado:

```
? Would you like to generate a Keystore or provide your own?
```

Opções:
- **Generate new keystore**: Recomendado para novos projetos
- **Upload existing keystore**: Se você já possui um keystore existente

O EAS gerenciará suas credenciais de forma segura.

### iOS Certificados e Provisioning Profiles

Para iOS, o EAS pode gerenciar automaticamente:
- Certificados de distribuição
- Provisioning profiles
- App identifiers

Você será guiado através do processo durante o primeiro build.

## 📊 Perfis de Build

O arquivo `eas.json` suporta diferentes perfis:

### Development
Para desenvolvimento e testes internos:
```bash
eas build --platform android --profile development
```

### Preview
Para testes internos e compartilhamento com equipe:
```bash
eas build --platform android --profile preview
```

### Production
Para publicação nas lojas:
```bash
eas build --platform android --profile production
```

## 📥 Acompanhamento e Download

### Durante o Build

Após iniciar o build, você verá:
- URL para acompanhar o progresso no dashboard
- Status em tempo real no terminal
- Logs detalhados do processo

Exemplo de saída:
```
✔ Build started, it may take a few minutes to complete.
  You can monitor it at https://expo.dev/accounts/[username]/projects/[project]/builds/[build-id]
```

### Após a Conclusão

Quando o build for concluído:
1. Um link de download será exibido no terminal
2. O arquivo estará disponível no dashboard do Expo
3. Você receberá uma notificação por e-mail (se configurado)

### Download do Arquivo

```bash
# Baixar o último build
eas build:download --platform android

# Baixar um build específico
eas build:download --id [build-id]
```

## 📱 Instalação nos Dispositivos

### Android (APK)

1. Transfira o arquivo `.apk` para o dispositivo
2. Habilite "Instalar aplicativos de fontes desconhecidas" nas configurações
3. Abra o arquivo e confirme a instalação

Ou use o Expo Orbit (ferramenta de instalação simplificada):
```bash
npx expo-orbit
```

### iOS (IPA)

Para dispositivos de teste:
1. Use TestFlight (recomendado)
2. Ou instale via Xcode/Apple Configurator

## 🔄 Comandos Úteis

### Verificar status de builds

```bash
eas build:list
```

### Cancelar um build em andamento

```bash
eas build:cancel
```

### Ver logs de um build específico

```bash
eas build:view [build-id]
```

### Limpar cache

```bash
eas build --clear-cache
```

## 📦 Otimização de Tamanho do App

### Tamanhos Esperados por Profile

| Profile | Formato | Tamanho Típico | Uso |
|---------|---------|----------------|-----|
| `preview` | APK | 40-80 MB | Testes internos rápidos |
| `production` | AAB | 15-30 MB | Play Store (recomendado) |
| `production-apk` | APK | 20-40 MB | Distribuição direta |

> **Nota**: Seu primeiro build `preview` pode ter ~83 MB, mas após otimizações ficará entre 40-50 MB.

### Assets Otimizados

Os assets do projeto já foram otimizados automaticamente:
- ✅ Ícones reduzidos de 1.9 MB → 65 KB (97% menor)
- ✅ Splash screens otimizados
- ✅ Backups dos originais em `assets/backup/`

### Otimizar Novos Assets

Se adicionar novas imagens PNG, otimize com:

```bash
pngquant --quality=65-85 --ext .png --force path/to/image.png
```

### Guia Completo

Para estratégias avançadas de otimização, veja:
📄 **[APP_SIZE_OPTIMIZATION.md](./APP_SIZE_OPTIMIZATION.md)**

Inclui:
- ProGuard/R8 configuration
- Code splitting
- Bundle analysis
- Benchmarks do projeto

## ⚠️ Troubleshooting

### Build falha com erro de memória

Adicione ao `eas.json`:
```json
{
  "build": {
    "production": {
      "android": {
        "gradleCommand": ":app:assembleRelease",
        "resourceClass": "large"
      }
    }
  }
}
```

### Erro de credenciais Android

```bash
eas credentials
```

Escolha a opção para resetar ou reconfigurar credenciais.

### Erro de certificado iOS expirado

```bash
eas credentials
```

Navegue até iOS credentials e revogue/gere novos certificados.

### Build local (se necessário)

Para builds locais (requer Xcode/Android Studio):
```bash
eas build --platform android --local
```

## 📚 Recursos Adicionais

- **Documentação oficial**: https://docs.expo.dev/build/introduction/
- **EAS Build Reference**: https://docs.expo.dev/build/eas-json/
- **Submissão para lojas**: https://docs.expo.dev/submit/introduction/
- **Dashboard EAS**: https://expo.dev/accounts/[username]/projects

## 🎯 Checklist Pré-Build

Antes de criar um build de produção:

- [ ] Atualize a versão do app em `app.json` (`version` e `versionCode`/`buildNumber`)
- [ ] Verifique o `package.json` para dependências atualizadas
- [ ] Teste o app no modo desenvolvimento
- [ ] Configure ícones e splash screen corretamente
- [ ] Revise permissões necessárias (camera, microfone, etc.)
- [ ] Configure variáveis de ambiente de produção
- [ ] Verifique configurações de privacidade (iOS)
- [ ] Valide o `app.json` e `eas.json`

## 📈 Versionamento

### Android
No `app.json`:
```json
{
  "expo": {
    "android": {
      "versionCode": 1,
      "package": "com.yourcompany.yourapp"
    },
    "version": "1.0.0"
  }
}
```

Incremente `versionCode` a cada build para a Play Store.

### iOS
No `app.json`:
```json
{
  "expo": {
    "ios": {
      "buildNumber": "1",
      "bundleIdentifier": "com.yourcompany.yourapp"
    },
    "version": "1.0.0"
  }
}
```

Incremente `buildNumber` a cada build para a App Store.

## 💡 Dicas de Otimização

1. **Use builds incrementais**: O EAS reutiliza dependências para builds mais rápidos
2. **Configure cache**: Builds subsequentes serão mais rápidos
3. **Builds paralelos**: Planos pagos permitem builds simultâneos
4. **Monitore o uso**: Verifique os limites do seu plano no dashboard

## 🔐 Segurança

- **Nunca comite** arquivos de credenciais no Git
- Use variáveis de ambiente para secrets
- Mantenha keystores e certificados em local seguro
- O EAS armazena credenciais de forma criptografada

## 💰 Planos EAS

- **Free**: 30 builds/mês
- **Production**: Builds ilimitados
- Mais informações: https://expo.dev/pricing

---

**Última atualização**: Novembro 2025  
**Baseado em**: Expo SDK 51+ e EAS CLI 5+

