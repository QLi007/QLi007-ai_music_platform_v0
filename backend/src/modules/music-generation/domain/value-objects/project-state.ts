import { Result } from '@core/domain/common/result';
import { ValueObject } from '@core/domain/common/value-object';

export type ProjectStateType = 'draft' | 'generating' | 'completed' | 'failed';

interface ProjectStateProps {
  value: ProjectStateType;
}

export class ProjectState extends ValueObject<ProjectStateProps> {
  private constructor(props: ProjectStateProps) {
    super(props);
  }

  get value(): ProjectStateType {
    return this.props.value;
  }

  public getValue(): ProjectStateType {
    return this.value;
  }

  public static create(value: ProjectStateType): Result<ProjectState> {
    const validStates: ProjectStateType[] = ['draft', 'generating', 'completed', 'failed'];
    
    if (!validStates.includes(value)) {
      return Result.fail<ProjectState>('无效的项目状态');
    }

    return Result.ok<ProjectState>(new ProjectState({ value }));
  }

  public isDraft(): boolean {
    return this.value === 'draft';
  }

  public isGenerating(): boolean {
    return this.value === 'generating';
  }

  public isCompleted(): boolean {
    return this.value === 'completed';
  }

  public isFailed(): boolean {
    return this.value === 'failed';
  }

  public canTransitionTo(newState: ProjectStateType): boolean {
    switch (this.value) {
      case 'draft':
        return newState === 'generating';
      case 'generating':
        return newState === 'completed' || newState === 'failed';
      case 'completed':
      case 'failed':
        return false;
      default:
        return false;
    }
  }
} 