export interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: string[];
  query?: string;
  responseTimeMs?: number;
  retrievedChunks?: number;
  intent?: string;
  model?: string;
}
