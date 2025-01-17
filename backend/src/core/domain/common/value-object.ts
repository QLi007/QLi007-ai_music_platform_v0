interface ValueObjectProps {
  [index: string]: any;
}

/**
 * 值对象基类
 * 值对象是通过其属性值来标识的对象
 * 两个值对象如果属性值相同，则认为它们相等
 */
export abstract class ValueObject<T extends ValueObjectProps> {
  protected readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze(props);
  }

  public equals(vo?: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    if (vo.props === undefined) {
      return false;
    }
    return JSON.stringify(this.props) === JSON.stringify(vo.props);
  }
} 