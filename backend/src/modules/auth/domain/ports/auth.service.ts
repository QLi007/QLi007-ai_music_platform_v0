import { Result } from '@core/domain/result';
import { User } from '../user';

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  username: string;
}

export interface TokenDTO {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface IAuthService {
  register(data: RegisterDTO): Promise<Result<User>>;
  login(data: LoginDTO): Promise<Result<TokenDTO>>;
  refreshToken(token: string): Promise<Result<TokenDTO>>;
  validateToken(token: string): Promise<Result<User>>;
  changePassword(userId: string, oldPassword: string, newPassword: string): Promise<Result<void>>;
  resetPassword(email: string): Promise<Result<void>>;
  confirmResetPassword(token: string, newPassword: string): Promise<Result<void>>;
} 