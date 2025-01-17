import { ValueObject } from '../../../../core/domain/value-object';
import { Result } from '../common/result';
import * as bcrypt from 'bcrypt';

interface PasswordProps {
  value: string;
  hashed: boolean;
}

export class Password extends ValueObject<PasswordProps> {
  private static readonly SALT_ROUNDS = 10;
  private static readonly MIN_LENGTH = 8;
  private static readonly REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  private constructor(props: PasswordProps) {
    super(props);
  }

  public static create(password: string, hashed: boolean = false): Result<Password> {
    if (!password) {
      return Result.fail('密码不能为空');
    }

    if (!hashed && !this.isValidPassword(password)) {
      return Result.fail(
        '密码必须至少包含8个字符，包括大小写字母、数字和特殊字符'
      );
    }

    return Result.ok(new Password({ value: password, hashed }));
  }

  public static async createHashed(password: string): Promise<Result<Password>> {
    const passwordOrError = this.create(password);
    if (passwordOrError.isFailure) {
      return Result.fail(passwordOrError.error || '无效的密码');
    }

    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);
    return Result.ok(new Password({ value: hashedPassword, hashed: true }));
  }

  private static isValidPassword(password: string): boolean {
    if (password.length < this.MIN_LENGTH) {
      return false;
    }

    return this.REGEX.test(password);
  }

  public async comparePassword(plainTextPassword: string): Promise<boolean> {
    if (!this.props.hashed) {
      return this.props.value === plainTextPassword;
    }

    return await bcrypt.compare(plainTextPassword, this.props.value);
  }

  get value(): string {
    return this.props.value;
  }

  get isHashed(): boolean {
    return this.props.hashed;
  }
} 