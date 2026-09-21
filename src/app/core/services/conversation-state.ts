import { Injectable, signal, inject, computed } from '@angular/core';
import { Message } from '../../shared/models/message';
import { ConversationSummary } from '../../shared/models/conversation-summary';
import { Chat } from './chat';
import { ConversationApi } from './conversation-api';
import { MessageApi } from './message-api';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ConversationState {
  private chatService = inject(Chat);
  private conversationApi = inject(ConversationApi);
  private messageApi = inject(MessageApi);

  private router = inject(Router);

  conversations = signal<ConversationSummary[]>([]);
  activeConversationId = signal<string | null>(null);
  messages = signal<Message[]>([]);
  isLoading = signal(false);

  private activeStream?: Subscription;

  constructor() {
    this.refreshConversations();
  }

  activeConversationTitle = computed(() => {
    const id = this.activeConversationId();
    if (!id) {
      return null;
    }
    return this.conversations().find((c) => c.id === id)?.title ?? null;
  });

  refreshConversations() {
    this.conversationApi.list().subscribe({
      next: (list) => this.conversations.set(list),
      error: (err) => console.error('Failed to load conversations:', err),
    });
  }

  selectConversation(id: string) {
    if (this.activeConversationId() === id) {
      return;
    }

    this.conversationApi.get(id).subscribe({
      next: (detail) => {
        this.activeConversationId.set(detail.id);
        this.messages.set(
          detail.messages.map((m: any) => ({
            id: m.id,
            role: m.role.toLowerCase() as 'user' | 'assistant',
            text: m.content,
            timestamp: this.formatTimestamp(m.createdAt),
            sources: m.sources.length ? m.sources : undefined,
            feedback: m.feedback as 'LIKE' | 'DISLIKE' | null,
          })),
        );
        this.router.navigate(['/chat', detail.id]);
        this.loadPersistedImages(detail.messages);
      },
      error: (err) => console.error('Failed to load conversation:', err),
    });
  }

  private loadPersistedImages(rawMessages: any[]) {
    rawMessages
      .filter((m) => m.hasImage)
      .forEach((m) => {
        this.chatService.getMessageImage(m.id).subscribe({
          next: (blob) => {
            const imageUrl = URL.createObjectURL(blob);
            this.messages.update((current) =>
              current.map((msg) => (msg.id === m.id ? { ...msg, imageUrl } : msg)),
            );
          },
          error: (err) => console.error('Failed to load message image:', err),
        });
      });
  }

  createNewConversation() {
    this.activeConversationId.set(null);
    this.messages.set([]);
    this.router.navigate(['/chat']);
  }

  addMessage(message: Message) {
    this.messages.update((current) => [...current, message]);
  }

  sendQuestion(question: string, model: string = 'ollama') {
    const trimmed = question.trim();
    if (!trimmed || this.isLoading()) {
      return;
    }

    const isNewConversation = this.activeConversationId() === null;

    this.messages.update((current) => [
      ...current,
      { role: 'user', text: trimmed, timestamp: this.getCurrentTime() },
    ]);

    this.messages.update((current) => [
      ...current,
      { role: 'assistant', text: '', timestamp: this.getCurrentTime() },
    ]);

    this.isLoading.set(true);

    this.activeStream = this.chatService
      .streamQuestion(trimmed, this.activeConversationId(), model)
      .subscribe({
        next: (event) => {
          if (event.type === 'chunk') {
            const chunkText = event.data as string;
            this.messages.update((current) => {
              const updated = [...current];
              const lastIndex = updated.length - 1;
              updated[lastIndex] = {
                ...updated[lastIndex],
                text: updated[lastIndex].text + chunkText,
              };
              return updated;
            });
          } else if (event.type === 'done') {
            const response = event.data as any;
            this.activeConversationId.set(response.conversationId);

            this.messages.update((current) => {
              const updated = [...current];
              const lastIndex = updated.length - 1;
              updated[lastIndex] = {
                ...updated[lastIndex],
                id: response.messageId,
                sources: response.sources,
                responseTimeMs: response.responseTimeMs,
                retrievedChunks: response.retrievedChunks,
                intent: response.intent,
                model: response.model,
                feedback: null,
              };
              return updated;
            });

            this.isLoading.set(false);
            this.refreshConversations();

            if (isNewConversation) {
              this.router.navigate(['/chat', response.conversationId], { replaceUrl: true });
            }
          }
        },
        error: (err) => {
          console.error('Erreur de streaming', err);
          this.isLoading.set(false);
        },
      });
  }

  stopGenerating() {
    this.activeStream?.unsubscribe(); // déclenche controller.abort() dans chat.ts
    this.isLoading.set(false);
  }

  editMessage(messageId: string, newContent: string) {
    const trimmed = newContent.trim();
    if (!trimmed || this.isLoading()) {
      return;
    }

    // Mise à jour optimiste : on applique tout de suite ce qu'on sait déjà,
    // sans attendre la réponse du serveur — exactement comme sendQuestion().
    this.messages.update((current) => {
      const editedIndex = current.findIndex((m) => m.id === messageId);
      if (editedIndex === -1) {
        return current;
      }
      const upToEdited = current.slice(0, editedIndex + 1);
      upToEdited[editedIndex] = { ...upToEdited[editedIndex], text: trimmed };
      return [
        ...upToEdited,
        { role: 'assistant', text: '', timestamp: this.getCurrentTime() }, // placeholder → déclenche le typing indicator
      ];
    });

    this.isLoading.set(true);

    this.messageApi.editMessage(messageId, trimmed).subscribe({
      next: (response) => {
        this.messages.update((current) => {
          const updated = [...current];
          const lastIndex = updated.length - 1;
          updated[lastIndex] = {
            ...updated[lastIndex],
            id: response.messageId,
            text: response.answer,
            sources: response.sources,
            responseTimeMs: response.responseTimeMs,
            retrievedChunks: response.retrievedChunks,
            intent: response.intent,
            model: response.model,
            feedback: null,
          };
          return updated;
        });
        this.isLoading.set(false);
        this.refreshConversations();
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

  sendImageQuestion(question: string, image: File) {
    if (this.isLoading()) {
      return;
    }

    const isNewConversation = this.activeConversationId() === null;
    const trimmed = question.trim();
    const imageUrl = URL.createObjectURL(image);

    this.messages.update((current) => [
      ...current,
      { role: 'user', text: trimmed, timestamp: this.getCurrentTime(), imageUrl },
    ]);

    this.messages.update((current) => [
      ...current,
      { role: 'assistant', text: '', timestamp: this.getCurrentTime() },
    ]);

    this.isLoading.set(true);

    this.chatService.askWithImage(trimmed, image, this.activeConversationId()).subscribe({
      next: (response: any) => {
        this.activeConversationId.set(response.conversationId);

        this.messages.update((current) => {
          const updated = [...current];
          const lastIndex = updated.length - 1;
          updated[lastIndex] = {
            ...updated[lastIndex],
            id: response.messageId,
            text: response.answer,
            sources: response.sources,
            responseTimeMs: response.responseTimeMs,
            retrievedChunks: response.retrievedChunks,
            intent: response.intent,
            model: response.model,
            feedback: null,
          };
          return updated;
        });

        this.isLoading.set(false);
        this.refreshConversations();

        if (isNewConversation) {
          this.router.navigate(['/chat', response.conversationId], { replaceUrl: true });
        }
      },
      error: (err) => {
        console.error('Erreur vision', err);
        this.isLoading.set(false);
      },
    });
  }
}
