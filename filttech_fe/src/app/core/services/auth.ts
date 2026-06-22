import { Injectable, inject, signal } from '@angular/core';
import { ManageProfile, ProfileDetailsResponse } from './manage-profile';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  manageProfile = inject(ManageProfile);

  private tokenKey = 'access_token';
  private profileKey = 'profile';
  isAuthenticated = signal(this.hasToken());
  profile = signal<Record<string, unknown> | null>(null);

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/login', credentials).pipe(
      tap((response) => {
        if (response.access_token) {
          this.setToken(response.access_token);
          this.scheduleTokenRefresh(response.access_token, response.expires_in);
        }
      })
    );
  }

  private refreshTimeoutId: number | null = null;

  constructor() {
    const stored = this.getStoredProfile();
    this.profile.set(stored);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.isAuthenticated.set(true);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isTokenExpired(token: string): boolean {
    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) {
        return true;
      }

      const decoded = JSON.parse(atob(payloadPart));
      const exp = typeof decoded.exp === 'number' ? decoded.exp : null;
      if (!exp) {
        return true;
      }

      const nowInSeconds = Math.floor(Date.now() / 1000);
      return exp <= nowInSeconds;
    } catch {
      return false;
    }
  }

  getValidToken(): string | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    if (this.isTokenExpired(token)) {
      this.removeToken();
      return null;
    }

    return token;
  }

  /** Call this on app start to restore refresh schedule from existing token */
  initializeTokenRefresh(): void {
    const token = this.getToken();
    if (!token) {
      return;
    }

    // If token is already expired or invalid, remove it and stop
    if (this.isTokenExpired(token)) {
      this.removeToken();
      return;
    }

    // Token is valid. Compute remaining seconds from its exp claim.
    try {
      const payloadPart = token.split('.')[1];
      const decoded = JSON.parse(atob(payloadPart));
      const exp = typeof decoded.exp === 'number' ? decoded.exp : null;
      if (!exp) {
        return;
      }

      const nowInSeconds = Math.floor(Date.now() / 1000);
      const remainingSeconds = exp - nowInSeconds;
      if (remainingSeconds <= 0) {
        this.removeToken();
        return;
      }

      this.scheduleTokenRefresh(token, remainingSeconds);
    } catch {
      this.removeToken();
    }
  }

  private scheduleTokenRefresh(token: string, expiresInSeconds: number): void {
    if (this.refreshTimeoutId !== null) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }

    const refreshDelayMs = Math.max((expiresInSeconds - 30) * 1000, 0);

    this.refreshTimeoutId = window.setTimeout(() => {
      this.refreshToken().subscribe({
        next: (response) => {
          if (response.access_token) {
            this.setToken(response.access_token);
            this.scheduleTokenRefresh(response.access_token, response.expires_in);
          }
        },
        error: () => {
          this.removeToken();
        },
      });
    }, refreshDelayMs);
  }

  private refreshToken(): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/refresh', {});
  }

  removeToken(): void {
    localStorage.removeItem(this.tokenKey);

    localStorage.removeItem(this.profileKey);
    this.isAuthenticated.set(false);
    this.profile.set(null);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  logout(): void {
    this.removeToken();
  }

  setProfile(profile: ProfileDetailsResponse): void {
    // Store only needed fields plus roles
    const toStore = {
      id: profile.id,
      username: profile.username,
      profile_photo_url: profile.profile_photo_url,
      profile_image: profile.profile_image,
      roles: Array.isArray(profile.roles)
        ? profile.roles.map((r) => ({ uuid: r.uuid, name: r.name }))
        : [],
    } as const;
    try {
      localStorage.setItem(this.profileKey, JSON.stringify(toStore));
      this.profile.set(this.getStoredProfile());
    } catch {
      // ignore storage errors
    }
  }

  getStoredProfile(): Record<string, unknown> | null {
    const raw = localStorage.getItem(this.profileKey);
    if (!raw) return null;
    try {
      const parsed: unknown = JSON.parse(raw);
      return typeof parsed === 'object' && parsed !== null
        ? (parsed as Record<string, unknown>)
        : null;
    } catch {
      return null;
    }
  }

  getRolesFromStoredProfile(): string[] {
    const profile = this.getStoredProfile();
    if (!profile) return [];
    const roles = profile['roles'];
    const names: string[] = [];
    if (Array.isArray(roles)) {
      for (const r of roles) {
        if (typeof r === 'object' && r !== null) {
          const name = (r as Record<string, unknown>)['name'];
          if (typeof name === 'string') names.push(name.toLowerCase());
        }
      }
    }
    return names;
  }
}
