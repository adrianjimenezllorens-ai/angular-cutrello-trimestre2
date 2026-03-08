import { Routes } from '@angular/router';
import { leavePageGuard } from '../shared/guards/leave-page-guard';
import { logoutActivateGuard } from '../shared/guards/logout-activate-guard';

export const authRoutes: Routes = [
  {
    path: 'login',
    canActivate: [logoutActivateGuard],
    loadComponent: () => import('./login-page/login-page').then((m) => m.LoginPage),
    title: 'Login | Angular Cutrello',
  },
  {
    path: 'register',
    canActivate: [logoutActivateGuard],
    canDeactivate: [leavePageGuard],
    loadComponent: () => import('./register-page/register-page').then((m) => m.RegisterPage),
    title: 'Registro | Angular Cutrello',
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];