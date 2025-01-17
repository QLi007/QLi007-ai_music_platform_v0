import { User } from '../user';

export interface IUserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  exists(email: string): Promise<boolean>;
  delete(id: string): Promise<void>;
  update(user: User): Promise<void>;
  findAll(): Promise<User[]>;
  findByRole(role: string): Promise<User[]>;
} 