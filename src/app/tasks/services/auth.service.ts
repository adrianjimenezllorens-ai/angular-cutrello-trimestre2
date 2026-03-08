import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserRegister {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

interface TokenResponse {
  accessToken: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  #http = inject(HttpClient);
  #logged = signal(false);
  #tokenKey = 'token';

  get logged() {
    return this.#logged.asReadonly();
  }

  login(data: UserLogin): Observable<void> {
    return this.#http.post<TokenResponse>('auth/login', data).pipe(
      tap((resp) => {
        localStorage.setItem(this.#tokenKey, resp.accessToken);
        this.#logged.set(true);
      }),
      map(() => void 0),
    );
  }

  register(data: UserRegister): Observable<void> {
    return this.#http.post<void>('auth/register', data);
  }

  loginGoogle(token: string): Observable<void> {
    return this.#http.post<TokenResponse>('auth/google', { token }).pipe(
      tap((resp) => {
        localStorage.setItem(this.#tokenKey, resp.accessToken);
        this.#logged.set(true);
      }),
      map(() => void 0),
    );
  }

  loginFacebook(token: string): Observable<void> {
    return this.#http.post<TokenResponse>('auth/facebook', { token }).pipe(
      tap((resp) => {
        localStorage.setItem(this.#tokenKey, resp.accessToken);
        this.#logged.set(true);
      }),
      map(() => void 0),
    );
  }

  logout(): void {
    localStorage.removeItem(this.#tokenKey);
    this.#logged.set(false);
  }

  isLogged(): Observable<boolean> {
    if (!this.#logged() && !this.getToken()) {
      return of(false);
    }

    if (this.#logged()) {
      return of(true);
    }

    return this.#http.get<void>('auth/validate').pipe(
      map(() => {
        this.#logged.set(true);
        return true;
      }),
      catchError(() => {
        localStorage.removeItem(this.#tokenKey);
        this.#logged.set(false);
        return of(false);
      }),
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.#tokenKey);
  }
}