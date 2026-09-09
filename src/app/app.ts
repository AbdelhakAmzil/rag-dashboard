import { Component, inject } from '@angular/core';
import { Sidebar } from './layout/sidebar/sidebar';
import { ChatHeader } from './layout/chat-header/chat-header';
import { MessageBubble } from './features/chat/message-bubble/message-bubble';
import { ChatInput } from './features/chat/chat-input/chat-input';
import { SourcesPanel } from './layout/sources-panel/sources-panel';
import { UiState } from './core/services/ui-state';
import { ConversationState } from './core/services/conversation-state';

@Component({
  selector: 'app-root',
  imports: [Sidebar, ChatHeader, MessageBubble, ChatInput, SourcesPanel],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  title = 'rag-chatbot-ui';
  uiState = inject(UiState);
  conversation = inject(ConversationState);

  askQuickQuestion(question: string) {
    this.conversation.sendQuestion(question);
  }
}
