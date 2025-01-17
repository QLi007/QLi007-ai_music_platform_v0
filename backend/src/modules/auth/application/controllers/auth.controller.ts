import { Request, Response } from 'express';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { IAuthService } from '../../domain/services/auth.service';
import { IEmailService } from '../../domain/services/email.service';
import { User, UserRole } from '../../domain/user';
import { Email } from '../../domain/value-objects/email';
import { Password } from '../../domain/value-objects/password';
import { Logger } from '../../infrastructure/utils/logger';

export class AuthController {
  private readonly logger = Logger.forContext('AuthController');

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authService: IAuthService,
    private readonly emailService: IEmailService,
  ) {}

  public async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, username } = req.body;

      // 检查用户是否已存在
      const exists = await this.userRepository.exists(email);
      if (exists) {
        res.status(400).json({ message: '邮箱已被注册' });
        return;
      }

      // 创建用户
      const userOrError = await User.create({
        email,
        password,
        username,
        roles: [UserRole.USER],
      });

      if (userOrError.isFailure) {
        res.status(400).json({ message: userOrError.error });
        return;
      }

      const user = userOrError.getValue();

      // 保存用户
      await this.userRepository.save(user);

      // 生成验证 token
      const tokenOrError = await this.authService.generateToken(user);
      if (tokenOrError.isFailure) {
        res.status(500).json({ message: '生成 token 失败' });
        return;
      }

      // 发送验证邮件
      const emailResult = await this.emailService.sendVerificationEmail(
        user.email,
        tokenOrError.getValue()
      );

      if (emailResult.isFailure) {
        this.logger.warn('发送验证邮件失败', { userId: user.id });
      }

      res.status(201).json({
        message: '注册成功',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          roles: user.roles,
        },
      });
    } catch (error) {
      this.logger.error('注册失败', error as Error);
      res.status(500).json({ message: '注册失败' });
    }
  }

  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // 查找用户
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        res.status(401).json({ message: '邮箱或密码错误' });
        return;
      }

      // 验证密码
      const isValid = await user.comparePassword(password);
      if (!isValid) {
        res.status(401).json({ message: '邮箱或密码错误' });
        return;
      }

      // 检查用户状态
      if (!user.isActive) {
        res.status(401).json({ message: '账号已被禁用' });
        return;
      }

      // 更新最后登录时间
      user.updateLastLogin();
      await this.userRepository.update(user);

      // 生成 token
      const tokenOrError = await this.authService.generateToken(user);
      if (tokenOrError.isFailure) {
        res.status(500).json({ message: '生成 token 失败' });
        return;
      }

      res.json({
        token: tokenOrError.getValue(),
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          roles: user.roles,
        },
      });
    } catch (error) {
      this.logger.error('登录失败', error as Error);
      res.status(500).json({ message: '登录失败' });
    }
  }

  public async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;

      const newTokenOrError = await this.authService.refreshToken(token);
      if (newTokenOrError.isFailure) {
        res.status(401).json({ message: newTokenOrError.error });
        return;
      }

      res.json({ token: newTokenOrError.getValue() });
    } catch (error) {
      this.logger.error('刷新 token 失败', error as Error);
      res.status(500).json({ message: '刷新 token 失败' });
    }
  }

  public async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      // 查找用户
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        res.status(404).json({ message: '用户不存在' });
        return;
      }

      // 生成重置 token
      const tokenOrError = await this.authService.generateToken(user);
      if (tokenOrError.isFailure) {
        res.status(500).json({ message: '生成 token 失败' });
        return;
      }

      // 发送重置密码邮件
      const emailResult = await this.emailService.sendPasswordResetEmail(
        user.email,
        tokenOrError.getValue()
      );

      if (emailResult.isFailure) {
        res.status(500).json({ message: '发送重置密码邮件失败' });
        return;
      }

      res.json({ message: '重置密码邮件已发送' });
    } catch (error) {
      this.logger.error('忘记密码处理失败', error as Error);
      res.status(500).json({ message: '处理失败' });
    }
  }

  public async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password, oldPassword } = req.body;

      // 验证 token
      const payloadOrError = await this.authService.verifyToken(token);
      if (payloadOrError.isFailure) {
        res.status(401).json({ message: '无效的 token' });
        return;
      }

      const payload = payloadOrError.getValue();

      // 查找用户
      const user = await this.userRepository.findById(payload.userId);
      if (!user) {
        res.status(404).json({ message: '用户不存在' });
        return;
      }

      // 更新密码
      const changePasswordResult = await user.changePassword(oldPassword, password);
      if (changePasswordResult.isFailure) {
        res.status(400).json({ message: changePasswordResult.error });
        return;
      }

      await this.userRepository.update(user);

      res.json({ message: '密码重置成功' });
    } catch (error) {
      this.logger.error('重置密码失败', error as Error);
      res.status(500).json({ message: '重置密码失败' });
    }
  }
} 