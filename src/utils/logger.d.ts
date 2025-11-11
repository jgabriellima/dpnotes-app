// Type declarations for logger exports
export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
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

