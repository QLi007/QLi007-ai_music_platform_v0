export class ProjectStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProjectStateError';
  }

  static invalidTransition(from: string, to: string): ProjectStateError {
    return new ProjectStateError(`Invalid state transition from ${from} to ${to}`);
  }

  static invalidOperation(state: string, operation: string): ProjectStateError {
    return new ProjectStateError(`Cannot perform operation ${operation} in state ${state}`);
  }
} 