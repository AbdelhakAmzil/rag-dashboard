import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UploadedDocument } from '../../shared/models/uploaded-document';

@Injectable({
  providedIn: 'root',
})
export class DocumentApi {
  private http = inject(HttpClient);
  private apiUrl = '/api/documents';

  list(): Observable<UploadedDocument[]> {
    return this.http.get<UploadedDocument[]>(this.apiUrl);
  }
}
