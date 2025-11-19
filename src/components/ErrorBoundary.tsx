/**
 * Error Boundary Component
 * 
 * Catches React errors and displays them
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { logComponentError } from '../utils/errorHandler';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  timestamp: string | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      timestamp: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      timestamp: new Date().toISOString(),
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const timestamp = new Date().toISOString();
    
    // Log consolidado usando error handler global
    logComponentError('ErrorBoundary', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      timestamp,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.errorBox}>
            <Text style={styles.title}>❌ Erro no App</Text>
            
            {this.state.timestamp && (
              <Text style={styles.timestamp}>
                {new Date(this.state.timestamp).toLocaleString('pt-BR')}
              </Text>
            )}
            
            <Text style={styles.subtitle}>Erro capturado:</Text>
            <ScrollView style={styles.errorScroll}>
              <Text style={styles.errorText}>
                {this.state.error?.name}: {this.state.error?.message}
              </Text>
              
              {this.state.error?.stack && (
                <>
                  <Text style={styles.subtitle}>Stack Trace:</Text>
                  <Text style={styles.errorText}>
                    {this.state.error.stack}
                  </Text>
                </>
              )}
              
              {this.state.errorInfo?.componentStack && (
                <>
                  <Text style={styles.subtitle}>Component Stack:</Text>
                  <Text style={styles.errorText}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                </>
              )}
            </ScrollView>

            <Text style={styles.hint}>
              💡 Verifique os logs do terminal para mais detalhes
            </Text>

            <Pressable style={styles.button} onPress={this.handleReset}>
              <Text style={styles.buttonText}>Tentar Novamente</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fee2e2',
    padding: 20,
    justifyContent: 'center',
  },
  errorBox: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#991b1b',
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#7f1d1d',
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  hint: {
    fontSize: 12,
    color: '#7f1d1d',
    marginTop: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f1d1d',
    marginTop: 12,
    marginBottom: 8,
  },
  errorScroll: {
    maxHeight: 400,
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#991b1b',
  },
  button: {
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
