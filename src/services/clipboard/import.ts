/**
 * Clipboard Import Service
 * 
 * Importa conteúdo da área de transferência para criar novos documentos.
 * Toggle entre mock e produção: use EXPO_PUBLIC_USE_MOCKS no .env
 */

import * as Clipboard from 'expo-clipboard';

// ============================================================
// ENV VAR: Controle global de mocks via .env
// EXPO_PUBLIC_USE_MOCKS=true (desenvolvimento)
// EXPO_PUBLIC_USE_MOCKS=false (produção)
// ============================================================
const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS === 'true';

/**
 * Gera conteúdo Lorem Ipsum com títulos e parágrafos
 * ~1000 caracteres para testes
 */
function generateLoremIpsum(): string {
  const titles = [
    'Introduction to Research',
    'Methodology and Approach',
    'Key Findings',
    'Discussion and Analysis',
  ];

  const paragraphs = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
    'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim.',
    'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae.',
    'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.',
    'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus.',
    'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.',
  ];

  let content = '';
  
  // Gera conteúdo com títulos e parágrafos intercalados
  for (let i = 0; i < titles.length; i++) {
    content += `# ${titles[i]}\n\n`;
    content += `${paragraphs[i]}\n\n`;
    if (i < paragraphs.length - 1) {
      content += `${paragraphs[i + 1]}\n\n`;
    }
  }

  return content.trim();
}

// Mock: Research paper sobre Deep Learning
const MOCK_RESEARCH_PAPER = `Deep Learning in Natural Language Processing: A Comprehensive Survey

Abstract

Natural Language Processing (NLP) has experienced remarkable advances in recent years, largely driven by the emergence of deep learning techniques. This survey provides a comprehensive overview of deep learning architectures and their applications in NLP, examining the evolution from traditional rule-based systems to modern neural approaches.

1. Introduction

The field of Natural Language Processing has undergone a paradigm shift with the introduction of deep learning methodologies. Unlike traditional approaches that relied heavily on hand-crafted features and linguistic rules, deep learning models can automatically learn hierarchical representations from raw text data. This capability has led to breakthrough performances across various NLP tasks, including machine translation, sentiment analysis, question answering, and text generation.

The success of deep learning in NLP can be attributed to several key factors. First, the availability of large-scale datasets has provided sufficient training data for complex neural models. Second, advances in computational power, particularly the widespread adoption of GPUs, have made it feasible to train increasingly sophisticated architectures. Third, innovative model designs such as attention mechanisms and transformer architectures have addressed fundamental limitations of earlier approaches.

2. Foundational Architectures

2.1 Word Embeddings

Word embeddings represent one of the earliest successful applications of neural networks in NLP. These dense vector representations capture semantic relationships between words in a continuous vector space. The Word2Vec model, introduced by Mikolov et al., demonstrated that simple neural architectures could learn meaningful word representations from large text corpora. The skip-gram and continuous bag-of-words (CBOW) variants provided efficient methods for training word embeddings at scale.

Building on this foundation, GloVe (Global Vectors for Word Representation) combined the advantages of matrix factorization techniques with local context window methods. By leveraging global corpus statistics, GloVe produced embeddings that better captured the overall semantic structure of language. More recently, contextualized embeddings such as ELMo have addressed the limitation of static word embeddings by generating different representations for the same word based on its context.

2.2 Recurrent Neural Networks

Recurrent Neural Networks (RNNs) introduced the concept of sequential processing in neural architectures. By maintaining a hidden state that evolves over time, RNNs can theoretically capture long-range dependencies in text. However, vanilla RNNs suffer from the vanishing gradient problem, which limits their ability to learn from distant context.

Long Short-Term Memory (LSTM) networks addressed this limitation through the introduction of gating mechanisms. The forget gate, input gate, and output gate allow LSTMs to selectively retain or discard information over long sequences. Gated Recurrent Units (GRUs) provided a simpler alternative with comparable performance, using fewer parameters through a streamlined gating structure.

3. The Transformer Revolution

3.1 Attention Mechanisms

The attention mechanism represented a fundamental breakthrough in sequence modeling. Rather than compressing all information into a fixed-size context vector, attention allows models to focus on relevant parts of the input dynamically. The self-attention mechanism, in particular, enables each position in a sequence to attend to all other positions, capturing complex dependencies regardless of distance.

The scaled dot-product attention, as formulated in the original Transformer paper, computes attention weights based on the similarity between query and key vectors. This formulation is computationally efficient and can be easily parallelized, unlike the sequential processing required by RNNs.

3.2 Transformer Architecture

The Transformer architecture revolutionized NLP by demonstrating that attention mechanisms alone, without recurrence or convolution, could achieve state-of-the-art results. The encoder-decoder structure with multi-head attention allows the model to capture different types of relationships simultaneously. Position encodings provide the model with information about token order, compensating for the loss of sequential inductive bias.

4. Pre-training and Transfer Learning

4.1 Language Model Pre-training

The paradigm of pre-training on large corpora followed by fine-tuning on specific tasks has become dominant in modern NLP. BERT (Bidirectional Encoder Representations from Transformers) demonstrated the power of masked language modeling for learning bidirectional representations. By predicting randomly masked tokens, BERT learns rich contextual representations that transfer well to downstream tasks.

GPT (Generative Pre-trained Transformer) took an alternative approach, using unidirectional language modeling to generate coherent text. The successive iterations of GPT demonstrated that scaling model size and training data consistently improves performance across diverse tasks.

4.2 Domain Adaptation

Transfer learning has proven particularly valuable for domains with limited labeled data. By leveraging knowledge learned from general-purpose corpora, pre-trained models can be adapted to specialized domains through continued pre-training or fine-tuning. This approach has democratized access to high-performance NLP, enabling applications in scientific literature, legal documents, medical records, and other specialized domains.

5. Challenges and Future Directions

Despite remarkable progress, several challenges remain. Model interpretability continues to be a concern, as the decision-making process of deep neural networks often lacks transparency. Computational efficiency is another critical issue, with state-of-the-art models requiring substantial resources for both training and inference.

Multilingual and cross-lingual capabilities present ongoing research opportunities. While recent models have shown impressive results across multiple languages, performance disparities between high-resource and low-resource languages persist. Developing truly universal language models that work equally well across all languages remains an important goal.

6. Conclusion

Deep learning has fundamentally transformed Natural Language Processing, enabling capabilities that were previously unattainable. The progression from simple word embeddings to sophisticated transformer-based models illustrates the rapid pace of innovation in the field. As research continues, we can expect further advances in model efficiency, interpretability, and multilingual capabilities, bringing us closer to truly general-purpose language understanding systems.

The integration of multimodal information, combining text with images, audio, and other data types, represents another promising direction. Similarly, efforts to improve few-shot and zero-shot learning capabilities could reduce the reliance on large labeled datasets. The future of NLP lies in developing models that are not only powerful but also efficient, interpretable, and accessible to researchers and practitioners worldwide.`;

