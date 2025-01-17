import { Request, Response, NextFunction } from 'express';
import { IAuthService } from '../../domain/services/auth.service';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { Logger } from '../../infrastructure/utils/logger';
import { UserRole } from '../../domain/user';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        roles: UserRole[];
      };
    }
  }
}

export class AuthMiddleware {
  private readonly logger = Logger.forContext('AuthMiddleware');

  constructor(
    private readonly authService: IAuthService,
    private readonly userRepository: IUserRepository,
  ) {}

  public authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(401).json({ message: '未提供认证 token' });
        return;
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        res.status(401).json({ message: '无效的认证 token 格式' });
        return;
      }

      const payloadOrError = await this.authService.verifyToken(token);
      if (payloadOrError.isFailure) {
        res.status(401).json({ message: payloadOrError.error });
        return;
      }

      const payload = payloadOrError.getValue();
      const user = await this.userRepository.findById(payload.userId);

      if (!user) {
        res.status(401).json({ message: '用户不存在' });
        return;
      }

      if (!user.isActive) {
        res.status(401).json({ message: '账号已被禁用' });
        return;
      }

      req.user = {
        id: user.id,
        email: user.email,
        username: user.username,
        roles: user.roles,
      };

      next();
    } catch (error) {
      this.logger.error('认证失败', error as Error);
      res.status(500).json({ message: '认证失败' });
    }
  };

  public authorize = (roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        if (!req.user) {
          res.status(401).json({ message: '未认证的请求' });
          return;
        }

        const hasRole = roles.some(role => req.user!.roles.includes(role));
        if (!hasRole) {
          res.status(403).json({ message: '没有访问权限' });
          return;
        }

        next();
      } catch (error) {
        this.logger.error('授权失败', error as Error);
        res.status(500).json({ message: '授权失败' });
      }
    };
  };
} 