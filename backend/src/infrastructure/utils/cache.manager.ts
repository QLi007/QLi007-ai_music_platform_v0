import { Logger } from './logger';

interface CacheOptions {
  stdTTL?: number;        // 缓存时间（秒）
  checkperiod?: number;   // 检查过期的周期（秒）
  prefix?: string;        // 键前缀
}

interface CacheEntry<T> {
  value: T;
  expiry: number;
}

export class CacheManager {
  private static instance: CacheManager;
  private readonly cache: Map<string, CacheEntry<any>>;
  private readonly logger: Logger;
  private readonly options: Required<CacheOptions>;
  private checkInterval: NodeJS.Timeout | null;

  constructor(options: CacheOptions = {}) {
    this.options = {
      stdTTL: options.stdTTL || 0,
      checkperiod: options.checkperiod || 600,
      prefix: options.prefix || '',
    };

    this.cache = new Map();
    this.logger = Logger.forContext('CacheManager');
    this.checkInterval = null;
    this.startCleanup();
  }

  public set<T>(key: string, value: T, ttl?: number): void {
    const cacheKey = this.getCacheKey(key);
    const expiry = ttl || this.options.stdTTL
      ? Date.now() + ((ttl || this.options.stdTTL) * 1000)
      : 0;

    this.cache.set(cacheKey, { value, expiry });
    this.logger.debug('缓存设置', { key: cacheKey, ttl: ttl || this.options.stdTTL });
  }

  public get<T>(key: string): T | null {
    const cacheKey = this.getCacheKey(key);
    const entry = this.cache.get(cacheKey);

    if (!entry) {
      return null;
    }

    if (this.isExpired(entry)) {
      this.delete(key);
      return null;
    }

    this.logger.debug('缓存命中', { key: cacheKey });
    return entry.value as T;
  }

  public has(key: string): boolean {
    const cacheKey = this.getCacheKey(key);
    const entry = this.cache.get(cacheKey);

    if (!entry) {
      return false;
    }

    if (this.isExpired(entry)) {
      this.delete(key);
      return false;
    }

    return true;
  }

  public delete(key: string): void {
    const cacheKey = this.getCacheKey(key);
    this.cache.delete(cacheKey);
    this.logger.debug('缓存删除', { key: cacheKey });
  }

  public clear(): void {
    this.cache.clear();
    this.logger.debug('缓存清空');
  }

  public keys(): string[] {
    return Array.from(this.cache.keys()).map(key => 
      key.startsWith(this.options.prefix) 
        ? key.slice(this.options.prefix.length) 
        : key
    );
  }

  private getCacheKey(key: string): string {
    return `${this.options.prefix}${key}`;
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return entry.expiry !== 0 && entry.expiry < Date.now();
  }

  private startCleanup(): void {
    if (this.options.checkperiod > 0) {
      this.checkInterval = setInterval(() => {
        this.cleanup();
      }, this.options.checkperiod * 1000);

      // 防止进程等待
      if (this.checkInterval.unref) {
        this.checkInterval.unref();
      }
    }
  }

  private cleanup(): void {
    const now = Date.now();
    let deletedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry !== 0 && entry.expiry < now) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      this.logger.debug('缓存清理完成', { deletedCount });
    }
  }

  public dispose(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.clear();
  }
} 