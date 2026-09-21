import { Component, inject, signal, computed } from '@angular/core';
import { UiState } from '../../core/services/ui-state';
import { ConversationState } from '../../core/services/conversation-state';
import { Auth } from '../../core/services/auth';
import { Notification } from '../../core/services/notification';
import { ConversationSummary } from '../../shared/models/conversation-summary';
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

  groupedConversations = computed(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const buckets = new Map<string, ConversationSummary[]>();

    for (const conv of this.conversation.conversations()) {
      const created = new Date(conv.createdAt);
      const createdDay = new Date(created.getFullYear(), created.getMonth(), created.getDate());
      const diffDays = Math.floor((startOfToday.getTime() - createdDay.getTime()) / 86400000);

      let label: string;
      if (diffDays <= 0) label = 'Today';
      else if (diffDays === 1) label = 'Yesterday';
      else if (diffDays <= 7) label = 'Previous 7 Days';
      else if (diffDays <= 30) label = 'Previous 30 Days';
      else label = 'Older';

      if (!buckets.has(label)) buckets.set(label, []);
      buckets.get(label)!.push(conv);
    }

    const labelOrder = ['Today', 'Yesterday', 'Previous 7 Days', 'Previous 30 Days', 'Older'];
    return labelOrder
      .filter((label) => buckets.has(label))
      .map((label) => ({ label, items: buckets.get(label)! }));
  });

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
    if (this.renameInFlight) return;
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
