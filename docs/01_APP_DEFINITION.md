Aqui está o **Canvas Consolidado Completo**, sem cortes, sem resumir, totalmente contínuo, pronto para virar **documentação oficial do projeto**, enviar para o time, colocar no Notion, Figma ou Confluence, ou entregar ao Cursor para iniciar a implementação.
Use como **MVP Blueprint + PRD + UX Spec + Arquitetura Técnica**.

---

# ✅ **DEEP RESEARCH NOTES – CANVAS COMPLETO**

*(Nome provisório: "Deep Research Notes" / "Research Notator" / "Resource Notator" — análise posterior de naming)*

---

# 1. **Contexto**

Usuários frequentemente recebem respostas **densas, longas e complexas** do ChatGPT, especialmente quando acionam o modo **Deep Research**. Essas respostas são ricas, mas difíceis de trabalharem de forma iterativa:

* Precisa copiar trechos, colar em prompts separados, explicar manualmente o que quer expandir, cortar ou reescrever.
* As ferramentas nativas do ChatGPT ("Ask ChatGPT about this section") só permitem **uma pergunta por vez**, não escala para múltiplas anotações.
* A ferramenta atual não permite **trabalhar sobre o próprio texto com granularidade**, nem indexar ou manter anotações inteligentes.

O resultado é:
❌ Processo manual, lento e fragmentado
❌ Dificuldade para rastrear alterações
❌ Zero memória sobre as intenções do usuário
❌ Perda de contexto ao tentar refinar múltiplos trechos

---

# 2. **Objetivo do Produto**

Criar o **Deep Research Notes**, um aplicativo mobile minimalista, elegante e extremamente eficiente para:

* Receber textos longos (Deep Research, artigos, relatórios, etc.)
* **Quebrar automaticamente em sentenças e parágrafos**, apresentando visualização limpa
* Permitir que o usuário:
  ✅ Clique numa sentença / parágrafo
  ✅ Aplique **labels/tags** pré-definidas ou customizadas
  ✅ Grave **áudio** dizendo o que quer daquele trecho
  ✅ Tenha transcrição automática via **Grok Whisper** ou **Whisper local (on device)**
  ✅ Edite suas anotações em texto ou áudio
  ✅ Tenha histórico de labels, sugestões de labels novas e uso por projeto
  ✅ E finalmente **exporte tudo em uma única composição perfeita para o ChatGPT**, com:

  * Estrutura
  * Tags
  * Intenções
  * Anotações de voz
  * Comandos específicos por trecho

O foco:
👉 **Criar o melhor app do mundo para "trabalhar em cima de um texto gerado por IA".**
Zero distração, máximo foco, elegante, rápido e robusto.

---

# 3. **Princípios de Design (EXY – Experiência e Estética)**

O app seguirá um design minimalista estilo apps premium de estudo (Readwise, Craft, Notion AI mobile):

### Visual:

* Fundo limpo, sem ruídos
* Tipografia premium customizada (Inter / IBM Plex / SF Pro)
* Espaçamento respirável
* Alto contraste
* Multi-idioma: **EN, PT-BR, ES**
* Tema claro/escuro automático

### Interação:

* Texto quebrado em unidades selecionáveis (frases e parágrafos)
* Auto-scroll suave
* Gestos naturais
* Barra de ação discreta e contextual
* Ícones minimalistas e microanimações elegantes
* Sem botões de login enormes (sociais em linha, pequenos e discretos)

### Prioridade:

* O texto é a experiência central
* As tags são "bolhas" laterais
* O botão de **Exportar** é o CTA principal do app inteiro, sempre acessível visualmente

---

# 4. **Personas**

### ✅ Criadores de Conteúdo

Refinam textos, produzem aulas, blogs, e-books, artigos.

### ✅ Engenheiros / Técnicos

Trabalham com explicações profundas e precisam estruturar feedback.

### ✅ Estudantes e Pesquisadores

Anotam PDFs, papers, resumos, artigos acadêmicos.

### ✅ Consultores e Profissionais de Negócio

Recebem análises profundas e querem revisá-las eficientemente.

---

# 5. **Jornadas do Usuário (End to End)**

---

## **Jornada 1 — Importar Conteúdo (Clipboard → App)**

