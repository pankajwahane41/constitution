import React, { memo } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

const serializeError = (error: any) => {
  if (error instanceof Error) {
    return error.message + '\n' + error.stack;
  }
  return JSON.stringify(error, null, 2);
};

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
  errorInfo: any;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackComponent?: React.ComponentType<{ error: any; retry: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: any): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    this.setState({
      error,
      errorInfo
    });
    
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback component if provided
      if (this.props.fallbackComponent) {
        const FallbackComponent = this.props.fallbackComponent;
        return <FallbackComponent error={this.state.error} retry={this.handleRetry} />;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center border border-red-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-navy mb-4">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              We encountered an unexpected error. Don't worry, your progress is saved!
            </p>
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full p-3 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Go to Home</span>
              </button>
            </div>
            
            {/* Development mode error details */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                  Technical Details (Development)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-3 rounded text-red-600 overflow-auto max-h-40">
                  {serializeError(this.state.error)}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Memoized version for performance
const MemoizedErrorBoundary = memo(ErrorBoundary);
export { MemoizedErrorBoundary as ErrorBoundary };
export default MemoizedErrorBoundary;