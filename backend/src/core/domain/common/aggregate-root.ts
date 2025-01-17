import { v4 as uuidv4 } from 'uuid';
import { DomainEvent } from './domain-event';

export abstract class AggregateRoot {
  private _id: string;
  private _version: number;
  private _events: DomainEvent[] = [];

  protected constructor(id?: string) {
    this._id = id || uuidv4();
    this._version = 0;
  }

  get id(): string {
    return this._id;
  }

  get version(): number {
    return this._version;
  }

  get uncommittedEvents(): DomainEvent[] {
    return this._events;
  }

  protected apply(event: DomainEvent): void {
    this.handle(event);
    this._version++;
    this._events.push(event);
  }

  protected abstract handle(event: DomainEvent): void;

  clearEvents(): void {
    this._events = [];
  }
} 