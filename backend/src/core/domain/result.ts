/**
 * 操作结果类
 */
export class Result<T> {
  public isSuccess: boolean;
  public isFailure: boolean;
  private readonly _error: string | null;
  private readonly _value: T | null;

  private constructor(isSuccess: boolean, error?: string | null, value?: T | null) {
    if (isSuccess && error) {
      throw new Error('InvalidOperation: 成功的结果不能包含错误');
    }
    if (!isSuccess && !error) {
      throw new Error('InvalidOperation: 失败的结果必须包含错误信息');
    }

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this._error = error || null;
    this._value = value || null;

    Object.freeze(this);
  }

  public getValue(): T {
    if (!this.isSuccess || this._value === null) {
      throw new Error('不能从失败的结果中获取值');
    }
    return this._value;
  }

  public getErrorValue(): string {
    if (!this._error) {
      throw new Error('不能从成功的结果中获取错误');
    }
    return this._error;
  }

  get error(): string | null {
    return this._error;
  }

  public static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, null, value || null);
  }

  public static fail<U>(error: string): Result<U> {
    return new Result<U>(false, error);
  }

  public static combine(results: Result<any>[]): Result<any> {
    for (const result of results) {
      if (result.isFailure) {
        return Result.fail(result.error || '组合结果失败');
      }
    }
    return Result.ok();
  }
} 