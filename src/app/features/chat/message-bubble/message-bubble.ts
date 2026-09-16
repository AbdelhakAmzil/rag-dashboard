import { Component, input, computed, inject, signal, output, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { Message } from '../../../shared/models/message';
import { SourceCard } from '../source-card/source-card';
import { Notification } from '../../../core/services/notification';
import { MessageApi } from '../../../core/services/message-api';

@Component({
  selector: 'app-message-bubble',
  imports: [SourceCard, FormsModule],
  templateUrl: './message-bubble.html',
  styleUrl: './message-bubble.css',
})
export class MessageBubble {
  message = input.required<Message>();
  regenerate = output<void>();
  edit = output<string>();

  private sanitizer = inject(DomSanitizer);
  private notification = inject(Notification);
  private messageApi = inject(MessageApi);
  private lastSyncedId: string | undefined;

  justCopied = signal(false);
  feedback = signal<'LIKE' | 'DISLIKE' | null>(null);
  isEditing = signal(false);
  editText = '';

  constructor() {
    effect(() => {
      const msg = this.message();
      if (msg.id !== this.lastSyncedId) {
        this.lastSyncedId = msg.id;
        this.feedback.set(msg.feedback ?? null);
      }
    });
  }

  renderedText = computed<SafeHtml>(() => {
    const raw = this.message().text;
    const html = marked.parse(raw, { breaks: true }) as string;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  onCopy() {
    navigator.clipboard.writeText(this.message().text).then(
      () => {
        this.justCopied.set(true);
        this.notification.success('Copied to clipboard.');
        setTimeout(() => this.justCopied.set(false), 2000);
      },
      () => this.notification.error('Failed to copy.'),
    );
  }

  onLike() {
    this.toggleFeedback('LIKE');
  }

  onDislike() {
    this.toggleFeedback('DISLIKE');
  }

  private toggleFeedback(value: 'LIKE' | 'DISLIKE') {
    const messageId = this.message().id;
    if (!messageId) {
      return;
    }

    const newValue = this.feedback() === value ? null : value;
    this.feedback.set(newValue);

    this.messageApi.setFeedback(messageId, newValue).subscribe({
      error: (err) => console.error('Failed to save feedback:', err),
    });
  }

  onRegenerate() {
    this.regenerate.emit();
  }

  startEdit() {
    this.editText = this.message().text;
    this.isEditing.set(true);
  }

  cancelEdit() {
    this.isEditing.set(false);
  }

  confirmEdit() {
    if (this.editText.trim()) {
      this.edit.emit(this.editText.trim());
    }
    this.isEditing.set(false);
  }
}
