import { Logger } from './logger';

export interface CacheOptions {
  stdTTL: number;
  checkperiod: number;
  prefix: string;
}

interface CacheEntry<T> {
  value: T;
  expiry: number;
}

export class CacheManager<T> {
  private readonly cache: Map<string, CacheEntry<T>>;
  private readonly options: CacheOptions;
  private readonly logger: Logger;
  private readonly cleanupInterval: NodeJS.Timeout;

  constructor(options: CacheOptions) {
    this.cache = new Map();
    this.options = options;
    this.logger = Logger.forContext('CacheManager');

    // 定期清理过期缓存
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, options.checkperiod * 1000);
  }

  public set(key: string, value: T): void {
    try {
      const cacheKey = this.getCacheKey(key);
      const expiry = Date.now() + this.options.stdTTL * 1000;
      this.cache.set(cacheKey, { value, expiry });
      this.logger.debug('缓存设置成功', { key: cacheKey });
    } catch (error) {
      this.logger.error('缓存设置失败', error as Error, { key });
    }
  }

  public get<R extends T>(key: string): R | null {
    try {
      const cacheKey = this.getCacheKey(key);
      const entry = this.cache.get(cacheKey);

      if (!entry) {
        return null;
      }

      if (entry.expiry < Date.now()) {
        this.delete(key);
        return null;
      }

      this.logger.debug('缓存命中', { key: cacheKey });
      return entry.value as R;
    } catch (error) {
      this.logger.error('获取缓存失败', error as Error, { key });
      return null;
    }
  }

  public has(key: string): boolean {
    const cacheKey = this.getCacheKey(key);
    return this.cache.has(cacheKey);
  }

  public delete(key: string): void {
    try {
      const cacheKey = this.getCacheKey(key);
      this.cache.delete(cacheKey);
      this.logger.debug('缓存删除成功', { key: cacheKey });
    } catch (error) {
      this.logger.error('删除缓存失败', error as Error, { key });
    }
  }

  public clear(): void {
    try {
      this.cache.clear();
      this.logger.debug('缓存清空成功');
    } catch (error) {
      this.logger.error('清空缓存失败', error as Error);
    }
  }

  public keys(): string[] {
    return Array.from(this.cache.keys());
  }

  private getCacheKey(key: string): string {
    return `${this.options.prefix}:${key}`;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry < now) {
        this.cache.delete(key);
        this.logger.debug('过期缓存已清理', { key });
      }
    }
  }

  public dispose(): void {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
} 