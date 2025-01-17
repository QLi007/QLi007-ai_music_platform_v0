import mongoose, { ClientSession } from 'mongoose';
import { Logger } from './logger';

interface TransactionOptions {
  maxRetries?: number;
  context?: Record<string, any>;
}

export class RepositoryUtils {
  private static readonly logger = Logger.forContext('RepositoryUtils');
  private static readonly DEFAULT_MAX_RETRIES = 3;

  public static async withTransaction<T>(
    operation: (session: ClientSession) => Promise<T>,
    options: TransactionOptions = {}
  ): Promise<T> {
    const { maxRetries = this.DEFAULT_MAX_RETRIES, context } = options;
    let currentTry = 1;

    while (true) {
      const session = await mongoose.startSession();

      try {
        session.startTransaction();
        this.logger.debug('事务开始', { attempt: currentTry, ...context });

        const result = await operation(session);
        await session.commitTransaction();

        this.logger.debug('事务提交成功', { attempt: currentTry, ...context });
        return result;

      } catch (error) {
        await session.abortTransaction();
        this.logger.error('事务失败', error as Error, { attempt: currentTry, ...context });

        if (currentTry >= maxRetries) {
          throw error;
        }

        currentTry++;
        this.logger.debug('准备重试事务', { attempt: currentTry, maxRetries, ...context });

      } finally {
        session.endSession();
      }
    }
  }

  public static async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: TransactionOptions = {}
  ): Promise<T> {
    const { maxRetries = this.DEFAULT_MAX_RETRIES, context } = options;
    let currentTry = 1;
    let lastError: Error | null = null;

    while (currentTry <= maxRetries) {
      try {
        this.logger.debug('开始执行操作', { attempt: currentTry, ...context });
        const result = await operation();
        this.logger.debug('操作执行成功', { attempt: currentTry, ...context });
        return result;

      } catch (error) {
        lastError = error as Error;
        this.logger.error('操作执行失败', lastError, { attempt: currentTry, ...context });

        if (currentTry >= maxRetries) {
          break;
        }

        currentTry++;
        this.logger.debug('准备重试操作', { attempt: currentTry, maxRetries, ...context });
        await this.delay(Math.pow(2, currentTry - 1) * 1000); // 指数退避
      }
    }

    throw lastError;
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 