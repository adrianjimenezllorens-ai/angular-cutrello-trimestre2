import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { email, FormField, form, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { FbLogin } from '../../facebook-login/fb-login';
import { GoogleLogin } from '../../google-login/google-login';
import { AuthService, UserLogin } from '../../tasks/services/auth.service';

@Component({
  selector: 'login-page',
  imports: [FormField, RouterLink, GoogleLogin, FbLogin],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  #router = inject(Router);
  #authService = inject(AuthService);

  errorMessage = signal('');

  loginData = signal<UserLogin>({
    email: '',
    password: '',
  });

  loginForm = form(this.loginData, (schema) => {
    required(schema.email, { message: 'El email es obligatorio' });
    email(schema.email, { message: 'El email no es válido' });
    required(schema.password, { message: 'La contraseña es obligatoria' });
  });

  login(event: Event) {
    event.preventDefault();
    this.errorMessage.set('');

    if (this.loginForm().invalid()) {
      return;
    }

    this.#authService.login(this.loginData()).subscribe({
      next: () => {
        this.#router.navigate(['/tasks']);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(
          error.error?.message ?? 'No se ha podido iniciar sesión'
        );
      },
    });
  }

  loggedGoogle(event: google.accounts.id.CredentialResponse) {
    this.errorMessage.set('');

    this.#authService.loginGoogle(event.credential).subscribe({
      next: () => {
        this.#router.navigate(['/tasks']);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(
          error.error?.message ?? 'No se ha podido iniciar sesión con Google'
        );
      },
    });
  }

  loggedFacebook(event: fb.StatusResponse) {
    this.errorMessage.set('');

    this.#authService.loginFacebook(event.authResponse!.accessToken!).subscribe({
      next: () => {
        this.#router.navigate(['/tasks']);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(
          error.error?.message ?? 'No se ha podido iniciar sesión con Facebook'
        );
      },
    });
  }

  showFacebookError(message: string) {
    this.errorMessage.set(message);
  }
}