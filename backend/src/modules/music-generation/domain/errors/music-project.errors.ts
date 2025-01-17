/**
 * 音乐项目错误基类
 */
export class MusicProjectError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'MusicProjectError';
  }
}

/**
 * 验证错误
 */
export class ValidationError extends MusicProjectError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

/**
 * 未找到错误
 */
export class NotFoundError extends MusicProjectError {
  constructor(id: string) {
    super(`项目 ${id} 未找到`, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/**
 * 重复错误
 */
export class DuplicateError extends MusicProjectError {
  constructor() {
    super('项目ID已存在', 'DUPLICATE_ERROR');
    this.name = 'DuplicateError';
  }
}

/**
 * 缓存错误
 */
export class CacheError extends MusicProjectError {
  constructor(message: string) {
    super(message, 'CACHE_ERROR');
    this.name = 'CacheError';
  }
}

/**
 * 数据库错误
 */
export class DatabaseError extends MusicProjectError {
  constructor(message: string) {
    super(message, 'DATABASE_ERROR');
    this.name = 'DatabaseError';
  }
}

/**
 * 事务错误
 */
export class TransactionError extends MusicProjectError {
  constructor(message: string) {
    super(message, 'TRANSACTION_ERROR');
    this.name = 'TransactionError';
  }
} 