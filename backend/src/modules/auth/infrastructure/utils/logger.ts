/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * 日志上下文
 */
export interface LogContext {
  operation?: string;
  userId?: string;
  projectId?: string;
  [key: string]: any;
}

/**
 * 日志管理器
 */
export class Logger {
  private static instance: Logger;
  private readonly context: string;

  private constructor(context: string) {
    this.context = context;
  }

  public static forContext(context: string): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(context);
    }
    return Logger.instance;
  }

  public debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  public info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  public warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  public error(message: string, error?: Error, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    };
    this.log(LogLevel.ERROR, message, errorContext);
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      context: this.context,
      message,
      ...context,
    };

    // 在生产环境中，这里可以将日志发送到日志服务
    // 目前先使用 console
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(JSON.stringify(logEntry));
        break;
      case LogLevel.INFO:
        console.info(JSON.stringify(logEntry));
        break;
      case LogLevel.WARN:
        console.warn(JSON.stringify(logEntry));
        break;
      case LogLevel.ERROR:
        console.error(JSON.stringify(logEntry));
        break;
    }
  }
} 