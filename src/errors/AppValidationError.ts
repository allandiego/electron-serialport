import { ValidationError } from 'yup';

class AppValidationError extends ValidationError {
  public readonly name: string;

  public readonly message: string;

  public readonly value: unknown;

  /**
   * A string, indicating where there error was thrown. path is empty at the root level.
   */
  public readonly path: string;

  public readonly type: string | undefined;

  /**
   * array of error messages
   */
  public readonly errors: string[];

  /**
   * In the case of aggregate errors, inner is an array of ValidationErrors throw earlier in the validation chain.
   */
  public readonly inner: ValidationError[];

  public readonly params?: Record<string, unknown>;

  constructor(
    errors: string,
    value: unknown,
    path: string,
    type?: string | undefined,
  ) {
    super(errors, value, path, type);
    // this.name = 'AppValidationError';
    this.inner = [new ValidationError(errors, value, path)];
  }
}

export default AppValidationError;
