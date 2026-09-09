import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatRequest } from '../../shared/models/chat-request';
import { ChatResponse } from '../../shared/models/chat-response';

@Injectable({
  providedIn: 'root',
})
export class Chat {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/chat';

  askQuestion(question: string): Observable<ChatResponse> {
    const request: ChatRequest = { question };
    return this.http.post<ChatResponse>(this.apiUrl, request);
  }
}
