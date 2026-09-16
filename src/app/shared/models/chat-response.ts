export interface ChatResponse {
  answer: string;
  sources: string[];
  conversationId: string;
  responseTimeMs: number;
  retrievedChunks: number;
  intent: string;
  model: string;
  messageId: string;
}
