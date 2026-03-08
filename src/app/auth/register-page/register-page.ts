import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { email, FormField, form, minLength, required, validate } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { EncodeBase64 } from '../../shared/directives/encode-base64';
import { CanComponentDeactivate } from '../../shared/guards/leave-page-guard';
import { AuthService, UserRegister } from '../../tasks/services/auth.service';

type RegisterFormData = UserRegister & {
  passwordConfirm: string;
};

@Component({
  selector: 'register-page',
  imports: [FormField, RouterLink, EncodeBase64],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage implements CanComponentDeactivate {
  #router = inject(Router);
  #authService = inject(AuthService);

  saved = false;
  errorMessage = signal('');

  registerData = signal<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    avatar: '',
  });

  registerForm = form(this.registerData, (schema) => {
    required(schema.name, { message: 'El nombre es obligatorio' });
    required(schema.email, { message: 'El email es obligatorio' });
    email(schema.email, { message: 'El email no es válido' });
    required(schema.password, { message: 'La contraseña es obligatoria' });
    minLength(schema.password, 4, {
      message: 'La contraseña debe tener al menos 4 caracteres',
    });
    required(schema.passwordConfirm, {
      message: 'Debes repetir la contraseña',
    });
    validate(schema.passwordConfirm, ({ value }) => {
      if (value() && value() !== this.registerData().password) {
        return {
          kind: 'passwordMatch',
          message: 'Las contraseñas no coinciden',
        };
      }
      return null;
    });
  });

  register(event: Event) {
    event.preventDefault();
    this.errorMessage.set('');

    if (this.registerForm().invalid()) {
      return;
    }

    const { passwordConfirm, ...userData } = this.registerData();

    this.#authService.register(userData).subscribe({
      next: () => {
        this.saved = true;
        this.#router.navigate(['/auth/login']);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(
          error.error?.message ?? 'No se ha podido completar el registro'
        );
      },
    });
  }

  canDeactivate() {
    return this.saved || !this.registerForm().dirty() || confirm('¿Quieres salir sin guardar?');
  }
}