export interface ClipboardImportResult {
  content: string;
  wordCount: number;
  source: 'mock' | 'clipboard';
}

/**
 * Importa conteúdo da área de transferência
 * 
 * @returns Conteúdo importado com metadados
 */
export async function importFromClipboard(): Promise<ClipboardImportResult> {
  let content: string;
  let source: 'mock' | 'clipboard';

  if (USE_MOCKS) {
    // Modo Mock: retorna research paper
    content = MOCK_RESEARCH_PAPER;
    source = 'mock';
    console.log('📋 [Clipboard] Using MOCK research paper');
  } else {
    // Modo Produção: lê da área de transferência real
    try {
      content = await Clipboard.getStringAsync();
      
      // Valida se o conteúdo não está vazio ou só com whitespace
      if (!content || content.trim().length === 0) {
        // Fallback: gera Lorem Ipsum se clipboard estiver vazio
        console.log('📋 [Clipboard] Empty or whitespace clipboard, generating Lorem Ipsum fallback');
        content = generateLoremIpsum();
        source = 'mock';
      } else {
        source = 'clipboard';
        console.log('📋 [Clipboard] Imported from system clipboard');
      }
    } catch (error) {
      // Se der erro ao acessar clipboard, usa fallback
      console.log('📋 [Clipboard] Error accessing clipboard, using Lorem Ipsum fallback');
      content = generateLoremIpsum();
      source = 'mock';
    }
  }

  // Calcula estatísticas
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;

  return {
    content,
    wordCount,
    source,
  };
}

/**
 * Valida se há conteúdo disponível para importação
 */
export async function canImportFromClipboard(): Promise<boolean> {
  if (USE_MOCKS) {
    return true;
  }
  
  // Sempre retorna true pois temos fallback de Lorem Ipsum
  return true;
}