1. Usuário está no ChatGPT ou recebe Deep Research.
2. Copia o conteúdo.
3. Abre o **Deep Research Notes**.
4. App detecta automaticamente o clipboard (permissão concedida).
5. Mostra "Deseja importar este texto?".
6. Ao confirmar:

   * Texto é **normalizado**
   * **Segmentado em parágrafos**
   * **Segmentado em sentenças**
   * Renderizado com tipografia elegante
7. Usuário vê imediatamente o texto dividido com perfeição.

---

## **Jornada 2 — Seleção e Anotação (Tags + Voz + Texto)**

1. Usuário toca em uma sentença/parágrafo.
2. Surge um pequeno painel contextual:

✅ **Aplicar Label**
✅ **Gravar Áudio**
✅ **Escrever Anotação**
✅ **Editar Tags**

---

## Labels / Tags

Podem ser:

* Labels pré-definidas (ex.: Expandir, Simplificar, Remover, Esclarecer, Contrapor)
* Labels customizadas
* Labels por projeto
* Labels sugeridas automaticamente quando o usuário usa repetidamente um tipo de anotação
  → O app pergunta:
  "Quer transformar isso em uma label reutilizável?"

---

## Anotação por Voz

Usuário pressiona o botão de **mic**:

* Grava um comando natural:
  "Aqui eu quero que o ChatGPT gere mais exemplos práticos focados em economia circular."
* O áudio é enviado para:
  ✅ **Grok Whisper** (rápido, barato, de alta performance)
  ✅ **OU Whisper local** (on-device) quando offline
* A transcrição aparece em forma de tag discreta no lado do texto
* Usuário pode ouvir o áudio, editar a transcrição, excluir, renomear

---

## **Visualização "Friendly"**

Por padrão, o usuário **não vê** a transcrição enorme grudada no texto.
Vê apenas:

* A marcação do texto
* A label/tags
* E um pequeno símbolo indicando nota de voz

Ao clicar, expande com elegância.

---

# 6. **Jornada 3 — Compor o Prompt Final**

Quando o usuário termina:

* Ele clica no botão central **Exportar**
  (pode ser floating button ou tab central)

O app gera automaticamente:

### ✅ **SUMÁRIO DE TAGS**

```
T1 (Expandir): Expandir esta seção com exemplos de empresas reais.
T2 (Cortar): Remover repetições e redundâncias.
T3 (Contrapor): Criar uma crítica com base em evidências científicas.
T4 (Voz): "Aqui eu quero que você detalhe o impacto econômico de X."
```

### ✅ **TEXTO com as ANOTAÇÕES injetadas**

Formato tipo:

```
Parágrafo 1:
[Sentença original] [T1]

Parágrafo 2:
[Sentença original] [T3][T4]
```

### ✅ **VERSÃO COMPLETA PRONTA PARA COLAR NO CHATGPT**

Vira um prompt limpo, estruturado, e extraordinariamente poderoso.

Usuário copia com um clique e cola direto no ChatGPT.

---

# 7. **Jornada 4 — Projetos, Labels Evolutivas e Reutilização**

Usuário pode ter:

* Projetos (ex.: Tese, Artigo, Relatório do Trabalho, Pesquisa X)
* Cada projeto tem suas labels
* Labels evoluem conforme o usuário usa
* O app sugere transformações (via LLM) para generalizar rótulos
  Ex.:
  Usuário grava:
  "Aqui quero uma comparação entre modelos econômicos…"
  O app sugere:
  "Quer criar a label 'Comparar Modelos'?".

Labels ficam visuais, organizadas e rápidas de aplicar.

---

# 8. **Arquitetura Técnica do MVP**

---

## **Frontend Mobile (Expo + React Native)**

* Expo Managed Workflow
* TypeScript
* Zustand (estado leve)
* Tailwind RN (nativewind) — minimalista, rápido
* expo-router
* expo-av (gravação/playback)
* expo-clipboard (detecção de colagem)
* expo-sqlite (persistência local – free users)
* expo-ads-admob (free version)
* Linguagens: PT, EN, ES

---

## **STT (Transcrição)**

### 1. **Primário: Groq Whisper**

Motivo:

* Ultra rápido
* Custo excelente
* Latência baixa
* API simples

### 2. **Alternativo: Whisper local (on-device)**

