import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Directive,
  ElementRef,
  inject,
  output,
  PLATFORM_ID,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoadGoogleApi } from './load-google-api';

@Directive({
  selector: '[googleLogin]',
})
export class GoogleLogin {
  #element = inject(ElementRef<HTMLElement>);
  platformId = inject(PLATFORM_ID);
  #loadService = isPlatformBrowser(this.platformId) ? inject(LoadGoogleApi) : null;
  login = output<google.accounts.id.CredentialResponse>();

  constructor() {
    afterNextRender(() => this.#loadService?.setGoogleBtn(this.#element.nativeElement));

    this.#loadService?.credential$
      .pipe(takeUntilDestroyed())
      .subscribe((resp) => this.login.emit(resp));
  }
}