import { Component, inject } from '@angular/core';
import { UiState } from '../../core/services/ui-state';
import { ConversationState } from '../../core/services/conversation-state';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  uiState = inject(UiState);
  conversation = inject(ConversationState);

  onNewChat() {
    this.conversation.createNewConversation();
  }

  onSelectConversation(id: string) {
    this.conversation.activeConversationId.set(id);
  }
}
