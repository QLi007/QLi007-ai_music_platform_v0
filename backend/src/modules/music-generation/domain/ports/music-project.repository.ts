import { MusicProject } from '../music-project';

export interface IMusicProjectRepository {
  save(project: MusicProject): Promise<void>;
  findById(id: string): Promise<MusicProject | null>;
  findAll(): Promise<MusicProject[]>;
  delete(id: string): Promise<void>;
  update(project: MusicProject): Promise<void>;
  findByUserId(userId: string): Promise<MusicProject[]>;
  exists(id: string): Promise<boolean>;
} 