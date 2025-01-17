import mongoose, { ClientSession } from 'mongoose';
import { TransactionError } from '../errors/music-project.errors';
import { Logger } from './logger';

export interface TransactionOptions {
  timeout?: number;
  retries?: number;
  context?: {
    operation?: string;
    userId?: string;
    projectId?: string;
    [key: string]: any;
  };
}

export class RepositoryUtils {
  private static readonly DEFAULT_TIMEOUT = 30000; // 30秒
  private static readonly DEFAULT_RETRIES = 3;
  private static readonly logger = Logger.forContext('RepositoryUtils');

  /**
   * 执行数据库事务
   * @param operation 事务操作函数
   * @param options 事务选项
   */
  public static async withTransaction<T>(
    operation: (session: ClientSession) => Promise<T>,
    options: TransactionOptions = {}
  ): Promise<T> {
    const timeout = options.timeout || this.DEFAULT_TIMEOUT;
    const retries = options.retries || this.DEFAULT_RETRIES;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        this.logger.debug('开始事务', { 
          attempt,
          timeout,
          ...options.context 
        });

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new TransactionError('事务超时')), timeout);
        });

        const operationPromise = operation(session);
        const result = await Promise.race([operationPromise, timeoutPromise]) as T;
        
        await session.commitTransaction();
        this.logger.debug('事务提交成功', options.context);
        return result;
      } catch (error) {
        await session.abortTransaction();
        lastError = error instanceof Error ? error : new Error('未知错误');
        
        if (error instanceof TransactionError || attempt === retries) {
          this.logger.error('事务执行失败', lastError, {
            attempt,
            isLastAttempt: attempt === retries,
            ...options.context
          });
          throw error;
        }
        
        this.logger.warn('事务重试', {
          attempt,
          error: lastError.message,
          nextRetryIn: Math.pow(2, attempt) * 100,
          ...options.context
        });
        
        // 指数退避重试
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
      } finally {
        session.endSession();
      }
    }

    throw lastError || new TransactionError('事务执行失败');
  }

  /**
   * 生成缓存键
   * @param prefix 前缀
   * @param id ID
   */
  public static generateCacheKey(prefix: string, id: string): string {
    return `${prefix}:${id}`;
  }

  /**
   * 格式化错误消息
   * @param error 错误对象
   */
  public static formatErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return '未知错误';
  }
} 