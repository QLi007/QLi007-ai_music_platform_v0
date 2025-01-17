import { ValueObject } from '../../../../core/domain/value-object';
import { Result } from '../common/result';

interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {
  private static readonly EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  private constructor(props: EmailProps) {
    super(props);
  }

  public static create(email: string): Result<Email> {
    if (!email) {
      return Result.fail('邮箱不能为空');
    }

    if (!this.isValidEmail(email)) {
      return Result.fail('邮箱格式无效');
    }

    return Result.ok(new Email({ value: email.toLowerCase() }));
  }

  private static isValidEmail(email: string): boolean {
    return this.EMAIL_REGEX.test(email);
  }

  get value(): string {
    return this.props.value;
  }
} 