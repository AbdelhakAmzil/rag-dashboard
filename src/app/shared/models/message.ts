export interface Message {
  id?: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: string[];
  query?: string;
  responseTimeMs?: number;
  retrievedChunks?: number;
  intent?: string;
  model?: string;
  feedback?: 'LIKE' | 'DISLIKE' | null;
}
