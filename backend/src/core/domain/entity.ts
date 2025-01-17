/**
 * 实体基类
 */
export abstract class Entity<T> {
  protected readonly _id: string;
  protected readonly props: T;

  constructor(props: T, id?: string) {
    this._id = id || this.generateId();
    this.props = props;
  }

  private generateId(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${randomStr}`;
  }

  public equals(entity?: Entity<T>): boolean {
    if (entity === null || entity === undefined) {
      return false;
    }

    if (this === entity) {
      return true;
    }

    return this._id === entity._id;
  }

  get id(): string {
    return this._id;
  }
} 