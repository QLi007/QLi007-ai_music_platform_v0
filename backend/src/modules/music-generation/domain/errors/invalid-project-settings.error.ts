export class InvalidProjectSettingsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidProjectSettingsError';
  }

  static missingRequiredField(field: string): InvalidProjectSettingsError {
    return new InvalidProjectSettingsError(`Missing required field: ${field}`);
  }

  static invalidValue(field: string, value: any, reason: string): InvalidProjectSettingsError {
    return new InvalidProjectSettingsError(
      `Invalid value for ${field}: ${value}. Reason: ${reason}`
    );
  }

  static invalidCombination(fields: string[], reason: string): InvalidProjectSettingsError {
    return new InvalidProjectSettingsError(
      `Invalid combination of fields: ${fields.join(', ')}. Reason: ${reason}`
    );
  }
} 