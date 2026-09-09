import { Injectable, inject, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { IngestResponse } from '../../shared/models/ingest-response';
import { UploadedDocument } from '../../shared/models/uploaded-document';

@Injectable({
  providedIn: 'root',
})
export class DocumentUpload {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/documents/upload';
  private readonly storageKey = 'rag-chatbot-uploaded-documents';

  uploadedDocuments = signal<UploadedDocument[]>(this.loadFromStorage());

  constructor() {
    effect(() => {
      localStorage.setItem(this.storageKey, JSON.stringify(this.uploadedDocuments()));
    });
  }

  uploadFile(file: File): Observable<IngestResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<IngestResponse>(this.apiUrl, formData).pipe(
      tap((response) => {
        this.uploadedDocuments.update((current) => [
          ...current,
          {
            fileName: response.fileName,
            chunksIndexed: response.chunksIndexed,
            uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }),
    );
  }

  private loadFromStorage(): UploadedDocument[] {
    const saved = localStorage.getItem(this.storageKey);

    if (saved) {
      try {
        return JSON.parse(saved) as UploadedDocument[];
      } catch (err) {
        console.error('Failed to parse saved documents:', err);
      }
    }

    return [];
  }
}
