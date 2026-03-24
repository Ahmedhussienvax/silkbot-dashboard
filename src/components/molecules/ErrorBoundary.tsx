"use client";
import React, { Component, type ErrorInfo, type ReactNode } from 'react';

// Skill 12: Robust Error Boundary for Dashboards
interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("🔴 [Skill 12] Critical Failure:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center bg-red-50 dark:bg-red-950/20 rounded-xl border-2 border-red-200">
          <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">Something went wrong</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Don't worry, SilkBot is attempting to self-heal.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-foreground rounded-lg hover:bg-red-700 transition-colors shadow-lg"
          >
            Retry Connection
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
