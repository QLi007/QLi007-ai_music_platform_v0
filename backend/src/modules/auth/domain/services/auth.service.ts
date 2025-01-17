import { Result } from '../common/result';
import { User } from '../user';

export interface TokenPayload {
  userId: string;
  email: string;
  roles: string[];
}

export interface IAuthService {
  generateToken(user: User): Promise<Result<string>>;
  verifyToken(token: string): Promise<Result<TokenPayload>>;
  refreshToken(token: string): Promise<Result<string>>;
} 