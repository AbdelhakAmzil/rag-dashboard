import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { IngestResponse } from '../../shared/models/ingest-response';
import { UploadedDocument } from '../../shared/models/uploaded-document';
import { DocumentApi } from './document-api';

@Injectable({
  providedIn: 'root',
})
export class DocumentUpload {
  private http = inject(HttpClient);
  private documentApi = inject(DocumentApi);
  private apiUrl = '/api/documents/upload';

  uploadedDocuments = signal<UploadedDocument[]>([]);

  constructor() {
    this.refreshDocuments();
  }

  refreshDocuments() {
    this.documentApi.list().subscribe({
      next: (docs) => this.uploadedDocuments.set(docs),
      error: (err) => console.error('Failed to load documents:', err),
    });
  }

  uploadFile(file: File): Observable<IngestResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http
      .post<IngestResponse>(this.apiUrl, formData)
      .pipe(tap(() => this.refreshDocuments()));
  }
}
