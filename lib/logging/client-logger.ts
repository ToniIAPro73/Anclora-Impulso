/**
 * Frontend Error Logging and Telemetry
 * Provides structured logging for errors and events
 * Can be integrated with services like Sentry, DataDog, or custom backend
 */

export interface LogLevel {
  DEBUG: 'debug';
  INFO: 'info';
  WARN: 'warn';
  ERROR: 'error';
}

export type LogLevelType = keyof LogLevel;

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  data?: Record<string, any>;
  url?: string;
  userAgent?: string;
  userId?: string;
}

class ClientLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logs: LogEntry[] = [];
  private maxLogs = 100; // Keep last 100 logs in memory
  private logQueue: LogEntry[] = [];
  private flushInterval = 30000; // Flush every 30 seconds

  constructor() {
    if (typeof window !== 'undefined') {
      // Flush logs periodically
      setInterval(() => this.flush(), this.flushInterval);

      // Flush logs before page unload
      window.addEventListener('beforeunload', () => this.flush());
    }
  }

  /**
   * Log debug level messages (development only)
   */
  debug(message: string, data?: Record<string, any>) {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data);
      this.addLog('debug', message, data);
    }
  }

  /**
   * Log info level messages
   */
  info(message: string, data?: Record<string, any>) {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, data);
    }
    this.addLog('info', message, data);
  }

  /**
   * Log warning level messages
   */
  warn(message: string, data?: Record<string, any>) {
    console.warn(`[WARN] ${message}`, data);
    this.addLog('warn', message, data);
  }

  /**
   * Log error level messages with stack trace
   */
  error(message: string, error?: Error | unknown, data?: Record<string, any>) {
    const errorData = {
      ...data,
      ...(error instanceof Error && {
        errorMessage: error.message,
        errorStack: error.stack,
        errorName: error.name,
      }),
    };

    console.error(`[ERROR] ${message}`, error, errorData);
    this.addLog('error', message, errorData);
  }

  /**
   * Log unhandled promise rejections
   */
  logUnhandledRejection(reason: any) {
    const message = reason instanceof Error ? reason.message : String(reason);
    const data = {
      type: 'unhandledRejection',
      reason:
        reason instanceof Error
          ? {
              message: reason.message,
              stack: reason.stack,
              name: reason.name,
            }
          : reason,
    };
    this.error(`Unhandled Promise Rejection: ${message}`, reason, data);
  }

  /**
   * Log uncaught exceptions
   */
  logUncaughtException(error: Error) {
    const data = {
      type: 'uncaughtException',
      message: error.message,
      stack: error.stack,
      name: error.name,
    };
    this.error(`Uncaught Exception: ${error.message}`, error, data);
  }

  /**
   * Track user actions (page views, clicks, etc.)
   */
  trackEvent(event: string, data?: Record<string, any>) {
    this.info(`Event: ${event}`, data);
  }

  /**
   * Track page navigation
   */
  trackPageView(path: string, title?: string) {
    this.info(`Page View: ${path}`, { title });
  }

  /**
   * Track API errors
   */
  trackApiError(
    endpoint: string,
    status: number,
    message: string,
    data?: Record<string, any>
  ) {
    this.error(`API Error: ${endpoint}`, new Error(message), {
      endpoint,
      status,
      ...data,
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metric: string, duration: number, data?: Record<string, any>) {
    this.info(`Performance: ${metric}`, {
      durationMs: duration,
      ...data,
    });
  }

  /**
   * Set user context for all logs
   */
  setUser(userId: string, metadata?: Record<string, any>) {
    if (typeof window !== 'undefined') {
      (window as any).__logUserContext = {
        userId,
        ...metadata,
      };
    }
  }

  /**
   * Clear user context
   */
  clearUser() {
    if (typeof window !== 'undefined') {
      delete (window as any).__logUserContext;
    }
  }

  /**
   * Get all logs from memory
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear all logs from memory
   */
  clearLogs() {
    this.logs = [];
    this.logQueue = [];
  }

  /**
   * Add log entry
   */
  private addLog(level: string, message: string, data?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      userId: (typeof window !== 'undefined' && (window as any).__logUserContext?.userId) || undefined,
    };

    this.logs.push(entry);
    this.logQueue.push(entry);

    // Keep only last N logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  /**
   * Flush logs to backend or external service
   * Can be overridden to send to Sentry, DataDog, or custom backend
   */
  private async flush() {
    if (this.logQueue.length === 0) {
      return;
    }

    const logsToSend = [...this.logQueue];
    this.logQueue = [];

    try {
      // In production, send logs to your backend or logging service
      if (!this.isDevelopment && typeof window !== 'undefined') {
        // Example: Send to your backend
        await fetch('/api/logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            logs: logsToSend,
            timestamp: new Date().toISOString(),
          }),
          // Use keepalive in case the page is unloading
          keepalive: true,
        }).catch(() => {
          // Silently fail - don't break the app if logging fails
        });
      }
    } catch (error) {
      // Silently fail - don't break the app if logging fails
      console.error('Failed to flush logs', error);
    }
  }

  /**
   * Manually flush logs
   */
  forceFlush() {
    this.flush();
  }
}

// Create singleton instance
export const clientLogger = new ClientLogger();

/**
 * Setup global error handlers
 */
export function setupErrorHandlers() {
  if (typeof window === 'undefined') {
    return;
  }

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    clientLogger.logUnhandledRejection(event.reason);
  });

  // Handle uncaught exceptions
  window.addEventListener('error', (event) => {
    if (event.error instanceof Error) {
      clientLogger.logUncaughtException(event.error);
    }
  });
}
