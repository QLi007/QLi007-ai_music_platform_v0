import { ValueObject } from '../../common/value-object';

interface ProjectSettingsProps {
  theme: string;
  style: string;
  duration: number;
  tempo?: number;
  key?: string;
}

export class ProjectSettings extends ValueObject<ProjectSettingsProps> {
  get theme(): string {
    return this.props.theme;
  }

  get style(): string {
    return this.props.style;
  }

  get duration(): number {
    return this.props.duration;
  }

  get tempo(): number | undefined {
    return this.props.tempo;
  }

  get key(): string | undefined {
    return this.props.key;
  }

  private constructor(props: ProjectSettingsProps) {
    super(props);
  }

  public static create(props: ProjectSettingsProps): ProjectSettings {
    return new ProjectSettings(props);
  }
} 