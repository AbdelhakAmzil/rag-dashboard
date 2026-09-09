export interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: string[];
}
