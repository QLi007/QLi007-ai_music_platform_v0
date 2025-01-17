import { DomainEvent } from '@core/domain/common/domain-event';

export class GenerationStartedEvent extends DomainEvent {
  constructor(public readonly projectId: string) {
    super('GenerationStarted');
  }
} 