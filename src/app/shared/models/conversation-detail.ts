import { ChatMessageDto } from './chat-message-dto';

export interface ConversationDetail {
  id: string;
  title: string;
  messages: ChatMessageDto[];
}
