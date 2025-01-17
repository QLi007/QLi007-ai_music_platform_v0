import { PerformanceMonitor } from '../utils/performance.monitor';
import { Logger } from '../utils/logger';

export interface MonitorOptions {
  name?: string;
  context?: Record<string, any>;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  logArgs?: boolean;
  logResult?: boolean;
  rethrowError?: boolean;
}

interface MonitorContext {
  className: string;
  methodName: string;
  timestamp: string;
  arguments?: any[];
  type?: string;
}

interface SuccessContext extends MonitorContext {
  duration: number;
  success: boolean;
  result?: any;
}

interface ErrorContext extends MonitorContext {
  duration: number;
  success: boolean;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
}

const logger = Logger.forContext('MonitorDecorator');

function createLogContext(context: MonitorContext): Error & Record<string, any> {
  const error = new Error();
  return Object.assign(error, context);
}

export function Monitor(options: MonitorOptions = {}) {
  const {
    logLevel = 'info',
    logArgs = true,
    logResult = false,
    rethrowError = true
  } = options;

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const operationName = options.name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      const context: MonitorContext = {
        ...options.context,
        className: target.constructor.name,
        methodName: propertyKey,
        timestamp: new Date().toISOString(),
        type: 'operation_start'
      };

      if (logArgs) {
        context.arguments = args.map(arg => {
          if (arg === null) return 'null';
          if (arg === undefined) return 'undefined';
          if (typeof arg === 'function') return 'function';
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg);
            } catch {
              return Object.keys(arg);
            }
          }
          return arg;
        });
      }

      try {
        logger[logLevel](`开始执行 ${operationName}`, createLogContext(context));

        const result = await PerformanceMonitor.monitor(
          operationName,
          () => originalMethod.apply(this, args),
          context
        );

        const duration = Date.now() - startTime;
        const successContext: SuccessContext = {
          ...context,
          duration,
          success: true,
          type: 'operation_complete'
        };

        if (logResult) {
          successContext.result = typeof result === 'object' ? 
            JSON.stringify(result) : result;
        }

        logger[logLevel](`完成执行 ${operationName}`, createLogContext(successContext));
        return result;

      } catch (error: any) {
        const duration = Date.now() - startTime;
        const errorContext: ErrorContext = {
          ...context,
          duration,
          success: false,
          type: 'operation_error',
          error: {
            name: error.name || 'Error',
            message: error.message || '未知错误',
            stack: error.stack
          }
        };

        logger.error(`执行 ${operationName} 失败`, createLogContext(errorContext));

        if (rethrowError) {
          throw error;
        }
      }
    };

    return descriptor;
  };
} 