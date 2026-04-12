// Custom error class to attach HTTP status codes and mark expected (operational) errors for centralized error handling.
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    // @ts-ignore
    Error.captureStackTrace(this, this.constructor);
  }
}
