import { Entity } from '../../../core/domain/entity';
import { Result } from './common/result';
import { Email } from './value-objects/email';
import { Password } from './value-objects/password';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

interface UserProps {
  email: Email;
  password: Password;
  username: string;
  roles: UserRole[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class User extends Entity<UserProps> {
  private constructor(props: UserProps, id?: string) {
    super(props, id);
  }

  public static async create(
    props: {
      email: string;
      password: string;
      username: string;
      roles?: UserRole[];
    },
    id?: string
  ): Promise<Result<User>> {
    // 验证邮箱
    const emailOrError = Email.create(props.email);
    if (emailOrError.isFailure) {
      return Result.fail(emailOrError.error || '无效的邮箱');
    }

    // 验证用户名
    if (!props.username || props.username.length < 2) {
      return Result.fail('用户名至少需要2个字符');
    }

    // 创建加密密码
    const passwordOrError = await Password.createHashed(props.password);
    if (passwordOrError.isFailure) {
      return Result.fail(passwordOrError.error || '无效的密码');
    }

    const now = new Date();
    return Result.ok(new User({
      email: emailOrError.getValue(),
      password: passwordOrError.getValue(),
      username: props.username,
      roles: props.roles || [UserRole.USER],
      isActive: true,
      createdAt: now,
      updatedAt: now
    }, id));
  }

  public async comparePassword(plainTextPassword: string): Promise<boolean> {
    return await this.props.password.comparePassword(plainTextPassword);
  }

  public async changePassword(oldPassword: string, newPassword: string): Promise<Result<void>> {
    // 验证旧密码
    const isValid = await this.comparePassword(oldPassword);
    if (!isValid) {
      return Result.fail('旧密码不正确');
    }

    // 创建新密码
    const passwordOrError = await Password.createHashed(newPassword);
    if (passwordOrError.isFailure) {
      return Result.fail(passwordOrError.error || '无效的密码');
    }

    this.props.password = passwordOrError.getValue();
    this.props.updatedAt = new Date();
    return Result.ok();
  }

  public deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  public activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  public updateLastLogin(): void {
    this.props.lastLoginAt = new Date();
    this.props.updatedAt = new Date();
  }

  public hasRole(role: UserRole): boolean {
    return this.props.roles.includes(role);
  }

  public addRole(role: UserRole): void {
    if (!this.hasRole(role)) {
      this.props.roles.push(role);
      this.props.updatedAt = new Date();
    }
  }

  public removeRole(role: UserRole): void {
    if (role === UserRole.USER) {
      throw new Error('不能移除基本用户角色');
    }
    this.props.roles = this.props.roles.filter(r => r !== role);
    this.props.updatedAt = new Date();
  }

  get email(): string {
    return this.props.email.value;
  }

  get hashedPassword(): string {
    return this.props.password.value;
  }

  get username(): string {
    return this.props.username;
  }

  get roles(): UserRole[] {
    return [...this.props.roles];
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get lastLoginAt(): Date | undefined {
    return this.props.lastLoginAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
} 