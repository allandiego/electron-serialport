class AppError {
  public readonly name: string;

  public readonly message: string;

  public readonly value: any | null;

  // super constructor
  // Error.call(this);
  // super helper method to include stack trace in error object
  // Error.captureStackTrace(this, this.constructor);

  constructor(message: string) {
    this.name = 'AppError';
    this.message = message || 'Error';
  }
}

export default AppError;
