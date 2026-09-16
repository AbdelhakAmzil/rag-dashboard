import { Component, inject, signal } from '@angular/core';
import { UiState } from '../../core/services/ui-state';
import { ConversationState } from '../../core/services/conversation-state';
import { Auth } from '../../core/services/auth';
import { Notification } from '../../core/services/notification';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sidebar',
  imports: [FormsModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  uiState = inject(UiState);
  conversation = inject(ConversationState);
  auth = inject(Auth);
  private notification = inject(Notification);

  editingId = signal<string | null>(null);
  editingTitle = '';

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

  startRename(id: string, currentTitle: string, event: Event) {
    event.stopPropagation();
    this.editingId.set(id);
    this.editingTitle = currentTitle;
  }

  private renameInFlight = false;

  confirmRename(id: string) {
    if (this.renameInFlight) {
      return;
    }
    this.renameInFlight = true;

    if (this.editingTitle.trim()) {
      this.conversation.renameConversation(id, this.editingTitle);
    }
    this.editingId.set(null);

    setTimeout(() => (this.renameInFlight = false), 0);
  }

  cancelRename() {
    this.editingId.set(null);
  }

  onDelete(id: string, event: Event) {
    event.stopPropagation();
    this.conversation.deleteConversation(id);
    this.notification.success('Conversation deleted.');
  }
}
