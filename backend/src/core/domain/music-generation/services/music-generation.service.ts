import { Result } from '../../common/result';
import { ProjectSettings } from '../value-objects/project-settings';
import { ProjectValidator } from '../validators/project-validator';

export interface IMusicGenerationService {
  generate(projectId: string, settings: ProjectSettings): Promise<Result<void>>;
  cancelGeneration(projectId: string): Promise<Result<void>>;
  getGenerationProgress(projectId: string): Promise<Result<number>>;
  getGenerationResult(projectId: string): Promise<Result<Buffer>>;
  validateSettings(settings: ProjectSettings): Promise<Result<void>>;
}

export class MusicGenerationService implements IMusicGenerationService {
  private activeGenerations: Map<string, {
    progress: number;
    cancel: () => void;
  }> = new Map();

  private generationResults: Map<string, Buffer> = new Map();

  async generate(projectId: string, settings: ProjectSettings): Promise<Result<void>> {
    // 首先验证设置
    const validationResult = await this.validateSettings(settings);
    if (validationResult.isFailure) {
      return Result.fail(validationResult.error);
    }

    // 检查是否已经在生成中
    if (this.activeGenerations.has(projectId)) {
      return Result.fail('Project is already being generated');
    }

    try {
      // 创建一个可取消的生成过程
      let isCancelled = false;
      const cancel = () => {
        isCancelled = true;
      };

      // 存储生成状态
      this.activeGenerations.set(projectId, {
        progress: 0,
        cancel
      });

      // 模拟生成过程
      await new Promise<void>((resolve, reject) => {
        let progress = 0;
        const interval = setInterval(() => {
          if (isCancelled) {
            clearInterval(interval);
            this.activeGenerations.delete(projectId);
            reject(new Error('Generation cancelled'));
            return;
          }

          progress += 10;
          this.activeGenerations.set(projectId, {
            progress: Math.min(progress, 100),
            cancel
          });

          if (progress >= 100) {
            clearInterval(interval);
            // 模拟生成结果
            this.generationResults.set(projectId, Buffer.from('Generated music data'));
            this.activeGenerations.delete(projectId);
            resolve();
          }
        }, 1000);
      });

      return Result.ok();
    } catch (error) {
      this.activeGenerations.delete(projectId);
      return Result.fail(error instanceof Error ? error.message : 'Generation failed');
    }
  }

  async cancelGeneration(projectId: string): Promise<Result<void>> {
    const generation = this.activeGenerations.get(projectId);
    if (!generation) {
      return Result.fail('No active generation found for this project');
    }

    generation.cancel();
    return Result.ok();
  }

  async getGenerationProgress(projectId: string): Promise<Result<number>> {
    const generation = this.activeGenerations.get(projectId);
    if (!generation) {
      return Result.fail('No active generation found for this project');
    }

    return Result.ok(generation.progress);
  }

  async getGenerationResult(projectId: string): Promise<Result<Buffer>> {
    const result = this.generationResults.get(projectId);
    if (!result) {
      return Result.fail('No generation result found for this project');
    }

    return Result.ok(result);
  }

  async validateSettings(settings: ProjectSettings): Promise<Result<void>> {
    return ProjectValidator.validateSettings(settings);
  }
} 