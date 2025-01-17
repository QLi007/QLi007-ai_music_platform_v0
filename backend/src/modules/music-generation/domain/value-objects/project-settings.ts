import { Result } from '@core/domain/common/result';
import { ValueObject } from '@core/domain/common/value-object';

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

  public static create(props: ProjectSettingsProps): Result<ProjectSettings> {
    if (!props.theme || props.theme.length < 2 || props.theme.length > 100) {
      return Result.fail<ProjectSettings>('主题长度必须在2-100个字符之间');
    }

    if (!props.style || props.style.length < 2 || props.style.length > 50) {
      return Result.fail<ProjectSettings>('风格长度必须在2-50个字符之间');
    }

    if (!props.duration || props.duration < 1 || props.duration > 600) {
      return Result.fail<ProjectSettings>('时长必须在1-600秒之间');
    }

    if (props.tempo !== undefined && (props.tempo < 40 || props.tempo > 208)) {
      return Result.fail<ProjectSettings>('速度必须在40-208 BPM之间');
    }

    const validKeys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];
    if (props.key !== undefined && !validKeys.includes(props.key)) {
      return Result.fail<ProjectSettings>('无效的调性');
    }

    return Result.ok<ProjectSettings>(new ProjectSettings(props));
  }
} 