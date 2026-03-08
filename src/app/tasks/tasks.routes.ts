import { Routes } from '@angular/router';
import { loginActivateGuard } from '../shared/guards/login-activate-guard';
import { leavePageGuard } from '../shared/guards/leave-page-guard';
import { numericIdGuard } from '../shared/guards/numeric-id-guard';

export const tasksRoutes: Routes = [
  {
    path: '',
    canActivate: [loginActivateGuard],
    loadComponent: () => import('./tasks-page/tasks-page').then((m) => m.TasksPage),
    title: 'Listas de Tareas | Angular Cutrello',
  },
  {
    path: 'add',
    canActivate: [loginActivateGuard],
    canDeactivate: [leavePageGuard],
    loadComponent: () => import('./task-form/task-form').then((m) => m.TaskForm),
    title: 'Añadir Tarea | Angular Cutrello',
  },
  {
    path: 'edit/:id',
    canActivate: [loginActivateGuard, numericIdGuard],
    canDeactivate: [leavePageGuard],
    loadComponent: () => import('./task-form/task-form').then((m) => m.TaskForm),
    title: 'Editar Tarea | Angular Cutrello',
  },
  {
    path: ':id',
    canActivate: [loginActivateGuard, numericIdGuard],
    loadComponent: () => import('./task-detail/task-detail').then((m) => m.TaskDetail),
  },
];