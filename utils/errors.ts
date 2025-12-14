export type ErrorCode = 
  | 'API_KEY_MISSING'
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'AI_SAFETY_BLOCK'
  | 'PARSING_ERROR'
  | 'UNKNOWN_ERROR'
  | 'PDF_GENERATION_ERROR';

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly publicMessage: string;
  public readonly originalError?: unknown;

  constructor(code: ErrorCode, publicMessage: string, originalError?: unknown) {
    super(publicMessage);
    this.name = 'AppError';
    this.code = code;
    this.publicMessage = publicMessage;
    this.originalError = originalError;
  }
}

/**
 * Converts any unknown error into a standardized AppError.
 */
export const normalizeError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  const message = error instanceof Error ? error.message : String(error);
  
  return new AppError('UNKNOWN_ERROR', message, error);
};
