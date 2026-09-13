import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConversationState } from '../../../core/services/conversation-state';
import { DocumentUpload } from '../../../core/services/document-upload';
import { Notification } from '../../../core/services/notification';

@Component({
  selector: 'app-chat-input',
  imports: [FormsModule],
  templateUrl: './chat-input.html',
  styleUrl: './chat-input.css',
})
export class ChatInput {
  conversation = inject(ConversationState);
  private documentUpload = inject(DocumentUpload);
  private notification = inject(Notification);
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

    const alreadyUploaded = this.documentUpload
      .uploadedDocuments()
      .some((doc) => doc.fileName.toLowerCase() === file.name.toLowerCase());

    if (alreadyUploaded) {
      this.notification.error(`"${file.name}" has already been uploaded.`);
      input.value = '';
      return;
    }

    this.documentUpload.uploadFile(file).subscribe({
      next: (response) => {
        this.notification.success(
          `"${response.fileName}" uploaded successfully (${response.chunksIndexed} chunk(s) indexed).`,
        );
      },
      error: (err) => {
        const message =
          typeof err.error === 'string'
            ? err.error
            : `Failed to upload "${file.name}". Please try again.`;
        this.notification.error(message);
      },
    });

    input.value = '';
  }
}
