'use client';

import React, { ReactNode } from 'react';
import { AlertCircle, RotateCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary para capturar errores de React
 * Previene que la app se bloquee completamente
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error para debugging
    console.error('Error capturado por Error Boundary:', error);
    console.error('Error Info:', errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // En producción, podría enviarse a un servicio de logging como Sentry
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     error: error.message,
      //     stack: error.stack,
      //     componentStack: errorInfo.componentStack,
      //   }),
      // });
    }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} resetError={() => this.setState({ hasError: false, error: null, errorInfo: null })} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  resetError: () => void;
}

/**
 * Componente fallback cuando hay error
 */
function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const router = useRouter();

  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-red-200 dark:border-red-900 p-8 text-center">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ¡Algo salió mal!
          </h1>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Lo sentimos, encontramos un error inesperado. Por favor, intenta nuevamente.
          </p>

          {/* Error Details (only in development) */}
          {isDevelopment && error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded text-left border border-red-200 dark:border-red-800">
              <p className="text-sm font-mono text-red-800 dark:text-red-200 break-words">
                {error.message}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={resetError}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            >
              <RotateCw className="w-4 h-4 mr-2" />
              Intentar de Nuevo
            </Button>

            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Ir al Dashboard
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
            Si el problema persiste, intenta recargar la página o contacta al soporte.
          </p>
        </div>
      </div>
    </div>
  );
}
