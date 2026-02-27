export interface Message {
  id: string;
  content: string;
  createdAt: number;
}

export interface CreateMessageRequest {
  content: string;
}

export interface CreateMessageResponse {
  message: Message;
}

export interface GetMessagesResponse {
  messages: Message[];
}

export interface ErrorResponse {
  error: string;
  code: string;
}
