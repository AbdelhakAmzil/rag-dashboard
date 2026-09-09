import { Component, input } from '@angular/core';
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
}
