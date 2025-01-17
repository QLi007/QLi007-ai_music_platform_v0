import { Router } from 'express';
import { Connection } from 'mongoose';
import { AuthController } from './controllers/auth.controller';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { JwtAuthService } from '../infrastructure/services/jwt-auth.service';
import { NodemailerEmailService } from '../infrastructure/services/nodemailer-email.service';
import { MongoDBUserRepository } from '../infrastructure/repositories/mongodb-user.repository';
import { EmailConfig } from '../infrastructure/services/nodemailer-email.service';
import { UserRole } from '../domain/user';

export interface AuthModuleConfig {
  jwtSecret: string;
  jwtExpiration: number;
  email: EmailConfig;
  connection: Connection;
}

export class AuthModule {
  private readonly router: Router;
  private readonly controller: AuthController;
  private readonly middleware: AuthMiddleware;

  constructor(config: AuthModuleConfig) {
    // 初始化服务
    const authService = new JwtAuthService(
      config.jwtSecret,
      config.jwtExpiration
    );
    const emailService = new NodemailerEmailService(config.email);
    const userRepository = new MongoDBUserRepository(config.connection);

    // 初始化控制器和中间件
    this.controller = new AuthController(
      userRepository,
      authService,
      emailService
    );
    this.middleware = new AuthMiddleware(authService, userRepository);

    // 初始化路由
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // 公开路由
    this.router.post('/register', this.controller.register.bind(this.controller));
    this.router.post('/login', this.controller.login.bind(this.controller));
    this.router.post('/refresh-token', this.controller.refreshToken.bind(this.controller));
    this.router.post('/forgot-password', this.controller.forgotPassword.bind(this.controller));
    this.router.post('/reset-password', this.controller.resetPassword.bind(this.controller));

    // 受保护的路由示例
    this.router.get(
      '/profile',
      this.middleware.authenticate,
      (req, res) => {
        res.json({ user: req.user });
      }
    );

    // 需要管理员权限的路由示例
    this.router.get(
      '/admin',
      this.middleware.authenticate,
      this.middleware.authorize([UserRole.ADMIN]),
      (req, res) => {
        res.json({ message: '管理员访问成功' });
      }
    );
  }

  public getRouter(): Router {
    return this.router;
  }

  public getMiddleware(): AuthMiddleware {
    return this.middleware;
  }
} 