* Só carregado se usuário optar
* Usa módulos nativos (fast-whisper mobile)
* Ideal para privacidade total ou modo offline
* Fornecer fallback automático

### Strategy pattern:

```ts
interface Transcriber {
  transcribe(fileUri: string): Promise<{ text, language, confidence }>;
}
```

---

## **Base de Dados**

### Free

* Tudo local, apenas metadados
* Banco SQLite minimalista
* Estrutura:

  * documents
  * sentences
  * annotations
  * labels
  * audio_blobs

### Enterprise

* Sync E2EE via **Supabase + RLS**
* Apenas **ciphertext** trafega, nunca plaintext
* Chaves derivadas localmente via WebCrypto

---

## **Infra E2E (Enterprise)**

* Supabase Auth: Google, Apple, Twitter, Facebook
* Encryption: AES-GCM
* Row Level Security por user_id
* Retention de inadimplência: purge após 90 dias

---

# 9. **Design de Páginas**

### ✅ **Home**

* Botão "Importar do Clipboard"
* Lista de projetos
* Botão "Criar Projeto"
* Banner discreto de Ads (free version)

### ✅ **Editor de Texto (tela mais importante)**

* Visualização focada
* Texto dividido em frases
* Seleção com highlight
* Barra lateral/flutuante:

  * Label
  * Voz
  * Texto
* Gutter com bolhas coloridas
* Auto-scroll opcional
* Botão **Exportar** sempre visível

### ✅ **Tela de Labels**

* Labels pré-criadas
* Labels sugeridas
* Labels do projeto
* Criar nova label

### ✅ **Projeto**

* Documentos
* Labels relacionadas
* Edições recentes

---

# 10. **Estrutura do Prompt Exportado**

Formato final:

```
## Sumário das Anotações

[T1] Expandir → Expandir esta seção adicionando X, Y, Z  
[T2] Simplificar → Simplificar sem perder rigor técnico  
[T3] Contrapor → Gerar contraponto científico  
[T4] Audio Note → "Transcrição da nota"

---

## Texto Anotado

Parágrafo 1:
Sentença A. [T1]
Sentença B. [T2]

Parágrafo 2:
Sentença C. [T3][T4]
```

---

# 11. **Arquitetura de Composição do Prompt**

Pipeline:

1. Texto original
2. Tokens das sentenças
3. Anotações aplicadas
4. Labels contextualizadas
5. Tag Map
6. Template final (multi-idioma)

---

# 12. **Nome da Aplicação (Naming Draft)**

Sugestões:

* **Deep Research Notes**
* **Research Notator**
* **Insight Annotator**
* **Context Marker**
* **Smart Notable**
* **Lens Notes**

Critérios:

* Domínio disponível
* Fácil pronúncia
* Evitar nomes literais demais

---

# 13. **Makefile-Driven Development (Padrão Hard Requirement)**

O Makefile controla tudo:

* Ambiente
* Checagem de dependências
* Local vs Cloud (EAS)
* Build Android/iOS
* Submit automático
* Setup Supabase
* Lint, Test, CI
* STT provider switching

*(Makefile já entregue anteriormente)*

---

# 14. **MVP – Entrega Final**

O MVP entregará:

✅ Importar texto
✅ Segmentação inteligente
✅ Seleção natural
✅ Aplicação de labels
✅ Anotações por voz + transcrição
✅ Edição de anotações
✅ Visualização elegante
✅ Exportar prompt completo
✅ Free + ads
✅ Enterprise (E2EE + sync + social login)
✅ Multi-idioma
✅ Minimalismo total

---

# 15. **Visão Futuro**

* Versão Web
* Plugin Chrome
* Mode de leitura avançado
* Colaboração real-time
* Organização por pastas inteligentes
* Assistente interno que aprende suas labels e estilo

---

# ✅ **Este é o Documento Consolidado completo.**

Sem resumo, sem cortes, pronto para se transformar na versão 1.0 do **Deep Research Notes**.

Se quiser, posso agora gerar:
✅ Esqueleto completo do projeto (Expo + TS + Router + Zustand + SQLite)
✅ Arquitetura das screens
✅ Estrutura de dados tipada
✅ Todos os componentes base
✅ Arquivo de tradução multi-idioma
✅ Estrutura de projeto para Cursor AI montar tudo.