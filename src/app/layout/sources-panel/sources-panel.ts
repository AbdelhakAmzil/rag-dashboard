import { Component, inject, computed } from '@angular/core';
import { DocumentUpload } from '../../core/services/document-upload';
import { ConversationState } from '../../core/services/conversation-state';

@Component({
  selector: 'app-sources-panel',
  imports: [],
  templateUrl: './sources-panel.html',
  styleUrl: './sources-panel.css',
})
export class SourcesPanel {
  documentUpload = inject(DocumentUpload);
  private conversation = inject(ConversationState);

  lastAssistantMessage = computed(() => {
    const messages = this.conversation.messages();
    return [...messages].reverse().find((m) => m.role === 'assistant');
  });

  getFileIcon(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return '📄';
      case 'docx':
        return '📃';
      case 'txt':
        return '📝';
      case 'html':
        return '🌐';
      default:
        return '📁';
    }
  }

  getFileIconClass(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return `icon-${ext ?? 'default'}`;
  }

  formatUploadedAt(iso: string): string {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatResponseTime(ms: number): string {
    return (ms / 1000).toFixed(1);
  }
}
