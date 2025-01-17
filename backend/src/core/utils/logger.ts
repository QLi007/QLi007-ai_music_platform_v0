import config from '../../config/config';
import * as fs from 'fs';
import * as path from 'path';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface LogContext {
  [key: string]: any;
}

export class Logger {
  private static instance: Logger;
  private readonly context: string;
  private readonly logDir: string;

  constructor(context: string) {
    this.context = context;
    this.logDir = path.dirname(config.log.filePath);
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      context: this.context,
      message,
      ...context
    };
    return JSON.stringify(logEntry);
  }

  private writeLog(formattedMessage: string): void {
    fs.appendFileSync(config.log.filePath, formattedMessage + '\n');
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = Object.values(LogLevel);
    const configLevel = config.log.level.toLowerCase() as LogLevel;
    return levels.indexOf(level) >= levels.indexOf(configLevel);
  }

  public debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const formattedMessage = this.formatMessage(LogLevel.DEBUG, message, context);
      console.debug(formattedMessage);
      this.writeLog(formattedMessage);
    }
  }

  public info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const formattedMessage = this.formatMessage(LogLevel.INFO, message, context);
      console.info(formattedMessage);
      this.writeLog(formattedMessage);
    }
  }

  public warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const formattedMessage = this.formatMessage(LogLevel.WARN, message, context);
      console.warn(formattedMessage);
      this.writeLog(formattedMessage);
    }
  }

  public error(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const formattedMessage = this.formatMessage(LogLevel.ERROR, message, context);
      console.error(formattedMessage);
      this.writeLog(formattedMessage);
    }
  }
} 