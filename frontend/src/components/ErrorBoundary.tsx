import React from 'react';
import { AlertTriangle, LayoutDashboard } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface-primary flex items-center justify-center px-4">
          <div className="text-center max-w-md" data-testid="error-boundary-fallback">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6">
              <AlertTriangle className="h-10 w-10 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100 mb-3">Something went wrong</h1>
            <p className="text-slate-400 mb-8">
              We hit an unexpected error. Don't worry, your data is safe.
            </p>
            <a
              href="/dashboard"
              data-testid="error-go-dashboard"
              className="btn-primary inline-flex items-center gap-2 px-6 py-3"
            >
              <LayoutDashboard className="h-5 w-5" />
              Go to Dashboard
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
