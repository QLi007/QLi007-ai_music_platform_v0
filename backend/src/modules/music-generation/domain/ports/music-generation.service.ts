import { ProjectSettings } from '../value-objects/project-settings';
import { Result } from '@core/domain/common/result';

export interface IMusicGenerationService {
  generate(projectId: string, settings: ProjectSettings): Promise<Result<void>>;
  cancelGeneration(projectId: string): Promise<Result<void>>;
  getGenerationProgress(projectId: string): Promise<Result<number>>;
  getGenerationResult(projectId: string): Promise<Result<Buffer>>;
  validateSettings(settings: ProjectSettings): Promise<Result<void>>;
} 