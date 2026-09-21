import { Component, inject, computed } from '@angular/core';
import { DocumentUpload } from '../../core/services/document-upload';
import { ConversationState } from '../../core/services/conversation-state';
import { DocumentPreview } from '../../core/services/document-preview';
import { UploadedDocument } from '../../shared/models/uploaded-document';

@Component({
  selector: 'app-sources-panel',
  imports: [],
  templateUrl: './sources-panel.html',
  styleUrl: './sources-panel.css',
})
export class SourcesPanel {
  documentUpload = inject(DocumentUpload);
  documentPreview = inject(DocumentPreview);
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
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  formatResponseTime(ms: number): string {
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
  }

  openDocument(doc: UploadedDocument) {
    if (!doc.previewable) return;
    this.documentPreview.openById(doc.id, doc.fileName);
  }
}
