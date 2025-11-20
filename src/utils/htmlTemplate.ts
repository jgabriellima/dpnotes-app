/**
 * HTML Template for WebView Reader
 * 
 * Injeta script de seleção de texto que comunica com React Native
 */

export const buildHtmlFromMarkdown = (
  markdownHtml: string,
  fontSize: number = 17,
  scrollPosition: 'left' | 'right' = 'left',
  theme: 'light' | 'dark' = 'light',
  highContrast: boolean = false
) => `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <meta charset="UTF-8">
    <style>
      * {
        box-sizing: border-box;
        /* BLOQUEIA context menu nativo completamente */
        -webkit-touch-callout: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-tap-highlight-color: transparent;
      }
      
      body {
        padding: ${scrollPosition === 'left' ? '16px 16px 16px 48px' : '16px 48px 16px 16px'}; /* Extra padding for safe scroll area */
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        line-height: 1.6;
        color: ${theme === 'dark' ? '#e5e7eb' : '#1f2937'};
        background-color: ${theme === 'dark' ? '#1f2937' : '#ffffff'};
        font-size: ${fontSize}px;
      }
      
      /* Permitir seleção APENAS programaticamente */
      #content * {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
      
      /* Selection styling customizado */
      ::selection {
        background: #3b82f6;
        color: #ffffff;
      }
      
      /* Markdown styling */
      h1, h2, h3, h4, h5, h6 {
        font-weight: ${highContrast ? '700' : '600'};
        margin-top: 24px;
        margin-bottom: 12px;
        line-height: 1.3;
        color: ${theme === 'dark' ? '#ffffff' : (highContrast ? '#000000' : '#111827')};
      }
      
      h1 { font-size: 32px; }
      h2 { font-size: 24px; }
      h3 { font-size: 20px; }
      
      p {
        margin-top: 0;
        margin-bottom: 16px;
        ${highContrast ? 'font-weight: 500;' : ''}
      }
      
      strong { font-weight: 700; }
      em { font-style: italic; }
      
      code {
        background: #f3f4f6;
        color: #dc2626;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Monaco', 'Courier New', monospace;
        font-size: 15px;
      }
      
      pre {
        background: #1e1e1e;
        color: #d4d4d4;
        padding: 16px;
        border-radius: 6px;
        overflow-x: auto;
        margin: 16px 0;
      }
      
      pre code {
        background: transparent;
        color: inherit;
        padding: 0;
      }
      
      ul, ol {
        padding-left: 24px;
        margin: 12px 0;
      }
      
      li {
        margin: 4px 0;
      }
      
      blockquote {
        border-left: 4px solid #3b82f6;
        padding-left: 16px;
        margin: 16px 0;
        color: #1e40af;
        font-style: italic;
        background: #eff6ff;
        padding-top: 4px;
        padding-bottom: 4px;
      }
      
      hr {
        border: none;
        border-top: 1px solid #e5e7eb;
        margin: 24px 0;
      }
      
      a {
        color: #3b82f6;
        text-decoration: underline;
      }
      
      /* ============================================ */
      /* ANNOTATION STYLES */
      /* ============================================ */
      .annotation {
        position: relative;
        display: inline;
        border-radius: 3px;
        transition: opacity 0.15s ease;
        -webkit-tap-highlight-color: transparent;
        cursor: pointer;
      }
      
      .annotation:active {
        opacity: 0.7;
      }
      
      .annotation-icon {
        display: inline;
        pointer-events: none;
        -webkit-user-select: none !important;
        user-select: none !important;
      }
      
      /* Prevent text selection on annotation icons */
      .annotation-icon::selection {
        background: transparent !important;
      }
    </style>
  </head>
  <body>
    <div id="content">
      ${markdownHtml}
    </div>
    
    <script>
      // =========================================
      // ANNOTATION CLICK HANDLER
      // =========================================
      
      // Detectar cliques em anotações
      document.addEventListener('click', function(e) {
        const annotationEl = e.target.closest('.annotation');
        if (annotationEl) {
          e.preventDefault();
          e.stopPropagation();
          
          const annotationId = annotationEl.getAttribute('data-annotation-id');
          const rect = annotationEl.getBoundingClientRect();
          
          if (annotationId) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'ANNOTATION_CLICKED',
              annotationId: annotationId,
              rect: {
                x: rect.left,
                y: rect.top, // Já é relativo ao viewport
                width: rect.width,
                height: rect.height
              }
            }));
          }
          
          return false;
        }
      }, true);
      
      // =========================================
      // SELEÇÃO CUSTOMIZADA COM TOQUE SIMPLES
      // =========================================
      
      let isSelecting = false;
      let startNode = null;
      let startOffset = 0;
      let lastSelectionHash = '';
      
      function getSelectionHash(text, rect) {
        return text + rect.x + rect.y + rect.width + rect.height;
      }
      
      // PREVENIR context menu nativo completamente
      document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }, true);
      
      // PREVENIR long press nativo
      let longPressTimer = null;
      document.addEventListener('touchstart', function(e) {
        clearTimeout(longPressTimer);
        longPressTimer = setTimeout(function() {
          // Não fazer nada no long press - só prevenir
        }, 500);
      }, true);
      
      document.addEventListener('touchend', function() {
        clearTimeout(longPressTimer);
      }, true);
      
      function sendSelection() {
        const selection = window.getSelection();
        
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
          if (lastSelectionHash !== '') {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'SELECTION_CLEARED'
            }));
            lastSelectionHash = '';
          }
          return;
        }
        
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const text = selection.toString().trim();
        
        if (!text) {
          if (lastSelectionHash !== '') {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'SELECTION_CLEARED'
            }));
            lastSelectionHash = '';
          }
          return;
        }
        
        // Evita enviar duplicados
        const currentHash = getSelectionHash(text, rect);
        if (currentHash === lastSelectionHash) {
          return;
        }
        lastSelectionHash = currentHash;
        
        const payload = {
          type: 'SELECTION_CHANGED',
          text: text,
          rect: {
            x: rect.left,
            y: rect.top, // Já é relativo ao viewport, não adicionar pageYOffset
            width: rect.width,
            height: rect.height
          }
        };
        
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      }
      
      // =========================================
      // SELEÇÃO POR TOQUE SIMPLES + ARRASTE
      // =========================================
      
      let touchStartX = 0;
      let touchStartY = 0;
      let hasMovedEnough = false;
      const MOVE_THRESHOLD = 10; // pixels
      
      document.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        hasMovedEnough = false;
        
        // Limpar seleção anterior E notificar
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
          // Tinha seleção, limpar e notificar
          selection.removeAllRanges();
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'SELECTION_CLEARED'
          }));
          lastSelectionHash = '';
        }
        
        // Guardar ponto inicial
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (element && element.textContent) {
          const range = document.caretRangeFromPoint(touch.clientX, touch.clientY);
          if (range) {
            startNode = range.startContainer;
            startOffset = range.startOffset;
            isSelecting = true;
          }
        }
      });
      
      document.addEventListener('touchmove', function(e) {
        if (!isSelecting) return;
        
        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - touchStartX);
        const deltaY = Math.abs(touch.clientY - touchStartY);
        
        // Verificar se moveu o suficiente para ser considerado arraste
        if (deltaX > MOVE_THRESHOLD || deltaY > MOVE_THRESHOLD) {
          hasMovedEnough = true;
        }
        
        if (!hasMovedEnough) return;
        
        // Criar seleção enquanto arrasta
        const endRange = document.caretRangeFromPoint(touch.clientX, touch.clientY);
        
        if (endRange && startNode) {
          try {
            const selection = window.getSelection();
            const range = document.createRange();
            
            // Determinar ordem correta (pode arrastar para trás)
            const comparison = startNode.compareDocumentPosition(endRange.startContainer);
            
            if (comparison & Node.DOCUMENT_POSITION_FOLLOWING) {
              // Arrastar para frente
              range.setStart(startNode, startOffset);
              range.setEnd(endRange.startContainer, endRange.startOffset);
            } else if (comparison & Node.DOCUMENT_POSITION_PRECEDING) {
              // Arrastar para trás
              range.setStart(endRange.startContainer, endRange.startOffset);
              range.setEnd(startNode, startOffset);
            } else {
              // Mesmo nó
              const start = Math.min(startOffset, endRange.startOffset);
              const end = Math.max(startOffset, endRange.startOffset);
              range.setStart(startNode, start);
              range.setEnd(startNode, end);
            }
            
            selection.removeAllRanges();
            selection.addRange(range);
            
            // NÃO enviar seleção durante o arraste - apenas atualizar visualmente
            // A seleção será enviada apenas no touchend para melhor UX
          } catch (err) {
            console.error('Selection error:', err);
          }
        }
      });
      
      document.addEventListener('touchend', function(e) {
        if (isSelecting && hasMovedEnough) {
          // Enviar seleção APENAS quando usuário soltar o dedo
          setTimeout(sendSelection, 50);
        }
        
        isSelecting = false;
        startNode = null;
        hasMovedEnough = false;
      });
      
      console.log('✅ Custom selection script loaded');
    </script>
  </body>
</html>
`;

