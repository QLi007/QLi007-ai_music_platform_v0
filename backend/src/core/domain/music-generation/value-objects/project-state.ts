import { ValueObject } from '../../common/value-object';

export type ProjectStateType = 'draft' | 'generating' | 'completed' | 'failed';

interface ProjectStateProps {
  value: ProjectStateType;
  [key: string]: any;
}

export class ProjectState extends ValueObject<ProjectStateProps> {
  private constructor(value: ProjectStateType) {
    super({ value });
  }

  public getValue(): ProjectStateType {
    return this.props.value;
  }

  public static create(value: ProjectStateType): ProjectState {
    return new ProjectState(value);
  }

  public static draft(): ProjectState {
    return new ProjectState('draft');
  }

  public static generating(): ProjectState {
    return new ProjectState('generating');
  }

  public static completed(): ProjectState {
    return new ProjectState('completed');
  }

  public static failed(): ProjectState {
    return new ProjectState('failed');
  }
} 