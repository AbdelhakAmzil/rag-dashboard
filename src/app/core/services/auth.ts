import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

interface AuthResponse {
  token: string;
  username: string;
  email: string;
}

const TOKEN_KEY = 'rag_auth_token';
const USERNAME_KEY = 'rag_auth_username';

@Injectable({ providedIn: 'root' })
export class Auth {
  private http = inject(HttpClient);
  private router = inject(Router);

  currentUsername = signal<string | null>(localStorage.getItem(USERNAME_KEY));

  isAuthenticated(): boolean {
    if (this.isTokenValid()) {
      return true;
    }

    // Token absent ou expiré : on nettoie la session locale
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    this.currentUsername.set(null);
    return false;
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  register(username: string, email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>('/api/auth/register', { username, email, password })
      .pipe(tap((res) => this.storeSession(res)));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>('/api/auth/login', { email, password })
      .pipe(tap((res) => this.storeSession(res)));
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    this.currentUsername.set(null);
    this.router.navigate(['/login']);
  }

  private storeSession(res: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USERNAME_KEY, res.username);
    this.currentUsername.set(res.username);
  }

  private decodeToken(token: string): { exp: number } | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch {
      return null;
    }
  }

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return false;
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);
    return decoded.exp > nowInSeconds;
  }
}
