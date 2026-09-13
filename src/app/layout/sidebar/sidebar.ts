import { Component, inject } from '@angular/core';
import { UiState } from '../../core/services/ui-state';
import { ConversationState } from '../../core/services/conversation-state';
import { Auth } from '../../core/services/auth';
import { Notification } from '../../core/services/notification';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  uiState = inject(UiState);
  conversation = inject(ConversationState);
  auth = inject(Auth);
  private notification = inject(Notification);

  onNewChat() {
    this.conversation.createNewConversation();
  }

  onSelectConversation(id: string) {
    this.conversation.selectConversation(id);
  }

  onLogout() {
    this.notification.success('Logged out successfully.');
    this.auth.logout();
  }
}
