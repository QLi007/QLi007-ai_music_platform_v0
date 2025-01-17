export class Result<T> {
  private readonly _isSuccess: boolean;
  private readonly _error: string | null;
  private readonly _value: T | null;

  private constructor(isSuccess: boolean, error?: string | null, value?: T) {
    if (isSuccess && error) {
      throw new Error('成功的结果不能包含错误');
    }
    if (!isSuccess && !error) {
      throw new Error('失败的结果必须包含错误信息');
    }

    this._isSuccess = isSuccess;
    this._error = error || null;
    this._value = value || null;
  }

  public static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, null, value);
  }

  public static fail<U>(error: string): Result<U> {
    return new Result<U>(false, error);
  }

  public static combine(results: Result<any>[]): Result<void> {
    for (const result of results) {
      if (result.isFailure) {
        return Result.fail(result.error || '未知错误');
      }
    }
    return Result.ok();
  }

  get isSuccess(): boolean {
    return this._isSuccess;
  }

  get isFailure(): boolean {
    return !this._isSuccess;
  }

  get error(): string | null {
    return this._error;
  }

  public getValue(): T {
    if (!this._isSuccess || this._value === null) {
      throw new Error('不能从失败的结果中获取值');
    }
    return this._value;
  }
} 