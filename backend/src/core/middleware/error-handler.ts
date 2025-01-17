import { Request, Response, NextFunction } from 'express';
import { AppError } from '../error/app-error';
import { Logger } from '../utils/logger';
import config from '../../config/config';

const logger = new Logger('ErrorHandler');

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // 如果错误已经发送了响应，直接返回
  if (res.headersSent) {
    return next(err);
  }

  // 转换为AppError
  const appError = err instanceof AppError
    ? err
    : new AppError(err.message, 500, false, { originalError: err });

  // 记录错误日志
  if (!appError.isOperational) {
    logger.error('非业务错误', {
      error: {
        message: appError.message,
        stack: appError.stack,
        details: appError.details
      },
      request: {
        method: req.method,
        url: req.url,
        body: req.body,
        headers: req.headers
      }
    });
  } else {
    logger.warn('业务错误', {
      error: {
        message: appError.message,
        details: appError.details
      },
      request: {
        method: req.method,
        url: req.url
      }
    });
  }

  // 构建错误响应
  const errorResponse = {
    status: 'error',
    message: config.server.nodeEnv === 'development' 
      ? appError.message 
      : '服务器错误',
    ...(config.server.nodeEnv === 'development' && {
      details: appError.details,
      stack: appError.stack
    })
  };

  // 发送响应
  res.status(appError.statusCode).json(errorResponse);
}

// 处理未捕获的Promise rejection
export function handleUncaughtRejection(server: any): void {
  process.on('unhandledRejection', (reason: Error) => {
    logger.error('未捕获的Promise rejection', {
      error: {
        message: reason.message,
        stack: reason.stack
      }
    });

    // 给服务器一些时间处理当前的请求
    server.close(() => {
      process.exit(1);
    });
  });
}

// 处理未捕获的异常
export function handleUncaughtException(): void {
  process.on('uncaughtException', (error: Error) => {
    logger.error('未捕获的异常', {
      error: {
        message: error.message,
        stack: error.stack
      }
    });

    // 对于未捕获的异常，我们应该立即退出
    process.exit(1);
  });
} 