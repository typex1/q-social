export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateMessageContent(content: unknown): ValidationResult {
  if (typeof content !== 'string') {
    return { valid: false, error: 'Message content must be a string' };
  }
  
  const trimmed = content.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Message content cannot be empty' };
  }
  
  if (trimmed.length > 280) {
    return { valid: false, error: 'Message content must be 280 characters or less' };
  }
  
  return { valid: true };
}
