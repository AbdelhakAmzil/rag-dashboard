import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConversationSummary } from '../../shared/models/conversation-summary';
import { ConversationDetail } from '../../shared/models/conversation-detail';

@Injectable({
  providedIn: 'root',
})
export class ConversationApi {
  private http = inject(HttpClient);
  private apiUrl = '/api/conversations';

  list(): Observable<ConversationSummary[]> {
    return this.http.get<ConversationSummary[]>(this.apiUrl);
  }

  get(id: string): Observable<ConversationDetail> {
    return this.http.get<ConversationDetail>(`${this.apiUrl}/${id}`);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
