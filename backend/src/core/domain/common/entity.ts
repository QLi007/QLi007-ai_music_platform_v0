/**
 * 领域实体基类
 */
export abstract class Entity<T> {
  protected readonly id: string;
  protected props: T;

  constructor(id: string, props: T) {
    this.id = id;
    this.props = props;
  }

  public equals(object?: Entity<T>): boolean {
    if (object == null || object == undefined) {
      return false;
    }

    if (this === object) {
      return true;
    }

    if (!(object instanceof Entity)) {
      return false;
    }

    return this.id === object.id;
  }
} 