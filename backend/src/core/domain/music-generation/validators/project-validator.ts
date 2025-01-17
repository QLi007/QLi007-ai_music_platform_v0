import { Result } from '../../common/result';
import { ProjectSettings } from '../value-objects/project-settings';
import { ProjectState, ProjectStateType } from '../value-objects/project-state';
import { InvalidProjectSettingsError } from '../errors/invalid-project-settings.error';
import { ProjectStateError } from '../errors/project-state.error';

export class ProjectValidator {
  static validateSettings(settings: ProjectSettings): Result<void> {
    try {
      // 验证主题
      if (!settings.theme || settings.theme.trim().length === 0) {
        throw InvalidProjectSettingsError.missingRequiredField('theme');
      }

      // 验证风格
      if (!settings.style || settings.style.trim().length === 0) {
        throw InvalidProjectSettingsError.missingRequiredField('style');
      }

      // 验证时长
      if (!settings.duration || settings.duration <= 0 || settings.duration > 600) {
        throw InvalidProjectSettingsError.invalidValue(
          'duration',
          settings.duration,
          'Duration must be between 1 and 600 seconds'
        );
      }

      // 验证速度
      if (settings.tempo && (settings.tempo < 40 || settings.tempo > 208)) {
        throw InvalidProjectSettingsError.invalidValue(
          'tempo',
          settings.tempo,
          'Tempo must be between 40 and 208 BPM'
        );
      }

      // 验证调性
      const validKeys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];
      if (settings.key && !validKeys.includes(settings.key)) {
        throw InvalidProjectSettingsError.invalidValue(
          'key',
          settings.key,
          `Key must be one of: ${validKeys.join(', ')}`
        );
      }

      return Result.ok();
    } catch (error) {
      if (error instanceof InvalidProjectSettingsError) {
        return Result.fail(error.message);
      }
      return Result.fail('Unexpected error during settings validation');
    }
  }

  static validateStateTransition(from: ProjectState, to: ProjectState): Result<void> {
    try {
      const validTransitions: Record<ProjectStateType, ProjectStateType[]> = {
        draft: ['generating'],
        generating: ['completed', 'failed'],
        completed: [],
        failed: ['draft']
      };

      const currentState = from.getValue();
      const nextState = to.getValue();

      if (!validTransitions[currentState].includes(nextState)) {
        throw ProjectStateError.invalidTransition(currentState, nextState);
      }

      return Result.ok();
    } catch (error) {
      if (error instanceof ProjectStateError) {
        return Result.fail(error.message);
      }
      return Result.fail('Unexpected error during state transition validation');
    }
  }
} 