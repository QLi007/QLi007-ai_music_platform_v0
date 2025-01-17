import { Connection } from 'mongoose';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/user';
import { Email } from '../../domain/value-objects/email';
import { Password } from '../../domain/value-objects/password';
import { UserModel, IUser } from '../models/user.model';
import { Logger } from '../utils/logger';
import { CacheManager } from '../utils/cache-manager';
import { RepositoryUtils } from '../utils/repository-utils';
import { Document } from 'mongoose';

type UserDocument = Document<unknown, {}, IUser> & IUser;
type UserDocumentLean = IUser & { _id: string };

export class MongoDBUserRepository implements IUserRepository {
  private readonly logger = Logger.forContext('MongoDBUserRepository');
  private readonly cacheManager: CacheManager<User>;
  private readonly utils: RepositoryUtils;

  constructor(connection: Connection) {
    this.cacheManager = new CacheManager<User>({
      stdTTL: 300,
      checkperiod: 600,
      prefix: 'user',
    });
    this.utils = new RepositoryUtils(connection);
  }

  private async domainToDocument(user: User): Promise<UserDocument> {
    return new UserModel({
      _id: user.id,
      email: user.email,
      password: user.hashedPassword,
      username: user.username,
      roles: user.roles,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
    });
  }

  private async documentToDomain(doc: UserDocumentLean): Promise<User> {
    const emailOrError = Email.create(doc.email);
    if (emailOrError.isFailure) {
      throw new Error(`无效的邮箱: ${doc.email}`);
    }

    const passwordOrError = Password.create(doc.password, true);
    if (passwordOrError.isFailure) {
      throw new Error('无效的密码');
    }

    const userOrError = await User.create(
      {
        email: doc.email,
        password: doc.password,
        username: doc.username,
        roles: doc.roles,
      },
      doc._id.toString()
    );

    if (userOrError.isFailure) {
      throw new Error(`无法创建用户: ${userOrError.error}`);
    }

    const user = userOrError.getValue();
    if (!doc.isActive) {
      user.deactivate();
    }
    if (doc.lastLoginAt) {
      user.updateLastLogin();
    }

    return user;
  }

  async save(user: User): Promise<void> {
    try {
      await this.utils.withTransaction(async (session) => {
        const doc = await this.domainToDocument(user);
        await doc.save({ session });
        this.cacheManager.set(user.id, user);
      });
    } catch (error) {
      this.logger.error('保存用户失败', error as Error, { userId: user.id });
      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const cached = this.cacheManager.get<User>(id);
      if (cached) {
        return cached;
      }

      const doc = await UserModel
        .findById(id)
        .lean<UserDocumentLean>();

      if (!doc) {
        return null;
      }

      const user = await this.documentToDomain(doc);
      this.cacheManager.set(id, user);
      return user;
    } catch (error) {
      this.logger.error('查找用户失败', error as Error, { userId: id });
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const doc = await UserModel
        .findOne({ email })
        .lean<UserDocumentLean>();

      if (!doc) {
        return null;
      }

      return this.documentToDomain(doc);
    } catch (error) {
      this.logger.error('通过邮箱查找用户失败', error as Error, { email });
      throw error;
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      const doc = await UserModel
        .findOne({ username })
        .lean<UserDocumentLean>();

      if (!doc) {
        return null;
      }

      return this.documentToDomain(doc);
    } catch (error) {
      this.logger.error('通过用户名查找用户失败', error as Error, { username });
      throw error;
    }
  }

  async exists(email: string): Promise<boolean> {
    try {
      const doc = await UserModel
        .findOne({ email })
        .select('_id')
        .lean();
      return doc !== null;
    } catch (error) {
      this.logger.error('检查用户是否存在失败', error as Error, { email });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.utils.withTransaction(async (session) => {
        await UserModel.findByIdAndDelete(id, { session });
        this.cacheManager.delete(id);
      });
    } catch (error) {
      this.logger.error('删除用户失败', error as Error, { userId: id });
      throw error;
    }
  }

  async update(user: User): Promise<void> {
    try {
      await this.utils.withTransaction(async (session) => {
        const doc = await this.domainToDocument(user);
        await doc.save({ session });
        this.cacheManager.set(user.id, user);
      });
    } catch (error) {
      this.logger.error('更新用户失败', error as Error, { userId: user.id });
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const docs = await UserModel
        .find()
        .lean<UserDocumentLean[]>();

      return Promise.all(docs.map(doc => this.documentToDomain(doc)));
    } catch (error) {
      this.logger.error('查找所有用户失败', error as Error);
      throw error;
    }
  }

  async findByRole(role: string): Promise<User[]> {
    try {
      const docs = await UserModel
        .find({ roles: role })
        .lean<UserDocumentLean[]>();

      return Promise.all(docs.map(doc => this.documentToDomain(doc)));
    } catch (error) {
      this.logger.error('通过角色查找用户失败', error as Error, { role });
      throw error;
    }
  }
} 