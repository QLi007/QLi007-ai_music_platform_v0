import { Result } from '../common/result';

export interface IEmailService {
  sendVerificationEmail(email: string, token: string): Promise<Result<void>>;
  sendPasswordResetEmail(email: string, token: string): Promise<Result<void>>;
} 