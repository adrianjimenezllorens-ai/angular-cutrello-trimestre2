import { Routes } from '@angular/router';
import { loginActivateGuard } from '../shared/guards/login-activate-guard';
import { numericIdGuard } from '../shared/guards/numeric-id-guard';

export const profileRoutes: Routes = [
  {
    path: '',
    canActivate: [loginActivateGuard],
    loadComponent: () => import('./profile-page/profile-page').then((m) => m.ProfilePage),
    title: 'Mi Perfil | Angular Cutrello',
  },
  {
    path: ':id',
    canActivate: [loginActivateGuard, numericIdGuard],
    loadComponent: () => import('./profile-page/profile-page').then((m) => m.ProfilePage),
    title: 'Perfil | Angular Cutrello',
  },
];