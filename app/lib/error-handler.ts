import { ApiError } from './api-client';

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'VALIDATION_ERROR':
        return error.message;
      case 'NETWORK_ERROR':
        return 'Unable to connect. Please check your internet connection.';
      case 'DATABASE_ERROR':
      case 'INTERNAL_ERROR':
        return 'Something went wrong. Please try again later.';
      default:
        return 'An unexpected error occurred.';
    }
  }
  return 'An unexpected error occurred.';
}
