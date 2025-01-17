import NodeCache from 'node-cache';
import { CacheError } from '../errors/music-project.errors';
import { RepositoryUtils } from './repository.utils';
import { Logger } from './logger';

export interface CacheOptions {
  stdTTL?: number;
  checkperiod?: number;
  useClones?: boolean;
  prefix?: string;
}

export class CacheManager {
  private cache: NodeCache;
  private readonly prefix: string;
  private readonly logger: Logger;

  constructor(options: CacheOptions = {}) {
    this.cache = new NodeCache({
      stdTTL: options.stdTTL || 300, // 默认5分钟
      checkperiod: options.checkperiod || 60, // 默认1分钟检查
      useClones: options.useClones ?? false,
    });
    this.prefix = options.prefix || '';
    this.logger = Logger.forContext('CacheManager');

    // 监听缓存事件
    this.cache.on('set', (key: string) => {
      this.logger.debug('缓存设置', { key });
    });

    this.cache.on('del', (key: string) => {
      this.logger.debug('缓存删除', { key });
    });

    this.cache.on('expired', (key: string) => {
      this.logger.debug('缓存过期', { key });
    });

    this.cache.on('flush', () => {
      this.logger.debug('缓存清空');
    });
  }

  /**
   * 设置缓存值
   * @param key 键
   * @param value 值
   */
  public set<T>(key: string, value: T): void {
    try {
      const cacheKey = this.getCacheKey(key);
      const success = this.cache.set(cacheKey, value);
      if (!success) {
        this.logger.error('缓存设置失败', undefined, { key: cacheKey });
        throw new CacheError('缓存设置失败');
      }
      this.logger.debug('缓存设置成功', { key: cacheKey });
    } catch (error) {
      this.handleError('设置', error, key);
    }
  }

  /**
   * 获取缓存值
   * @param key 键
   */
  public get<T>(key: string): T | undefined {
    try {
      const cacheKey = this.getCacheKey(key);
      const value = this.cache.get<T>(cacheKey);
      this.logger.debug('缓存获取', { 
        key: cacheKey, 
        hit: value !== undefined 
      });
      return value;
    } catch (error) {
      this.handleError('获取', error, key);
    }
  }

  /**
   * 删除缓存值
   * @param key 键
   */
  public delete(key: string): void {
    try {
      const cacheKey = this.getCacheKey(key);
      const deleted = this.cache.del(cacheKey);
      if (deleted === 0) {
        this.logger.debug('缓存键不存在', { key: cacheKey });
        return;
      }
      this.logger.debug('缓存删除成功', { key: cacheKey });
    } catch (error) {
      this.handleError('删除', error, key);
    }
  }

  /**
   * 检查键是否存在
   * @param key 键
   */
  public has(key: string): boolean {
    try {
      const cacheKey = this.getCacheKey(key);
      const exists = this.cache.has(cacheKey);
      this.logger.debug('缓存检查', { 
        key: cacheKey, 
        exists 
      });
      return exists;
    } catch (error) {
      this.handleError('检查', error, key);
      return false;
    }
  }

  /**
   * 清空缓存
   */
  public clear(): void {
    try {
      this.cache.flushAll();
      this.logger.info('缓存已清空');
    } catch (error) {
      this.handleError('清空', error);
    }
  }

  /**
   * 获取缓存统计信息
   */
  public getStats(): NodeCache.Stats {
    const stats = this.cache.getStats();
    this.logger.debug('缓存统计', stats);
    return stats;
  }

  private getCacheKey(key: string): string {
    return this.prefix ? RepositoryUtils.generateCacheKey(this.prefix, key) : key;
  }

  private handleError(operation: string, error: unknown, key?: string): never {
    const message = RepositoryUtils.formatErrorMessage(error);
    const context = key ? { operation, key } : { operation };
    this.logger.error(`缓存${operation}失败`, error instanceof Error ? error : undefined, context);
    throw new CacheError(`缓存${operation}失败: ${message}`);
  }
} 