import * as nodemailer from 'nodemailer';
import { IEmailService } from '../../domain/services/email.service';
import { Result } from '../../domain/common/result';
import { Logger } from '../utils/logger';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
  baseUrl: string;
}

export class NodemailerEmailService implements IEmailService {
  private readonly transporter: nodemailer.Transporter;
  private readonly logger = Logger.forContext('NodemailerEmailService');

  constructor(private readonly config: EmailConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
    });
  }

  public async sendVerificationEmail(email: string, token: string): Promise<Result<void>> {
    try {
      const verificationLink = `${this.config.baseUrl}/auth/verify-email?token=${token}`;
      const mailOptions = {
        from: this.config.from,
        to: email,
        subject: '验证您的邮箱',
        html: `
          <h1>欢迎注册</h1>
          <p>请点击以下链接验证您的邮箱：</p>
          <a href="${verificationLink}">${verificationLink}</a>
          <p>如果您没有注册账号，请忽略此邮件。</p>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return Result.ok();
    } catch (error) {
      this.logger.error('发送验证邮件失败', error as Error, { email });
      return Result.fail('发送验证邮件失败');
    }
  }

  public async sendPasswordResetEmail(email: string, token: string): Promise<Result<void>> {
    try {
      const resetLink = `${this.config.baseUrl}/auth/reset-password?token=${token}`;
      const mailOptions = {
        from: this.config.from,
        to: email,
        subject: '重置密码',
        html: `
          <h1>重置密码</h1>
          <p>您收到此邮件是因为您（或其他人）请求重置密码。</p>
          <p>请点击以下链接重置密码：</p>
          <a href="${resetLink}">${resetLink}</a>
          <p>如果您没有请求重置密码，请忽略此邮件。</p>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return Result.ok();
    } catch (error) {
      this.logger.error('发送重置密码邮件失败', error as Error, { email });
      return Result.fail('发送重置密码邮件失败');
    }
  }
} 