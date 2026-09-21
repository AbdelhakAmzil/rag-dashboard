import { Injectable, signal, inject } from '@angular/core';
import { DocumentApi } from './document-api';

export interface PreviewState {
  id: string;
  fileName: string;
  kind: 'pdf' | 'text' | 'html' | 'other';
  objectUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class DocumentPreview {
  private documentApi = inject(DocumentApi);

  current = signal<PreviewState | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  /** Ouvre depuis la liste "Uploaded Documents" (on a déjà l'id). */
  openById(id: string, fileName: string) {
    this.load(id, fileName);
  }

  /** Ouvre depuis une source de réponse (on n'a qu'un nom de fichier). */
  openByFileName(fileName: string) {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.documentApi.getByFileName(fileName).subscribe({
      next: (doc) => {
        if (!doc.previewable) {
          this.isLoading.set(false);
          this.errorMessage.set('No preview available for this document.');
          return;
        }
        this.load(doc.id, doc.fileName);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Unable to load this document.');
      },
    });
  }

  close() {
    const state = this.current();
    if (state) {
      URL.revokeObjectURL(state.objectUrl);
    }
    this.current.set(null);
    this.errorMessage.set(null);
  }

  private load(id: string, fileName: string) {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.documentApi.getContentBlob(id).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        this.current.set({ id, fileName, kind: this.guessKind(fileName), objectUrl });
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Unable to load this document.');
      },
    });
  }

  private guessKind(fileName: string): 'pdf' | 'text' | 'html' | 'other' {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (ext === 'txt') return 'text';
    if (ext === 'html' || ext === 'htm') return 'html';
    return 'other'; // docx, etc. — pas de rendu natif navigateur
  }
}
