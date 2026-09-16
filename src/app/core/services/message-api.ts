import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatResponse } from '../../shared/models/chat-response';

@Injectable({ providedIn: 'root' })
export class MessageApi {
  private http = inject(HttpClient);
  private apiUrl = '/api/messages';

  setFeedback(messageId: string, feedback: 'LIKE' | 'DISLIKE' | null): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${messageId}/feedback`, {
      feedback: feedback ?? '',
    });
  }

  regenerate(messageId: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/${messageId}/regenerate`, {});
  }

  editMessage(messageId: string, content: string): Observable<ChatResponse> {
    return this.http.patch<ChatResponse>(`${this.apiUrl}/${messageId}`, { content });
  }
}
