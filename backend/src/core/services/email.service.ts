import nodemailer from 'nodemailer';
import { Logger } from '../utils/logger';
import config from '../../config/config';
import { ServiceUnavailableError } from '../error/app-error';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private static instance: EmailService;
  private transporter: nodemailer.Transporter;
  private readonly logger: Logger;

  private constructor() {
    this.logger = new Logger('EmailService');
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.pass
      }
    });
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  public async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      this.logger.info('邮件服务连接成功');
    } catch (error) {
      this.logger.error('邮件服务连接失败', { error });
      throw new ServiceUnavailableError('邮件服务不可用');
    }
  }

  public async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const { to, subject, html } = options;
      
      await this.transporter.sendMail({
        from: `"AI Music Platform" <${config.email.user}>`,
        to,
        subject,
        html
      });

      this.logger.info('邮件发送成功', { to, subject });
    } catch (error) {
      this.logger.error('邮件发送失败', { error, options });
      throw new ServiceUnavailableError('邮件发送失败');
    }
  }

  public async sendVerificationEmail(to: string, token: string): Promise<void> {
    const verificationUrl = `${config.server.baseUrl}/api/auth/verify-email?token=${token}`;
    const html = `
      <h1>欢迎使用 AI Music Platform</h1>
      <p>请点击下面的链接验证您的邮箱：</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>如果您没有注册账号，请忽略此邮件。</p>
      <p>此链接将在24小时后失效。</p>
    `;

    await this.sendEmail({
      to,
      subject: '验证您的邮箱',
      html
    });
  }

  public async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetUrl = `${config.server.baseUrl}/api/auth/reset-password?token=${token}`;
    const html = `
      <h1>重置密码</h1>
      <p>您收到此邮件是因为您（或其他人）请求重置密码。</p>
      <p>请点击下面的链接重置密码：</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>如果您没有请求重置密码，请忽略此邮件。</p>
      <p>此链接将在1小时后失效。</p>
    `;

    await this.sendEmail({
      to,
      subject: '重置密码',
      html
    });
  }

  public async sendWelcomeEmail(to: string, username: string): Promise<void> {
    const html = `
      <h1>欢迎加入 AI Music Platform</h1>
      <p>亲爱的 ${username}，</p>
      <p>感谢您注册 AI Music Platform！我们很高兴您能加入我们。</p>
      <p>在这里，您可以：</p>
      <ul>
        <li>使用AI生成音乐</li>
        <li>编辑和混音</li>
        <li>分享您的作品</li>
        <li>与其他音乐爱好者交流</li>
      </ul>
      <p>如果您有任何问题，请随时联系我们的支持团队。</p>
      <p>祝您使用愉快！</p>
    `;

    await this.sendEmail({
      to,
      subject: '欢迎加入 AI Music Platform',
      html
    });
  }
} 