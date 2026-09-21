import { Component, inject, signal } from '@angular/core';
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
  selectedModel: 'ollama' | 'gemini' = 'ollama';

  attachedImage = signal<File | null>(null);
  attachedImagePreview = signal<string | null>(null);

  onSend() {
    const image = this.attachedImage();

    if (image) {
      this.conversation.sendImageQuestion(this.questionText, image);
      this.clearAttachedImage();
      this.questionText = '';
      return;
    }

    if (!this.questionText.trim()) {
      return;
    }
    this.conversation.sendQuestion(this.questionText, this.selectedModel);
    this.questionText = '';
  }

  onEnterKey(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey) {
      keyboardEvent.preventDefault();
      this.onSend();
    }
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.notification.error('Please select an image file.');
      return;
    }

    this.clearAttachedImage();
    this.attachedImage.set(file);
    this.attachedImagePreview.set(URL.createObjectURL(file));
  }

  removeAttachedImage() {
    this.clearAttachedImage();
  }

  private clearAttachedImage() {
    const preview = this.attachedImagePreview();
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    this.attachedImage.set(null);
    this.attachedImagePreview.set(null);
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

  onStop() {
    this.conversation.stopGenerating();
  }
}
