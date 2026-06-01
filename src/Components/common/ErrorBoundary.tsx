import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { APP_ROUTES } from '../../constants/routes';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleRetry}
                className="px-4 py-2 bg-[#6B8A62] text-white rounded-lg hover:bg-[#5A7352] transition-colors"
              >
                Try again
              </button>
              <Link
                to={APP_ROUTES.home}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Go to home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
