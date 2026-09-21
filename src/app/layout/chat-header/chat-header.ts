import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
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
  conversation = inject(ConversationState);
  private titleService = inject(Title);
  private destroyRef = inject(DestroyRef);
  justCopied = signal(false);

  constructor() {
    effect(() => {
      const title = this.conversation.activeConversationTitle() || 'New Chat';
      this.titleService.setTitle(`${title} · RAG Chatbot`);
    });

    // quand on quitte la page de chat (logout, autre route), on remet le titre par défaut
    this.destroyRef.onDestroy(() => this.titleService.setTitle('RAG Chatbot'));
  }

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




