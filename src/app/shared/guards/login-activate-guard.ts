import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../../tasks/services/auth.service';

export const loginActivateGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLogged().pipe(
    map((logged) => (logged ? true : router.createUrlTree(['/auth/login'])))
  );
};