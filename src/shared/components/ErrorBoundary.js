import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

/**
 * Catches JS render errors and displays them on screen instead of crashing silently.
 * Use around navigator or screen trees to surface errors during development.
 */
export class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught:', error, errorInfo?.componentStack);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const msg = this.state.error?.message || String(this.state.error);
      const stack = this.state.errorInfo?.componentStack || '';
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <ScrollView style={styles.scroll}>
            <Text style={styles.message}>{msg}</Text>
            {stack ? <Text style={styles.stack}>{stack}</Text> : null}
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ff6b6b',
    marginBottom: 12,
  },
  scroll: { flex: 1 },
  message: {
    fontSize: 14,
    color: '#eee',
    marginBottom: 8,
  },
  stack: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'monospace',
  },
});

export default ErrorBoundary;
