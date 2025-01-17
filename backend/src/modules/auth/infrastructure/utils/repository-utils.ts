import { ClientSession, Connection } from 'mongoose';
import { Logger } from './logger';

export interface TransactionOptions {
  maxRetries?: number;
  context?: { [key: string]: any };
}

export class RepositoryUtils {
  private readonly logger: Logger;
  private readonly connection: Connection;

  constructor(connection: Connection) {
    this.logger = Logger.forContext('RepositoryUtils');
    this.connection = connection;
  }

  public async withTransaction<T>(
    operation: (session: ClientSession) => Promise<T>,
    options: TransactionOptions = {}
  ): Promise<T> {
    const maxRetries = options.maxRetries || 3;
    let attempt = 1;

    while (attempt <= maxRetries) {
      const session = await this.startSession();
      try {
        session.startTransaction();
        this.logger.debug('事务开始', { attempt, ...options.context });

        const result = await operation(session);
        await session.commitTransaction();

        this.logger.debug('事务提交成功', { attempt, ...options.context });
        await session.endSession();
        return result;
      } catch (error) {
        await session.abortTransaction();
        await session.endSession();

        if (attempt === maxRetries) {
          this.logger.error('事务重试次数已达上限', error as Error, {
            attempt,
            maxRetries,
            ...options.context,
          });
          throw error;
        }

        this.logger.warn('事务失败，准备重试', { 
          attempt,
          error: (error as Error).message,
          ...options.context,
        });

        await this.delay(Math.pow(2, attempt) * 100); // 指数退避
        attempt++;
      }
    }

    throw new Error('事务执行失败');
  }

  private async startSession(): Promise<ClientSession> {
    try {
      const session = await this.connection.startSession();
      return session;
    } catch (error) {
      this.logger.error('创建会话失败', error as Error);
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 