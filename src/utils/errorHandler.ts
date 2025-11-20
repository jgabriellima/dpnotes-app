/**
 * Global Error Handler
 * 
 * Captura todos os erros da aplicação (JS, React, Native)
 * e garante visibilidade total no terminal local
 */

import { ErrorUtils } from 'react-native';

// Store originals
const originalError = console.error.bind(console);
const originalWarn = console.warn.bind(console);
const originalLog = console.log.bind(console);

let isInitialized = false;

/**
 * Formata erro para exibição consistente
 */
function formatError(error: any): string {
  if (error instanceof Error) {
    return `${error.message}\n${error.stack || ''}`;
  }
  return String(error);
}

/**
 * Inicializa handlers globais de erro
 */
export function initErrorHandler() {
  if (isInitialized) {
    return;
  }

  // Override console.error para garantir visibilidade
  console.error = (...args: any[]) => {
    const timestamp = new Date().toISOString();
    
    // Filtra args para evitar duplicação
    const errorArgs = args.filter(arg => !(arg instanceof Error) || !arg.stack);
    const errors = args.filter(arg => arg instanceof Error && arg.stack);
    
    // Log principal
    originalError('🔴 [ERROR]', timestamp, ...errorArgs);
    
    // Stack traces separados (se houver)
    errors.forEach(error => {
      originalError('   └─ Stack:', error.stack);
    });
  };

  // Override console.warn
  console.warn = (...args: any[]) => {
    const timestamp = new Date().toISOString();
    originalWarn('⚠️  [WARN]', timestamp, ...args);
  };

  // Captura erros não tratados do React Native
  if (ErrorUtils) {
    const defaultHandler = ErrorUtils.getGlobalHandler();
    
    ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
      const timestamp = new Date().toISOString();
      
      originalError('💥 [FATAL ERROR]', timestamp, {
        isFatal,
        message: error.message,
        name: error.name,
      });
      
      if (error.stack) {
        originalError('Stack trace:', error.stack);
      }
      
      // Chama handler original para não quebrar comportamento default
      if (defaultHandler) {
        defaultHandler(error, isFatal);
      }
    });
  }

  // Captura Promise rejections não tratadas
  const originalRejectionHandler = global.onunhandledrejection;
  global.onunhandledrejection = (event: any) => {
    const timestamp = new Date().toISOString();
    originalError('❌ [UNHANDLED PROMISE REJECTION]', timestamp, {
      reason: event?.reason,
      promise: event?.promise,
    });
    
    if (event?.reason instanceof Error && event.reason.stack) {
      originalError('Stack:', event.reason.stack);
    }
    
    if (originalRejectionHandler) {
      originalRejectionHandler.call(window, event);
    }
  };

  isInitialized = true;
  originalLog('✅ Global error handler initialized');
  originalLog('📊 All errors will now be visible in terminal');
}

/**
 * Log customizado para erros de componentes
 */
export function logComponentError(
  componentName: string,
  error: Error,
  errorInfo?: any
) {
  const timestamp = new Date().toISOString();
  
  originalError('🔴 [COMPONENT ERROR]', timestamp, {
    component: componentName,
    error: error.message,
  });
  
  if (error.stack) {
    originalError('Error stack:', error.stack);
  }
  
  if (errorInfo?.componentStack) {
    originalError('Component stack:', errorInfo.componentStack);
  }
}

/**
 * Log para erros de rede
 */
export function logNetworkError(
  url: string,
  method: string,
  error: any
) {
  const timestamp = new Date().toISOString();
  
  originalError('🌐 [NETWORK ERROR]', timestamp, {
    url,
    method,
    error: formatError(error),
  });
}

/**
 * Log para erros de banco de dados
 */
export function logDatabaseError(
  operation: string,
  error: any
) {
  const timestamp = new Date().toISOString();
  
  originalError('💾 [DATABASE ERROR]', timestamp, {
    operation,
    error: formatError(error),
  });
}

