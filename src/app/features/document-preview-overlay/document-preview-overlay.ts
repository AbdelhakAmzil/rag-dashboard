import { Component, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DocumentPreview } from '../../core/services/document-preview';

@Component({
  selector: 'app-document-preview-overlay',
  imports: [],
  templateUrl: './document-preview-overlay.html',
  styleUrl: './document-preview-overlay.css',
})
export class DocumentPreviewOverlay {
  preview = inject(DocumentPreview);
  private sanitizer = inject(DomSanitizer);

  get safeUrl(): SafeResourceUrl | null {
    const state = this.preview.current();
    if (!state) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(state.objectUrl);
  }

  close() {
    this.preview.close();
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) this.close();
  }
}
