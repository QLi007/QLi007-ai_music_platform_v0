import { IMusicProjectRepository } from '../../domain/ports/music-project.repository';
import { MusicProject } from '../../domain/music-project';
import { ProjectSettings } from '../../domain/value-objects/project-settings';
import { ProjectState } from '../../domain/value-objects/project-state';
import { Monitor } from '../decorators/monitor.decorator';
import { Logger } from '../utils/logger';
import { CacheManager } from '../utils/cache.manager';
import { RepositoryUtils } from '../utils/repository.utils';
import mongoose, { ClientSession } from 'mongoose';
import { MusicProjectModel, IMusicProject } from '../schemas/music-project.schema';

type ProjectDocument = mongoose.Document<unknown, {}, IMusicProject> & IMusicProject;
type ProjectDocumentLean = mongoose.FlattenMaps<ProjectDocument> & { _id: mongoose.Types.ObjectId };

export class MongoDBMusicProjectRepository implements IMusicProjectRepository {
  private readonly cacheManager: CacheManager;
  private readonly logger: Logger;

  constructor() {
    this.cacheManager = new CacheManager({
      stdTTL: 300, // 5分钟
      checkperiod: 60, // 1分钟检查一次
      prefix: 'music-project:'
    });
    this.logger = Logger.forContext('MongoDBMusicProjectRepository');
  }

  @Monitor({
    name: 'MongoDBMusicProjectRepository.save',
    logArgs: true,
    logResult: false
  })
  async save(project: MusicProject): Promise<void> {
    try {
      await RepositoryUtils.withTransaction(async (session) => {
        const doc = await this.domainToDocument(project);
        await doc.save({ session });
        this.cacheManager.set(project.getId(), project);
      });
    } catch (error) {
      this.handleError(error, { operation: 'save', projectId: project.getId() });
    }
  }

  @Monitor({
    name: 'MongoDBMusicProjectRepository.findById',
    logArgs: true,
    logResult: true
  })
  async findById(id: string): Promise<MusicProject | null> {
    try {
      // 先从缓存获取
      const cached = this.cacheManager.get<MusicProject>(id);
      if (cached) {
        return cached;
      }

      const doc = await MusicProjectModel
        .findById(id)
        .select('-audit.changes')
        .lean<ProjectDocumentLean>();

      if (!doc) {
        return null;
      }

      const project = await this.documentToDomain(doc);
      this.cacheManager.set(id, project);
      return project;
    } catch (error) {
      this.handleError(error, { operation: 'findById', projectId: id });
    }
  }

  @Monitor({
    name: 'MongoDBMusicProjectRepository.findAll',
    logResult: true
  })
  async findAll(): Promise<MusicProject[]> {
    try {
      const docs = await MusicProjectModel
        .find()
        .select('-audit.changes')
        .lean<ProjectDocumentLean[]>();

      return Promise.all(docs.map(doc => this.documentToDomain(doc)));
    } catch (error) {
      this.handleError(error, { operation: 'findAll' });
    }
  }

  @Monitor({
    name: 'MongoDBMusicProjectRepository.delete',
    logArgs: true
  })
  async delete(id: string): Promise<void> {
    try {
    await RepositoryUtils.withTransaction(async (session) => {
        await MusicProjectModel.findByIdAndDelete(id, { session });
        this.cacheManager.delete(id);
      });
    } catch (error) {
      this.handleError(error, { operation: 'delete', projectId: id });
    }
  }

  @Monitor({
    name: 'MongoDBMusicProjectRepository.update',
    logArgs: true
  })
  async update(project: MusicProject): Promise<void> {
    try {
      await RepositoryUtils.withTransaction(async (session) => {
        const doc = await this.domainToDocument(project);
        await doc.save({ session });
        this.cacheManager.set(project.getId(), project);
      });
    } catch (error) {
      this.handleError(error, { operation: 'update', projectId: project.getId() });
    }
  }

  @Monitor({
    name: 'MongoDBMusicProjectRepository.findByUserId',
    logArgs: true,
    logResult: true
  })
  async findByUserId(userId: string): Promise<MusicProject[]> {
    try {
      const docs = await MusicProjectModel
        .findByUserAndState(userId)
        .select('-audit.changes')
        .lean<ProjectDocumentLean[]>();

      return Promise.all(docs.map(doc => this.documentToDomain(doc)));
    } catch (error) {
      this.handleError(error, { operation: 'findByUserId', userId });
    }
  }

  @Monitor({
    name: 'MongoDBMusicProjectRepository.exists',
    logArgs: true,
    logResult: true
  })
  async exists(id: string): Promise<boolean> {
    try {
      // 先检查缓存
      if (this.cacheManager.has(id)) {
        return true;
      }

      const doc = await MusicProjectModel.findById(id).select('_id').lean();
      return doc !== null;
    } catch (error) {
      this.handleError(error, { operation: 'exists', projectId: id });
    }
  }

  private async domainToDocument(project: MusicProject): Promise<ProjectDocument> {
    return new MusicProjectModel({
      _id: project.getId(),
      userId: project.getUserId(),
      settings: project.getSettings(),
      state: project.getState().getValue(),
      lastAccessedAt: project.getLastAccessedAt()
    });
  }

  private async documentToDomain(doc: ProjectDocumentLean): Promise<MusicProject> {
    const settings = ProjectSettings.create({
      theme: doc.settings.theme,
      style: doc.settings.style,
      duration: doc.settings.duration,
      tempo: doc.settings.tempo,
      key: doc.settings.key
    });

    const state = ProjectState.create(doc.state);

    return MusicProject.create(
      doc._id.toString(),
      doc.userId,
      settings.getValue()
    ).getValue();
  }

  private handleError(error: unknown, context?: { operation?: string; projectId?: string; userId?: string }): never {
    this.logger.error('仓储操作失败', error as Error, context);
    throw error;
  }
} 