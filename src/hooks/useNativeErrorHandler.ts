// Hook to capture native errors and bridge errors
import { useEffect } from 'react';
import { Platform, NativeModules, NativeEventEmitter } from 'react-native';
import { logger } from '../utils/logger';

export function useNativeErrorHandler() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      // Try to set up native error listener
      try {
        // This would require a custom native module
        // For now, we'll set up what we can from JS side
        
        // Listen for any native crashes that bubble up
        const originalConsoleError = console.error;
        console.error = (...args: any[]) => {
          // Check if it's a native error
          const message = args.join(' ');
          if (
            message.includes('Native') ||
            message.includes('java.') ||
            message.includes('android.') ||
            message.includes('ClassCastException') ||
            message.includes('NullPointerException')
          ) {
            logger.logNativeError('NativeModule', 'unknown', new Error(message), {
              originalArgs: args,
            });
          }
          
          originalConsoleError(...args);
        };
        
        return () => {
          console.error = originalConsoleError;
        };
      } catch (error) {
        logger.warn('Failed to setup native error handler', error);
      }
    } else if (Platform.OS === 'ios') {
      // iOS native error handling
      try {
        const originalConsoleError = console.error;
        console.error = (...args: any[]) => {
          const message = args.join(' ');
          if (
            message.includes('Native') ||
            message.includes('NSException') ||
            message.includes('Objective-C')
          ) {
            logger.logNativeError('NativeModule', 'unknown', new Error(message), {
              originalArgs: args,
            });
          }
          
          originalConsoleError(...args);
        };
        
        return () => {
          console.error = originalConsoleError;
        };
      } catch (error) {
        logger.warn('Failed to setup iOS native error handler', error);
      }
    }
  }, []);
}

