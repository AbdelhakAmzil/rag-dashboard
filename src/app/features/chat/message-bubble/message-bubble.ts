import { Component, input, computed, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { Message } from '../../../shared/models/message';
import { SourceCard } from '../source-card/source-card';

@Component({
  selector: 'app-message-bubble',
  imports: [SourceCard],
  templateUrl: './message-bubble.html',
  styleUrl: './message-bubble.css',
})
export class MessageBubble {
  message = input.required<Message>();

  private sanitizer = inject(DomSanitizer);

  renderedText = computed<SafeHtml>(() => {
    const raw = this.message().text;
    const html = marked.parse(raw, { breaks: true }) as string;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });
}
