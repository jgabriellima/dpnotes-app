// Advanced logging system with full observability
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  platform: 'android' | 'ios' | 'web';
  data?: any;
  stack?: string;
  errorType?: string;
  errorString?: string;
  module?: string;
  method?: string;
  userId?: string;
  sessionId?: string;
  deviceInfo?: {
    model?: string;
    osVersion?: string;
    appVersion?: string;
  };
}

interface LoggerConfig {
  maxHistorySize: number;
  enablePersistentStorage: boolean;
  enableRemoteLogging: boolean;
  logLevel: LogLevel;
  enableNativeLogging: boolean;
}

class Logger {
  private history: LogEntry[] = [];
  private config: LoggerConfig = {
    maxHistorySize: 1000,
    enablePersistentStorage: true,
    enableRemoteLogging: false,
    logLevel: __DEV__ ? 'debug' : 'info',
    enableNativeLogging: true,
  };
  private sessionId: string;
  private deviceInfo: LogEntry['deviceInfo'] = {};

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeDeviceInfo();
    this.loadHistory();
    this.setupGlobalErrorHandlers();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async initializeDeviceInfo() {
    try {
      const { Platform: RNPlatform } = require('react-native');
      const Constants = require('expo-constants');
      
      this.deviceInfo = {
        model: Constants.deviceName || 'Unknown',
        osVersion: RNPlatform.Version?.toString() || 'Unknown',
        appVersion: Constants.expoConfig?.version || '1.0.0',
      };
    } catch (error) {
      // Silent fail - device info is optional
    }
  }

