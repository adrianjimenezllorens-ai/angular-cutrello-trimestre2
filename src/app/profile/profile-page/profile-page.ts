import { ChangeDetectionStrategy, Component, effect, inject, input, linkedSignal, signal } from '@angular/core';
import { email, FormField, form, minLength, required, validate } from '@angular/forms/signals';
import { Title } from '@angular/platform-browser';
import { EncodeBase64 } from '../../shared/directives/encode-base64';
import { ProfileService, UpdateUserData } from '../../tasks/services/profile-service';

interface PasswordFormData {
  password: string;
  passwordConfirm: string;
}

@Component({
  selector: 'profile-page',
  imports: [FormField, EncodeBase64],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage {
  id = input(0, {
    transform: (value: string | undefined) => Number(value ?? 0),
  });

  #title = inject(Title);
  #profileService = inject(ProfileService);

  showEditProfile = signal(false);
  showChangePassword = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  #profileResource = this.#profileService.getProfileResource(this.id);

  profile = linkedSignal(() =>
    this.#profileResource.hasValue() ? this.#profileResource.value()?.user : undefined
  );

  editProfileData = signal<UpdateUserData>({
    name: '',
    email: '',
  });

  passwordData = signal<PasswordFormData>({
    password: '',
    passwordConfirm: '',
  });

  editProfileForm = form(this.editProfileData, (schema) => {
    required(schema.name, { message: 'El nombre es obligatorio' });
    required(schema.email, { message: 'El email es obligatorio' });
    email(schema.email, { message: 'El email no es válido' });
  });

  passwordForm = form(this.passwordData, (schema) => {
    required(schema.password, { message: 'La contraseña es obligatoria' });
    minLength(schema.password, 4, {
      message: 'La contraseña debe tener al menos 4 caracteres',
    });
    required(schema.passwordConfirm, {
      message: 'Debes repetir la contraseña',
    });
    validate(schema.passwordConfirm, ({ value }) => {
      if (value() && value() !== this.passwordData().password) {
        return {
          kind: 'passwordMatch',
          message: 'Las contraseñas no coinciden',
        };
      }
      return null;
    });
  });

  constructor() {
    effect(() => {
      const user = this.profile();
      if (!user) {
        return;
      }

      this.#title.setTitle(`${user.name} | Angular Cutrello`);
      this.editProfileData.set({
        name: user.name,
        email: user.email,
      });
    });
  }

  toggleEditProfile() {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.showChangePassword.set(false);
    this.showEditProfile.update((value) => !value);

    const user = this.profile();
    if (user) {
      this.editProfileData.set({
        name: user.name,
        email: user.email,
      });
    }
  }

  toggleChangePassword() {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.showEditProfile.set(false);
    this.showChangePassword.update((value) => !value);
    this.passwordData.set({
      password: '',
      passwordConfirm: '',
    });
  }

  cancelEditProfile() {
    this.showEditProfile.set(false);

    const user = this.profile();
    if (user) {
      this.editProfileData.set({
        name: user.name,
        email: user.email,
      });
    }
  }

  cancelChangePassword() {
    this.showChangePassword.set(false);
    this.passwordData.set({
      password: '',
      passwordConfirm: '',
    });
  }

  saveProfile(event: Event) {
    event.preventDefault();
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.editProfileForm().invalid()) {
      return;
    }

    this.#profileService.updateProfile(this.editProfileData()).subscribe({
      next: () => {
        this.profile.update((user) =>
          user
            ? {
                ...user,
                name: this.editProfileData().name,
                email: this.editProfileData().email,
              }
            : user
        );
        this.showEditProfile.set(false);
        this.successMessage.set('Perfil actualizado correctamente');
      },
      error: (error) => {
        this.errorMessage.set(
          error.error?.message ?? 'No se ha podido actualizar el perfil'
        );
      },
    });
  }

  savePassword(event: Event) {
    event.preventDefault();
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.passwordForm().invalid()) {
      return;
    }

    this.#profileService
      .updatePassword({ password: this.passwordData().password })
      .subscribe({
        next: () => {
          this.showChangePassword.set(false);
          this.passwordData.set({
            password: '',
            passwordConfirm: '',
          });
          this.successMessage.set('Contraseña actualizada correctamente');
        },
        error: (error) => {
          this.errorMessage.set(
            error.error?.message ?? 'No se ha podido actualizar la contraseña'
          );
        },
      });
  }

  changeAvatar(base64: string) {
    this.errorMessage.set('');
    this.successMessage.set('');

    this.#profileService.updateAvatar(base64).subscribe({
      next: (avatar: string) => {
        this.profile.update((user) => (user ? { ...user, avatar } : user));
        this.successMessage.set('Avatar actualizado correctamente');
      },
      error: (error) => {
        this.errorMessage.set(
          error.error?.message ?? 'No se ha podido actualizar el avatar'
        );
      },
    });
  }

  isMine() {
    return !!this.profile()?.me;
  }

  isLoading() {
    return this.#profileResource.isLoading();
  }

  hasError() {
    return !!this.#profileResource.error();
  }
}