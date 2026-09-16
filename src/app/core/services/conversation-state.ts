import { Injectable, signal, inject } from '@angular/core';
import { Message } from '../../shared/models/message';
import { ConversationSummary } from '../../shared/models/conversation-summary';
import { Chat } from './chat';
import { ConversationApi } from './conversation-api';
import { MessageApi } from './message-api';

@Injectable({
  providedIn: 'root',
})
export class ConversationState {
  private chatService = inject(Chat);
  private conversationApi = inject(ConversationApi);
  private messageApi = inject(MessageApi);

  conversations = signal<ConversationSummary[]>([]);
  activeConversationId = signal<string | null>(null);
  messages = signal<Message[]>([]);
  isLoading = signal(false);

  constructor() {
    this.refreshConversations();
  }

  refreshConversations() {
    this.conversationApi.list().subscribe({
      next: (list) => this.conversations.set(list),
      error: (err) => console.error('Failed to load conversations:', err),
    });
  }

  selectConversation(id: string) {
    this.conversationApi.get(id).subscribe({
      next: (detail) => {
        this.activeConversationId.set(detail.id);
        this.messages.set(
          detail.messages.map((m) => ({
            id: m.id,
            role: m.role.toLowerCase() as 'user' | 'assistant',
            text: m.content,
            timestamp: this.formatTimestamp(m.createdAt),
            sources: m.sources.length ? m.sources : undefined,
            feedback: m.feedback as 'LIKE' | 'DISLIKE' | null,
          })),
        );
      },
      error: (err) => console.error('Failed to load conversation:', err),
    });
  }

  createNewConversation() {
    this.activeConversationId.set(null);
    this.messages.set([]);
  }

  addMessage(message: Message) {
    this.messages.update((current) => [...current, message]);
  }

  sendQuestion(question: string) {
    const trimmed = question.trim();
    if (!trimmed || this.isLoading()) {
      return;
    }

    this.messages.update((current) => [
      ...current,
      { role: 'user', text: trimmed, timestamp: this.getCurrentTime() },
    ]);

    this.isLoading.set(true);
    const wasNewConversation = this.activeConversationId() === null;

    this.chatService.askQuestion(trimmed, this.activeConversationId()).subscribe({
      next: (response) => {
        this.messages.update((current) => [
          ...current,
          {
            id: response.messageId,
            role: 'assistant',
            text: response.answer,
            timestamp: this.getCurrentTime(),
            sources: response.sources,
            query: trimmed,
            responseTimeMs: response.responseTimeMs,
            retrievedChunks: response.retrievedChunks,
            intent: response.intent,
            model: response.model,
            feedback: null,
          },
        ]);
        this.activeConversationId.set(response.conversationId);
        this.isLoading.set(false);

        if (wasNewConversation) {
          this.conversations.update((current) => [
            {
              id: response.conversationId,
              title: this.truncateTitle(trimmed),
              createdAt: new Date().toISOString(),
            },
            ...current,
          ]);
        }
      },
      error: (err) => {
        console.error('Error calling backend:', err);
        this.messages.update((current) => [
          ...current,
          {
            role: 'assistant',
            text: 'Sorry, something went wrong while contacting the server.',
            timestamp: this.getCurrentTime(),
          },
        ]);
        this.isLoading.set(false);
      },
    });
  }

  editMessage(messageId: string, newContent: string) {
    const trimmed = newContent.trim();
    if (!trimmed || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);

    this.messageApi.editMessage(messageId, trimmed).subscribe({
      next: (response) => {
        this.messages.update((current) => {
          const editedIndex = current.findIndex((m) => m.id === messageId);
          if (editedIndex === -1) {
            return current;
          }

          // Keep everything up to and including the edited question, update its text,
          // drop everything after (the old answer and anything that followed it),
          // then append the freshly regenerated answer.
          const upToEdited = current.slice(0, editedIndex + 1);
          upToEdited[editedIndex] = { ...upToEdited[editedIndex], text: trimmed };

          return [
            ...upToEdited,
            {
              id: response.messageId,
              role: 'assistant',
              text: response.answer,
              timestamp: this.getCurrentTime(),
              sources: response.sources,
              responseTimeMs: response.responseTimeMs,
              retrievedChunks: response.retrievedChunks,
              intent: response.intent,
              model: response.model,
              feedback: null,
            },
          ];
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to edit message:', err);
        this.isLoading.set(false);
      },
    });
  }

  private truncateTitle(text: string): string {
    const maxLength = 40;
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  }

  private formatTimestamp(iso: string): string {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  renameConversation(id: string, newTitle: string) {
    const trimmed = newTitle.trim();
    if (!trimmed) {
      return;
    }

    this.conversationApi.rename(id, trimmed).subscribe({
      next: (updated) => {
        this.conversations.update((current) =>
          current.map((c) => (c.id === updated.id ? updated : c)),
        );
      },
      error: (err) => console.error('Failed to rename conversation:', err),
    });
  }

  deleteConversation(id: string) {
    this.conversationApi.delete(id).subscribe({
      next: () => {
        this.conversations.update((current) => current.filter((c) => c.id !== id));

        if (this.activeConversationId() === id) {
          this.createNewConversation();
        }
      },
      error: (err) => console.error('Failed to delete conversation:', err),
    });
  }

  regenerateMessage(messageId: string) {
    if (this.isLoading()) {
      return;
    }

    this.isLoading.set(true);

    this.messageApi.regenerate(messageId).subscribe({
      next: (response) => {
        this.messages.update((current) => {
          const filtered = current.filter((m) => m.id !== messageId);
          return [
            ...filtered,
            {
              id: response.messageId,
              role: 'assistant',
              text: response.answer,
              timestamp: this.getCurrentTime(),
              sources: response.sources,
              responseTimeMs: response.responseTimeMs,
              retrievedChunks: response.retrievedChunks,
              intent: response.intent,
              model: response.model,
              feedback: null,
            },
          ];
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to regenerate:', err);
        this.isLoading.set(false);
      },
    });
  }
}
