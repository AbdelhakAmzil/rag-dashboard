import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConversationState } from '../../../core/services/conversation-state';
import { DocumentUpload } from '../../../core/services/document-upload';

@Component({
  selector: 'app-chat-input',
  imports: [FormsModule],
  templateUrl: './chat-input.html',
  styleUrl: './chat-input.css',
})
export class ChatInput {
  conversation = inject(ConversationState);
  private documentUpload = inject(DocumentUpload);
  questionText = '';

  onSend() {
    if (!this.questionText.trim()) {
      return;
    }
    this.conversation.sendQuestion(this.questionText);
    this.questionText = '';
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.documentUpload.uploadFile(file).subscribe({
      next: (response) => {
        this.conversation.addMessage({
          role: 'assistant',
          text: `✅ File "${response.fileName}" uploaded successfully (${response.chunksIndexed} chunk(s) indexed). You can now ask questions about it.`,
          timestamp: this.conversation.getCurrentTime(),
        });
      },
      error: (err) => {
        console.error('Upload error:', err);
        this.conversation.addMessage({
          role: 'assistant',
          text: `❌ Failed to upload "${file.name}". Please try again.`,
          timestamp: this.conversation.getCurrentTime(),
        });
      },
    });

    input.value = '';
  }
}
