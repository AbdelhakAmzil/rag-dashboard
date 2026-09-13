import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  type: 'success' | 'error';
  title: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class Notification {
  toasts = signal<Toast[]>([]);
  private nextId = 0;

  success(message: string, title = 'Success!') {
    this.show('success', title, message);
  }

  error(message: string, title = 'Failure') {
    this.show('error', title, message);
  }

  dismiss(id: number) {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }

  private show(type: 'success' | 'error', title: string, message: string) {
    const id = this.nextId++;
    this.toasts.update((current) => [...current, { id, type, title, message }]);
    setTimeout(() => this.dismiss(id), 4000);
  }
}
