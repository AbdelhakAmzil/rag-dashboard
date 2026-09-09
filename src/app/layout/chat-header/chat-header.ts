import { Component, inject, signal } from '@angular/core';
import { UiState } from '../../core/services/ui-state';
import { ConversationState } from '../../core/services/conversation-state';

@Component({
  selector: 'app-chat-header',
  imports: [],
  templateUrl: './chat-header.html',
  styleUrl: './chat-header.css',
})
export class ChatHeader {
  uiState = inject(UiState);
  private conversation = inject(ConversationState);
  justCopied = signal(false);

  onShare() {
    const messages = this.conversation.messages();

    const transcript = messages
      .map(
        (msg) => `${msg.role === 'user' ? 'You' : 'RAG Chatbot'} (${msg.timestamp}):\n${msg.text}`,
      )
      .join('\n\n');

    navigator.clipboard
      .writeText(transcript)
      .then(() => {
        this.justCopied.set(true);
        setTimeout(() => this.justCopied.set(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy:', err);
      });
  }
}
