import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'dashboard',
    renderMode: RenderMode.Client
  },
  {
    path: 'controls-management',
    renderMode: RenderMode.Client
  },
  {
    path: 'profile',
    renderMode: RenderMode.Client
  },
  {
    path: 'control-types-management',
    renderMode: RenderMode.Client
  },
  {
    path: 'frameworks-management',
    renderMode: RenderMode.Client
  },

  {
    path: 'framework-categories-management',
    renderMode: RenderMode.Client
  },
  {
    path: 'organizations',
    renderMode: RenderMode.Client
  },
  {
    path: 'verify-email/:token',
    renderMode: RenderMode.Client
  },
  {
    path: 'reset-password/:token',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
