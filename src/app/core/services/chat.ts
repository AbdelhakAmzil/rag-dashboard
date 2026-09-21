import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatResponse } from '../../shared/models/chat-response';
import { Auth } from '../services/auth';

export interface ChatStreamEvent {
  type: 'chunk' | 'done';
  data: string | ChatResponse;
}

@Injectable({ providedIn: 'root' })
export class Chat {
  private auth = inject(Auth);
  private http = inject(HttpClient);
  private apiUrl = '/api/chat/stream';
  private visionUrl = '/api/chat/vision';

  streamQuestion(
    question: string,
    conversationId: string | null,
    model: string = 'ollama',
  ): Observable<ChatStreamEvent> {
    return new Observable<ChatStreamEvent>((subscriber) => {
      const controller = new AbortController();
      const token = this.auth.getToken();

      fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ question, conversationId, model }),
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok || !response.body) {
            subscriber.error(new Error(`HTTP ${response.status}`));
            return;
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const events = buffer.split('\n\n');
            buffer = events.pop() ?? '';

            for (const rawEvent of events) {
              let eventName = 'message';
              const dataLines: string[] = [];

              for (const line of rawEvent.split('\n')) {
                if (line.startsWith('event:')) {
                  eventName = line.slice(6).trim();
                } else if (line.startsWith('data:')) {
                  dataLines.push(line.slice(5));
                }
              }

              const data = dataLines.join('\n');
              if (!data) continue;

              if (eventName === 'chunk') {
                subscriber.next({ type: 'chunk', data });
              } else if (eventName === 'done') {
                subscriber.next({ type: 'done', data: JSON.parse(data) as ChatResponse });
              }
            }
          }

          subscriber.complete();
        })
        .catch((err) => {
          if (err.name !== 'AbortError') subscriber.error(err);
        });

      return () => controller.abort();
    });
  }


  askWithImage(
    question: string,
    image: File,
    conversationId: string | null,
  ): Observable<ChatResponse> {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('question', question);
    if (conversationId) {
      formData.append('conversationId', conversationId);
    }
    return this.http.post<ChatResponse>(this.visionUrl, formData);
  }

  getMessageImage(messageId: string): Observable<Blob> {
    return this.http.get(`/api/chat/messages/${messageId}/image`, { responseType: 'blob' });
  }
}
