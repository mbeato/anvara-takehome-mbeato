// Standardized API error response format
// Every error from every route MUST use this shape

export interface ApiErrorResponse {
  error: {
    code: string;
    status: number;
    message: string;
  };
}

/**
 * Create a standardized error response object.
 * Usage: res.status(400).json(apiError(400, 'VALIDATION_ERROR', 'Budget must be positive'))
 */
export function apiError(status: number, code: string, message: string): ApiErrorResponse {
  return { error: { code, status, message } };
}
