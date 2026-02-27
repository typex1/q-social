import type {
  Message,
  CreateMessageRequest,
  CreateMessageResponse,
  GetMessagesResponse,
  ErrorResponse
} from '../../shared/types/message';

class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const url = apiBaseUrl ? `${apiBaseUrl}${endpoint}` : endpoint;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      const error = data as ErrorResponse;
      throw new ApiError(response.status, error.code, error.error);
    }
    
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, 'NETWORK_ERROR', 'Network request failed');
  }
}

export async function createMessage(content: string): Promise<Message> {
  const response = await fetchApi<CreateMessageResponse>('/api/messages', {
    method: 'POST',
    body: JSON.stringify({ content } as CreateMessageRequest)
  });
  return response.message;
}

export async function getMessages(): Promise<Message[]> {
  const response = await fetchApi<GetMessagesResponse>('/api/messages');
  return response.messages;
}

export { ApiError };
