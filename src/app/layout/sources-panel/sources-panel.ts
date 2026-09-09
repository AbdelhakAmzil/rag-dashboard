import { Component, inject } from '@angular/core';
import { DocumentUpload } from '../../core/services/document-upload';

@Component({
  selector: 'app-sources-panel',
  imports: [],
  templateUrl: './sources-panel.html',
  styleUrl: './sources-panel.css',
})
export class SourcesPanel {
  documentUpload = inject(DocumentUpload);

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
}
