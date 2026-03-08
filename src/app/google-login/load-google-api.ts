import { inject, Injectable } from '@angular/core';
import { Subject, firstValueFrom, fromEvent } from 'rxjs';
import { CLIENT_ID } from './google-login.config';

@Injectable({
  providedIn: 'root',
})
export class LoadGoogleApi {
  #loader: Promise<void>;
  #credential$ = new Subject<google.accounts.id.CredentialResponse>();
  #clientId = inject(CLIENT_ID, { optional: true });

  constructor() {
    if (this.#clientId === null) {
      throw new Error(
        'LoadGoogleApi: You must call provideGoogleId in your providers array'
      );
    }
    this.#loader = this.#loadApi();
  }

  get credential$() {
    return this.#credential$.asObservable();
  }

  async setGoogleBtn(btn: HTMLElement) {
    await this.#loader;
    google.accounts.id.renderButton(btn, {
      theme: 'filled_blue',
      size: 'large',
      type: 'standard',
    });
  }

  async #loadApi(): Promise<void> {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    document.body.appendChild(script);

    await firstValueFrom(fromEvent(script, 'load'));

    google.accounts.id.initialize({
      client_id: this.#clientId!,
      callback: (response) => {
        this.#credential$.next(response);
      },
    });
  }
}