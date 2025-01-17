import * as jwt from 'jsonwebtoken';
import { IAuthService, TokenPayload } from '../../domain/services/auth.service';
import { User } from '../../domain/user';
import { Result } from '../../domain/common/result';
import { Logger } from '../utils/logger';

export class JwtAuthService implements IAuthService {
  private readonly logger = Logger.forContext('JwtAuthService');

  constructor(
    private readonly secret: string,
    private readonly expiresIn: number = 3600 // 默认 1 小时
  ) {}

  public async generateToken(user: User): Promise<Result<string>> {
    try {
      const payload: TokenPayload = {
        userId: user.id,
        email: user.email,
        roles: user.roles,
      };

      const token = jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
      return Result.ok(token);
    } catch (error) {
      this.logger.error('生成 token 失败', error as Error);
      return Result.fail('生成 token 失败');
    }
  }

  public async verifyToken(token: string): Promise<Result<TokenPayload>> {
    try {
      const payload = jwt.verify(token, this.secret) as TokenPayload;
      return Result.ok(payload);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return Result.fail('token 已过期');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return Result.fail('无效的 token');
      }
      this.logger.error('验证 token 失败', error as Error);
      return Result.fail('验证 token 失败');
    }
  }

  public async refreshToken(token: string): Promise<Result<string>> {
    try {
      const payloadOrError = await this.verifyToken(token);
      if (payloadOrError.isFailure) {
        return Result.fail(payloadOrError.error || '无效的 token');
      }

      const payload = payloadOrError.getValue();
      const newToken = jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
      return Result.ok(newToken);
    } catch (error) {
      this.logger.error('刷新 token 失败', error as Error);
      return Result.fail('刷新 token 失败');
    }
  }
} 