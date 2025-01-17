import { Schema, model, Document, Model, Query, Types } from 'mongoose';
import { ProjectStateType } from '../../domain/value-objects/project-state';

// 审计变更记录类型
interface AuditChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  timestamp: Date;
  updatedBy: string;
}

// 项目设置类型
interface ProjectSettings {
  theme: string;
  style: string;
  duration: number;
  tempo?: number;
  key?: string;
}

// 项目元数据类型
interface ProjectMetadata {
  generationAttempts: number;
  lastGenerationTime?: Date;
  errorCount: number;
  lastError?: string;
}

// 审计信息类型
interface AuditInfo {
  createdBy: string;
  updatedBy: string;
  version: number;
  changes: AuditChange[];
}

// 基础项目接口
interface IProjectBase {
  projectId: string;
  userId: string;
  settings: ProjectSettings;
  state: ProjectStateType;
  lastAccessedAt: Date;
  metadata?: ProjectMetadata;
  audit: AuditInfo;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose 文档接口
export interface IMusicProject extends Document {
  projectId: string;
  userId: string;
  settings: ProjectSettings;
  state: ProjectStateType;
  lastAccessedAt: Date;
  metadata?: ProjectMetadata;
  audit: AuditInfo;
  createdAt: Date;
  updatedAt: Date;
  durationInMinutes: number;
  isEditable(): boolean;
}

// Mongoose 模型接口
interface IMusicProjectModel extends Model<IMusicProject> {
  findByUserAndState(userId: string, state?: ProjectStateType): Query<IMusicProject[], IMusicProject>;
  findExpired(expirationDays: number): Promise<IMusicProject[]>;
  updateLastAccessed(projectId: string): Promise<void>;
}

const musicProjectSchema = new Schema<IMusicProject>(
  {
    projectId: {
      type: String,
      required: [true, 'ID 是必需的'],
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: [true, '用户 ID 是必需的'],
      index: true,
      trim: true,
    },
    settings: {
      theme: {
        type: String,
        required: [true, '主题是必需的'],
        trim: true,
        minlength: [2, '主题至少需要 2 个字符'],
        maxlength: [100, '主题最多 100 个字符'],
      },
      style: {
        type: String,
        required: [true, '风格是必需的'],
        trim: true,
        minlength: [2, '风格至少需要 2 个字符'],
        maxlength: [50, '风格最多 50 个字符'],
      },
      duration: {
        type: Number,
        required: [true, '时长是必需的'],
        min: [1, '时长必须大于 0 秒'],
        max: [600, '时长不能超过 600 秒'],
      },
      tempo: {
        type: Number,
        min: [40, '速度必须大于等于 40 BPM'],
        max: [208, '速度必须小于等于 208 BPM'],
      },
      key: {
        type: String,
        enum: {
          values: ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'],
          message: '无效的调性',
        },
      },
    },
    state: {
      type: String,
      required: [true, '状态是必需的'],
      enum: {
        values: ['draft', 'generating', 'completed', 'failed'],
        message: '无效的状态',
      },
      default: 'draft',
      index: true,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    metadata: {
      generationAttempts: {
        type: Number,
        default: 0,
      },
      lastGenerationTime: Date,
      errorCount: {
        type: Number,
        default: 0,
      },
      lastError: String,
    },
    audit: {
      createdBy: {
        type: String,
        required: true,
      },
      updatedBy: {
        type: String,
        required: true,
      },
      version: {
        type: Number,
        default: 1,
      },
      changes: [{
        field: String,
        oldValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        updatedBy: String,
      }],
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: function(doc: IMusicProject, ret: Record<string, unknown>) {
        delete ret._id;
        return ret;
      },
    },
  }
);

// 复合索引
musicProjectSchema.index({ userId: 1, createdAt: -1 }, { name: 'user_projects' });
musicProjectSchema.index({ state: 1, createdAt: -1 }, { name: 'project_status' });
musicProjectSchema.index({ lastAccessedAt: 1 }, { 
  name: 'last_accessed',
  expireAfterSeconds: 30 * 24 * 60 * 60 // 30天后过期
});

// 预处理中间件
musicProjectSchema.pre<IMusicProject>('save', function(next) {
  if (this.isNew) {
    this.audit.createdBy = this.userId;
    this.audit.updatedBy = this.userId;
  } else {
    this.audit.version += 1;
    // 记录变更
    const modifiedPaths = this.modifiedPaths();
    if (modifiedPaths.length > 0) {
      const changes: AuditChange[] = modifiedPaths.map(path => ({
        field: path,
        oldValue: this.get(path),
        newValue: this.get(path),
        timestamp: new Date(),
        updatedBy: this.audit.updatedBy,
      }));
      this.audit.changes.push(...changes);
    }
  }
  next();
});

// 虚拟字段
musicProjectSchema.virtual('durationInMinutes').get(function(this: IMusicProject): number {
  return this.settings.duration / 60;
});

// 静态方法
musicProjectSchema.static('findByUserAndState', function(userId: string, state?: ProjectStateType) {
  const query = state ? { userId, state } : { userId };
  return this.find(query).sort({ createdAt: -1 });
});

musicProjectSchema.static('findExpired', function(expirationDays: number) {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() - expirationDays);
  return this.find({
    lastAccessedAt: { $lt: expirationDate },
    state: { $in: ['completed', 'failed'] }
  });
});

musicProjectSchema.static('updateLastAccessed', async function(projectId: string) {
  await this.updateOne(
    { projectId },
    { $set: { lastAccessedAt: new Date() } }
  );
});

// 实例方法
musicProjectSchema.method('isEditable', function(this: IMusicProject): boolean {
  return this.state === 'draft';
});

export const MusicProjectModel = model<IMusicProject, IMusicProjectModel>('MusicProject', musicProjectSchema); 