import { IMusicProjectRepository } from '../../domain/ports/music-project.repository';
import { MusicProject } from '../../domain/music-project';
import { ProjectSettings } from '../../domain/value-objects/project-settings';
import { ProjectState } from '../../domain/value-objects/project-state';

export class MusicProjectRepository implements IMusicProjectRepository {
  // 使用内存存储用于演示
  private projects: Map<string, MusicProject> = new Map();

  async save(project: MusicProject): Promise<void> {
    this.projects.set(project.getId(), project);
  }

  async findById(id: string): Promise<MusicProject | null> {
    return this.projects.get(id) || null;
  }

  async findAll(): Promise<MusicProject[]> {
    return Array.from(this.projects.values());
  }

  async delete(id: string): Promise<void> {
    this.projects.delete(id);
  }

  async update(project: MusicProject): Promise<void> {
    await this.save(project);
  }

  async findByUserId(userId: string): Promise<MusicProject[]> {
    return Array.from(this.projects.values())
      .filter(project => project.getUserId() === userId);
  }

  async exists(id: string): Promise<boolean> {
    return this.projects.has(id);
  }
} 