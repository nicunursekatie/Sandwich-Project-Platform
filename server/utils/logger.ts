interface LogLevel {
  ERROR: 0;
  WARN: 1;
  INFO: 2;
  DEBUG: 3;
}

const LOG_LEVELS: LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

class Logger {
  private level: number;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    
    // Set log level based on environment
    if (this.isProduction) {
      this.level = LOG_LEVELS.WARN; // Production: only warnings and errors
    } else {
      const envLevel = process.env.LOG_LEVEL?.toUpperCase();
      switch (envLevel) {
        case 'ERROR':
          this.level = LOG_LEVELS.ERROR;
          break;
        case 'WARN':
          this.level = LOG_LEVELS.WARN;
          break;
        case 'INFO':
          this.level = LOG_LEVELS.INFO;
          break;
        case 'DEBUG':
          this.level = LOG_LEVELS.DEBUG;
          break;
        default:
          this.level = LOG_LEVELS.INFO; // Development default
      }
    }
  }

  private formatMessage(level: string, message: string, context?: any): string {
    const timestamp = new Date().toISOString();
    const baseMessage = `[${timestamp}] ${level}: ${message}`;
    
    if (context && !this.isProduction) {
      try {
        const contextStr = typeof context === 'string' ? context : JSON.stringify(context).substring(0, 200);
        return `${baseMessage} ${contextStr}`;
      } catch (e) {
        return `${baseMessage} [context serialization failed]`;
      }
    }
    
    return baseMessage;
  }

  error(message: string, error?: any, context?: any): void {
    if (this.level >= LOG_LEVELS.ERROR) {
      // Prevent circular references by limiting error serialization
      let errorDetails = '';
      if (error instanceof Error) {
        errorDetails = error?.message || String(error);
      } else if (typeof error === 'string') {
        errorDetails = error;
      } else if (error && typeof error === 'object') {
        errorDetails = JSON.stringify(error).substring(0, 200) + '...';
      }
      
      const safeContext = context ? JSON.stringify(context).substring(0, 100) : '';
      console.error(this.formatMessage('ERROR', message + (errorDetails ? ': ' + errorDetails : '') + (safeContext ? ' | ' + safeContext : '')));
      
      // In production, you might want to send to external logging service
      if (this.isProduction && error instanceof Error) {
        // TODO: Send to external error tracking service (Sentry, LogRocket, etc.)
      }
    }
  }

  warn(message: string, context?: any): void {
    if (this.level >= LOG_LEVELS.WARN) {
      console.warn(this.formatMessage('WARN', message, context));
    }
  }

  info(message: string, context?: any): void {
    if (this.level >= LOG_LEVELS.INFO) {
      console.info(this.formatMessage('INFO', message, context));
    }
  }

  debug(message: string, context?: any): void {
    if (this.level >= LOG_LEVELS.DEBUG) {
      console.debug(this.formatMessage('DEBUG', message, context));
    }
  }

  // Helper methods for common logging scenarios
  apiRequest(method: string, path: string, userId?: string, duration?: number): void {
    if (this.level >= LOG_LEVELS.INFO) {
      this.info(`API ${method} ${path}`, { userId, duration });
    }
  }

  apiError(method: string, path: string, error: any, userId?: string): void {
    this.error(`API ${method} ${path} failed`, error, { userId });
  }

  authEvent(event: string, userId?: string, details?: any): void {
    this.info(`Auth: ${event}`, { userId, ...details });
  }

  databaseQuery(query: string, duration?: number, error?: any): void {
    if (error) {
      this.error(`Database query failed: ${query}`, error, { duration });
    } else if (this.level >= LOG_LEVELS.DEBUG) {
      this.debug(`Database query: ${query}`, { duration });
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for testing or custom instances
export { Logger, LOG_LEVELS };