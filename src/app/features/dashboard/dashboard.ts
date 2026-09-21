import { Component, ElementRef, ViewChild, inject, effect } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { ChatHeader } from '../../layout/chat-header/chat-header';
import { MessageBubble } from '../chat/message-bubble/message-bubble';
import { ChatInput } from '../chat/chat-input/chat-input';
import { SourcesPanel } from '../../layout/sources-panel/sources-panel';
import { UiState } from '../../core/services/ui-state';
import { ConversationState } from '../../core/services/conversation-state';
import { Message } from '../../shared/models/message';
import { DocumentPreviewOverlay } from '../document-preview-overlay/document-preview-overlay';

@Component({
  selector: 'app-dashboard',
  imports: [Sidebar, ChatHeader, MessageBubble, ChatInput, SourcesPanel, DocumentPreviewOverlay],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  uiState = inject(UiState);
  conversation = inject(ConversationState);
  private route = inject(ActivatedRoute);

  @ViewChild('scrollAnchor') private scrollAnchor?: ElementRef<HTMLDivElement>;

  private lastMessageCount = 0;
  private userScrolledUp = false;

  constructor() {
    effect(() => {
      const currentCount = this.conversation.messages().length;
      const loading = this.conversation.isLoading();
      const isNewMessage = currentCount !== this.lastMessageCount;
      this.lastMessageCount = currentCount;

      if ((isNewMessage || loading) && !this.userScrolledUp) {
        setTimeout(() => this.scrollToBottom());
      }
    });

    this.route.paramMap.subscribe((params) => {
      const id = params.get('conversationId');
      if (id && id !== this.conversation.activeConversationId()) {
        this.conversation.selectConversation(id);
      }
    });
  }

  private scrollToBottom() {
    const el = this.scrollAnchor?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }

  onScroll(event: Event) {
    const el = event.target as HTMLDivElement;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    this.userScrolledUp = distanceFromBottom > 80;
  }

  askQuickQuestion(question: string) {
    this.conversation.sendQuestion(question);
  }

  onEdit(message: Message, newText: string) {
    if (message.id) {
      this.conversation.editMessage(message.id, newText);
    }
  }

  lastMessageHasContent(): boolean {
    const msgs = this.conversation.messages();
    const last = msgs[msgs.length - 1];
    return !!last && last.role === 'assistant' && last.text.length > 0;
  }

  onRegenerate(message: Message) {
    if (message.id) {
      this.conversation.regenerateMessage(message.id);
    }
  }
}
