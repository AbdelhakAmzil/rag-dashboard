export interface ChatMessageDto {
  id: string;
  role: string; // 'USER' | 'ASSISTANT'
  content: string;
  createdAt: string;
  sources: string[];
}
