/**
 * 通用结果类，用于处理成功/失败的操作结果
 */
export class Result<T> {
  public isSuccess: boolean;
  public isFailure: boolean;
  public error: string | null;
  private _value: T | null;

  private constructor(isSuccess: boolean, error?: string | null, value?: T) {
    if (isSuccess && error) {
      throw new Error('InvalidOperation: A result cannot be successful and contain an error');
    }
    if (!isSuccess && !error) {
      throw new Error('InvalidOperation: A failing result needs to contain an error message');
    }

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error || null;
    this._value = value || null;
    
    Object.freeze(this);
  }

  public getValue(): T {
    if (!this.isSuccess || this._value === null) {
      throw new Error('无法从失败的结果中获取值');
    }

    return this._value;
  }

  public static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, null, value);
  }

  public static fail<U>(error: string): Result<U> {
    return new Result<U>(false, error);
  }

  public static combine(results: Result<any>[]): Result<void> {
    for (const result of results) {
      if (result.isFailure) return Result.fail(result.error || '组合结果失败');
    }
    return Result.ok();
  }
} 