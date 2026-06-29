import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'dashboard',
    renderMode: RenderMode.Client
  },
  {
    path: 'controls',
    renderMode: RenderMode.Client
  },
  {
    path: 'control-create',
    renderMode: RenderMode.Client
  },
  {
    path: 'control-import',
    renderMode: RenderMode.Client
  },
  {
    path: 'frameworks',
    renderMode: RenderMode.Client
  },

  {
    path: 'framework-categories',
    renderMode: RenderMode.Client
  },

  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
