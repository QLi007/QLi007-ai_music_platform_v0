export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details: Record<string, any>;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    details: Record<string, any> = {}
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details: Record<string, any> = {}) {
    super(message, 400, true, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string, details: Record<string, any> = {}) {
    super(message, 401, true, details);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string, details: Record<string, any> = {}) {
    super(message, 403, true, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details: Record<string, any> = {}) {
    super(message, 404, true, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details: Record<string, any> = {}) {
    super(message, 409, true, details);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details: Record<string, any> = {}) {
    super(message, 500, false, details);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string, details: Record<string, any> = {}) {
    super(message, 500, false, details);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string, details: Record<string, any> = {}) {
    super(message, 503, false, details);
  }
} 