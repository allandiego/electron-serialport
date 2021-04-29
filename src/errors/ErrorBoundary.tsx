import React from 'react';
import { LogEmitter } from '../utils/LogEmitter';

// Handle all errors in the app
export default class ErrorBoundary extends React.Component {
  componentDidCatch(error: unknown, errorInfo: unknown): void {
    LogEmitter.emit('log', { message: error });
  }

  render(): React.ReactNode {
    const { children } = this.props;
    return children;
  }
}
