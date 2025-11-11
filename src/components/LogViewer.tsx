// Development-only log viewer component
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { logger } from '../utils/logger';

// Re-export LogEntry type for convenience
type LogEntry = {
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
};
import { X, Trash2, Download, Filter } from 'lucide-react-native';

interface LogViewerProps {
  visible: boolean;
  onClose: () => void;
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'all';

export function LogViewer({ visible, onClose }: LogViewerProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<LogLevel>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!visible) return;

    const loadLogs = () => {
      const recentLogs = logger.getRecentLogs(
        filter === 'all' ? undefined : filter,
        200
      );
      setLogs(recentLogs.reverse()); // Most recent first
    };

    loadLogs();

    if (autoRefresh) {
      const interval = setInterval(loadLogs, 1000);
      return () => clearInterval(interval);
    }
  }, [visible, filter, autoRefresh]);

  const handleClear = async () => {
    await logger.clearHistory();
    setLogs([]);
  };

  const handleExport = async () => {
    const exported = await logger.exportLogs();
    console.log('=== EXPORTED LOGS ===');
    console.log(exported);
    console.log('=== END LOGS ===');
    // In production, you'd use Share API here
  };

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case 'debug':
        return '#64748B';
      case 'info':
        return '#3B82F6';
      case 'warn':
        return '#F59E0B';
      case 'error':
      case 'fatal':
        return '#EF4444';
      default:
        return '#64748B';
    }
  };

  if (!__DEV__) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Log Viewer</Text>
          <View style={styles.headerActions}>
            <Pressable
              style={styles.iconButton}
              onPress={() => setAutoRefresh(!autoRefresh)}
            >
              <Text style={styles.iconButtonText}>
                {autoRefresh ? '⏸' : '▶'}
              </Text>
            </Pressable>
            <Pressable style={styles.iconButton} onPress={handleExport}>
              <Download size={20} color="#64748B" />
            </Pressable>
            <Pressable style={styles.iconButton} onPress={handleClear}>
              <Trash2 size={20} color="#EF4444" />
            </Pressable>
            <Pressable style={styles.iconButton} onPress={onClose}>
              <X size={20} color="#64748B" />
            </Pressable>
          </View>
        </View>

        <View style={styles.filters}>
          {(['all', 'debug', 'info', 'warn', 'error', 'fatal'] as LogLevel[]).map(
            (level) => (
              <Pressable
                key={level}
                style={[
                  styles.filterButton,
                  filter === level && styles.filterButtonActive,
                ]}
                onPress={() => setFilter(level)}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === level && styles.filterTextActive,
                  ]}
                >
                  {level.toUpperCase()}
                </Text>
              </Pressable>
            )
          )}
        </View>

        <ScrollView style={styles.logsContainer} contentContainerStyle={styles.logsContent}>
          {logs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No logs found</Text>
            </View>
          ) : (
            logs.map((log) => (
              <View key={log.id} style={styles.logEntry}>
                <View style={styles.logHeader}>
                  <View
                    style={[
                      styles.levelBadge,
                      { backgroundColor: getLevelColor(log.level) },
                    ]}
                  >
                    <Text style={styles.levelText}>{log.level.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.timestamp}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </Text>
                  <Text style={styles.platform}>{log.platform}</Text>
                </View>
                <Text style={styles.message}>{log.message}</Text>
                {log.errorString && (
                  <Text style={styles.error}>{log.errorString}</Text>
                )}
                {log.module && log.method && (
                  <Text style={styles.meta}>
                    {log.module}.{log.method}
                  </Text>
                )}
                {log.data && (
                  <Text style={styles.data}>
                    {JSON.stringify(log.data, null, 2)}
                  </Text>
                )}
                {log.stack && (
                  <ScrollView style={styles.stack}>
                    <Text style={styles.stackText}>{log.stack}</Text>
                  </ScrollView>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
  iconButtonText: {
    fontSize: 16,
  },
  filters: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  logsContainer: {
    flex: 1,
  },
  logsContent: {
    padding: 16,
  },
  logEntry: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#E2E8F0',
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'monospace',
  },
  platform: {
    fontSize: 10,
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  error: {
    fontSize: 12,
    color: '#DC2626',
    fontFamily: 'monospace',
    marginTop: 4,
  },
  meta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  data: {
    fontSize: 11,
    color: '#475569',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  stack: {
    maxHeight: 150,
    marginTop: 8,
    backgroundColor: '#1E293B',
    borderRadius: 4,
    padding: 8,
  },
  stackText: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
  },
});

