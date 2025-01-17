import { DomainEvent } from '@core/domain/common/domain-event';
import { ProjectSettings } from '../value-objects/project-settings';

export class ProjectCreatedEvent extends DomainEvent {
  constructor(
    public readonly projectId: string,
    public readonly settings: ProjectSettings
  ) {
    super('ProjectCreated');
  }
} 