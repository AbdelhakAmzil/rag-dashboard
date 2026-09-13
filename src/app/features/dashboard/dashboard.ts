import { Component, inject } from '@angular/core';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { ChatHeader } from '../../layout/chat-header/chat-header';
import { MessageBubble } from '../chat/message-bubble/message-bubble';
import { ChatInput } from '../chat/chat-input/chat-input';
import { SourcesPanel } from '../../layout/sources-panel/sources-panel';
import { UiState } from '../../core/services/ui-state';
import { ConversationState } from '../../core/services/conversation-state';

@Component({
  selector: 'app-dashboard',
  imports: [Sidebar, ChatHeader, MessageBubble, ChatInput, SourcesPanel],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  uiState = inject(UiState);
  conversation = inject(ConversationState);

  askQuickQuestion(question: string) {
    this.conversation.sendQuestion(question);
  }
}
