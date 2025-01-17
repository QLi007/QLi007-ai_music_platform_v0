import { Result } from '@core/domain/common/result';
import { Entity } from '@core/domain/common/entity';
import { ProjectSettings } from './value-objects/project-settings';
import { ProjectState, ProjectStateType } from './value-objects/project-state';

interface MusicProjectProps {
  userId: string;
  settings: ProjectSettings;
  state: ProjectState;
  lastAccessedAt: Date;
}

export class MusicProject extends Entity<MusicProjectProps> {
  private constructor(id: string, props: MusicProjectProps) {
    super(id, props);
  }

  public static create(
    id: string,
    userId: string,
    settings: ProjectSettings
  ): Result<MusicProject> {
    if (!id) {
      return Result.fail<MusicProject>('项目ID不能为空');
    }

    if (!userId) {
      return Result.fail<MusicProject>('用户ID不能为空');
    }

    const stateResult = ProjectState.create('draft');
    if (stateResult.isFailure) {
      return Result.fail<MusicProject>(`无法创建初始状态: ${stateResult.error}`);
    }

    return Result.ok<MusicProject>(
      new MusicProject(id, {
        userId,
        settings,
        state: stateResult.getValue(),
        lastAccessedAt: new Date(),
      })
    );
  }

  get userId(): string {
    return this.props.userId;
  }

  get settings(): ProjectSettings {
    return this.props.settings;
  }

  get state(): ProjectState {
    return this.props.state;
  }

  get lastAccessedAt(): Date {
    return this.props.lastAccessedAt;
  }

  public updateSettings(settings: ProjectSettings): Result<void> {
    if (this.state.value !== 'draft') {
      return Result.fail<void>('只能在草稿状态下更新设置');
    }

    this.props.settings = settings;
    return Result.ok<void>();
  }

  public updateState(newState: ProjectStateType): Result<void> {
    const stateResult = ProjectState.create(newState);
    if (stateResult.isFailure) {
      return Result.fail<void>(`无效的状态: ${stateResult.error}`);
    }

    const newStateObj = stateResult.getValue();
    if (!this.state.canTransitionTo(newStateObj.value)) {
      return Result.fail<void>('无效的状态转换');
    }

    this.props.state = newStateObj;
    return Result.ok<void>();
  }

  public updateLastAccessed(): void {
    this.props.lastAccessedAt = new Date();
  }

  public getId(): string {
    return this.id;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getSettings(): ProjectSettings {
    return this.settings;
  }

  public getState(): ProjectState {
    return this.state;
  }

  public getLastAccessedAt(): Date {
    return this.lastAccessedAt;
  }
} 