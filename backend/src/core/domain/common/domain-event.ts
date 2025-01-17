export abstract class DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventType: string;

  protected constructor(eventType: string) {
    this.occurredOn = new Date();
    this.eventType = eventType;
  }
} 