import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { Message } from '../../shared/models/message';
import { Conversation } from '../../shared/models/conversation';
import { Chat } from './chat';

@Injectable({
  providedIn: 'root',
})
export class ConversationState {
  private chatService = inject(Chat);
  private readonly storageKey = 'rag-chatbot-conversations';
  private readonly activeIdStorageKey = 'rag-chatbot-active-id';

  conversations = signal<Conversation[]>(this.loadFromStorage());
  activeConversationId = signal<string>(this.loadActiveId());

  messages = computed<Message[]>(() => {
    const active = this.conversations().find(c => c.id === this.activeConversationId());
    return active?.messages ?? [];
  });

  isLoading = signal(false);

  constructor() {
    effect(() => {
      localStorage.setItem(this.storageKey, JSON.stringify(this.conversations()));
    });

    effect(() => {
      localStorage.setItem(this.activeIdStorageKey, this.activeConversationId());
    });
  }

  private loadActiveId(): string {
    const savedId = localStorage.getItem(this.activeIdStorageKey);
    const conversations = this.loadFromStorage();

    // On vérifie que l'ID sauvegardé correspond à une conversation qui existe vraiment
    const isValid = savedId && conversations.some(c => c.id === savedId);

    return isValid ? savedId! : (conversations[0]?.id ?? 'demo-1');
  }

  private loadFromStorage(): Conversation[] {
    const saved = localStorage.getItem(this.storageKey);

    if (saved) {
      try {
        return JSON.parse(saved) as Conversation[];
      } catch (err) {
        console.error('Failed to parse saved conversations:', err);
      }
    }

    // Valeur par défaut si rien n'est sauvegardé (première visite)
    return [
      {
        id: 'demo-1',
        title: 'Explain RAG architecture',
        messages: [
          {
            role: 'user',
            text: 'Can you explain how a RAG (Retrieval-Augmented Generation) system works?',
            timestamp: '10:42 AM',
          },
          {
            role: 'assistant',
            text: 'A Retrieval-Augmented Generation (RAG) system combines information retrieval with generative models to produce accurate and context-aware responses.',
            timestamp: '10:42 AM',
          },
        ]
      }
    ];
  }

  addMessage(message: Message) {
    this.conversations.update((current) =>
      current.map((conv) => {
        if (conv.id !== this.activeConversationId()) {
          return conv;
        }

        const updatedMessages = [...conv.messages, message];

        // Si c'est le tout premier message de la conversation et qu'il vient de l'utilisateur,
        // on en déduit un titre (tronqué à 40 caractères)
        const shouldUpdateTitle = conv.messages.length === 0 && message.role === 'user';
        const newTitle = shouldUpdateTitle ? this.truncateTitle(message.text) : conv.title;

        return { ...conv, messages: updatedMessages, title: newTitle };
      }),
    );
  }

  private truncateTitle(text: string): string {
    const maxLength = 40;
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  }

  clearConversation() {
    this.conversations.update((current) =>
      current.map((conv) =>
        conv.id === this.activeConversationId() ? { ...conv, messages: [] } : conv,
      ),
    );
  }

  sendQuestion(question: string) {
    const trimmed = question.trim();
    if (!trimmed || this.isLoading()) {
      return;
    }

    this.addMessage({
      role: 'user',
      text: trimmed,
      timestamp: this.getCurrentTime(),
    });

    this.isLoading.set(true);

    this.chatService.askQuestion(trimmed).subscribe({
      next: (response) => {
        this.addMessage({
          role: 'assistant',
          text: response.answer,
          timestamp: this.getCurrentTime(),
          sources: response.sources,
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error calling backend:', err);
        this.addMessage({
          role: 'assistant',
          text: 'Sorry, something went wrong while contacting the server.',
          timestamp: this.getCurrentTime(),
        });
        this.isLoading.set(false);
      },
    });
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  createNewConversation() {
    const newId = crypto.randomUUID();

    this.conversations.update((current) => [
      ...current,
      { id: newId, title: 'New conversation', messages: [] },
    ]);

    this.activeConversationId.set(newId);
  }
}