  private setupGlobalErrorHandlers() {
    // Handle unhandled errors (React Native)
    if (typeof global !== 'undefined') {
      const ErrorUtils = (global as any).ErrorUtils;
      if (ErrorUtils) {
        const originalHandler = ErrorUtils.getGlobalHandler?.();
        
        ErrorUtils.setGlobalHandler?.((error: Error, isFatal?: boolean) => {
          this.fatal('Unhandled error', error, {
            isFatal: isFatal ?? false,
            handler: 'global',
          });
          
          if (originalHandler) {
            originalHandler(error, isFatal);
          }
        });
      }
    }

    // Handle unhandled promise rejections (web only)
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('unhandledrejection', (event) => {
        this.error('Unhandled promise rejection', event.reason, {
          promise: event.promise?.toString(),
        });
      });
    }
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    error?: Error | any,
    data?: any
  ): LogEntry {
    const entry: LogEntry = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level,
      message,
      platform: Platform.OS as 'android' | 'ios' | 'web',
      data,
      deviceInfo: this.deviceInfo,
      sessionId: this.sessionId,
    };

    if (error) {
      if (error instanceof Error) {
        entry.stack = error.stack;
        entry.errorType = error.name;
        entry.errorString = error.message;
      } else if (typeof error === 'object') {
        entry.errorString = JSON.stringify(error);
        entry.errorType = error.constructor?.name || 'Unknown';
      } else {
        entry.errorString = String(error);
      }
    }

    return entry;
  }

  private async persistLog(entry: LogEntry) {
    if (!this.config.enablePersistentStorage) return;

    try {
      const key = `log_${entry.id}`;
      await AsyncStorage.setItem(key, JSON.stringify(entry));
      
      // Clean old logs
      const keys = await AsyncStorage.getAllKeys();
      const logKeys = keys.filter(k => k.startsWith('log_'));
      if (logKeys.length > this.config.maxHistorySize) {
        const toDelete = logKeys.slice(0, logKeys.length - this.config.maxHistorySize);
        await AsyncStorage.multiRemove(toDelete);
      }
    } catch (error) {
      // Silent fail - persistence is best effort
    }
  }

  private async loadHistory() {
    if (!this.config.enablePersistentStorage) return;

    try {
      const keys = await AsyncStorage.getAllKeys();
      const logKeys = keys.filter(k => k.startsWith('log_')).slice(-100); // Load last 100
      const items = await AsyncStorage.multiGet(logKeys);
      
      this.history = items
        .map(([_, value]) => {
          try {
            return value ? JSON.parse(value) : null;
          } catch {
            return null;
          }
        })
        .filter(Boolean) as LogEntry[];
    } catch (error) {
      // Silent fail
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];
    const currentLevelIndex = levels.indexOf(this.config.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private log(level: LogLevel, message: string, error?: Error | any, data?: any) {
    if (!this.shouldLog(level)) return;

    const entry = this.createLogEntry(level, message, error, data);
    
    // Add to history
    this.history.push(entry);
    if (this.history.length > this.config.maxHistorySize) {
      this.history.shift();
    }

    // Persist
    this.persistLog(entry);

    // Console output
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    const platformPrefix = `[${entry.platform.toUpperCase()}]`;
    
    const logData = {
      message: entry.message,
      ...(entry.data && { data: entry.data }),
      ...(entry.errorString && { error: entry.errorString }),
      ...(entry.stack && { stack: entry.stack }),
      ...(entry.module && { module: entry.module }),
      ...(entry.method && { method: entry.method }),
    };

    switch (level) {
      case 'debug':
        if (__DEV__) {
          console.log(prefix, platformPrefix, message, logData);
        }
        break;
      case 'info':
        console.info(prefix, platformPrefix, message, logData);
        break;
      case 'warn':
        console.warn(prefix, platformPrefix, message, logData);
        break;
      case 'error':
      case 'fatal':
        console.error(prefix, platformPrefix, message, logData);
        if (entry.stack) {
          console.error('Stack:', entry.stack);
        }
        break;
    }

    // Native logging for Android/iOS
    if (this.config.enableNativeLogging && Platform.OS !== 'web') {
      try {
        const { NativeModules } = require('react-native');
        if (NativeModules.LoggingModule) {
          NativeModules.LoggingModule.log(level, message, JSON.stringify(logData));
        }
      } catch {
        // Native module not available
      }
    }
  }

  debug(message: string, data?: any) {
    this.log('debug', message, undefined, data);
  }

  info(message: string, data?: any) {
    this.log('info', message, undefined, data);
  }

  warn(message: string, error?: Error | any, data?: any) {
    this.log('warn', message, error, data);
  }

  error(message: string, error?: Error | any, data?: any) {
    this.log('error', message, error, data);
  }

  fatal(message: string, error?: Error | any, data?: any) {
    this.log('fatal', message, error, data);
  }

  logNativeError(module: string, method: string, error: Error | any, data?: any) {
    const entry = this.createLogEntry('error', `Native Error [${module}.${method}]`, error, {
      ...data,
      module,
      method,
      errorType: 'native',
    });
    
    entry.module = module;
    entry.method = method;
    
    this.history.push(entry);
    this.persistLog(entry);

    const errorString = error instanceof Error ? error.message : String(error);
    console.error(
      `[${new Date().toISOString()}] [ERROR] [${Platform.OS.toUpperCase()}] Native Error [${module}.${method}]`,
      {
        error: errorString,
        stack: error instanceof Error ? error.stack : undefined,
        ...data,
      }
    );

    // Try to log to native console
    if (Platform.OS === 'android') {
      try {
        const { NativeModules } = require('react-native');
        if (NativeModules.LoggingModule) {
          NativeModules.LoggingModule.logNativeError(
            module,
            method,
            errorString,
            JSON.stringify(data || {})
          );
        }
      } catch {
        // Fallback to console
      }
    }
  }

  logBridgeError(method: string, error: Error | any, data?: any) {
    this.error(`Bridge Error [${method}]`, error, {
      ...data,
      method,
      errorType: 'bridge',
    });
  }

  getRecentLogs(level?: LogLevel, limit: number = 50): LogEntry[] {
    // Make sure we return a copy, not the internal array
    let logs = [...this.history];
    
    if (level) {
      logs = logs.filter(log => log.level === level);
    }
    
    return logs.slice(-limit);
  }

  async exportLogs(): Promise<string> {
    const logs = this.history.map(log => {
      const lines = [
        `[${log.timestamp}] [${log.level.toUpperCase()}] [${log.platform.toUpperCase()}] ${log.message}`,
      ];
      
      if (log.module && log.method) {
        lines.push(`  Module: ${log.module}.${log.method}`);
      }
      
      if (log.errorString) {
        lines.push(`  Error: ${log.errorString}`);
      }
      
      if (log.errorType) {
        lines.push(`  Type: ${log.errorType}`);
      }
      
      if (log.data) {
        lines.push(`  Data: ${JSON.stringify(log.data, null, 2)}`);
      }
      
      if (log.stack) {
        lines.push(`  Stack:\n${log.stack.split('\n').map(l => `    ${l}`).join('\n')}`);
      }
      
      return lines.join('\n');
    });
    
    return logs.join('\n\n');
  }

  async clearHistory() {
    this.history = [];
    
    if (this.config.enablePersistentStorage) {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const logKeys = keys.filter(k => k.startsWith('log_'));
        await AsyncStorage.multiRemove(logKeys);
      } catch (error) {
        this.error('Failed to clear log history', error);
      }
    }
  }

  configure(config: Partial<LoggerConfig>) {
    this.config = { ...this.config, ...config };
  }

  getConfig(): LoggerConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience functions
export const logDebug = (message: string, data?: any) => logger.debug(message, data);
export const logInfo = (message: string, data?: any) => logger.info(message, data);
export const logWarn = (message: string, error?: Error | any, data?: any) => logger.warn(message, error, data);
export const logError = (message: string, error?: Error | any, data?: any) => logger.error(message, error, data);
export const logFatal = (message: string, error?: Error | any, data?: any) => logger.fatal(message, error, data);
