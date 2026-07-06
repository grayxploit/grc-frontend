import { isPlatformServer } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { inject, PLATFORM_ID } from '@angular/core';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const platformId = inject(PLATFORM_ID);
  if (isPlatformServer(platformId)) {
    console.log('AuthGuard: Server-side rendering detected, bypassing auth check');
    return true;
  }
  const authService = inject(AuthService);
  const router = inject(Router);
  // Try to initialize/refresh tokens on app load. Return Observable<boolean|UrlTree>
  return authService.initializeAuth().pipe(
    map((isAuth) => {
      console.log('AuthGuard: isAuthenticated after initialization', isAuth);
      if (!isAuth) {
        return router.parseUrl('/login');
      }

      const user = authService.authUser();
      const isAdminWithNoOrg = user?.role?.toLowerCase() === 'admin' && user.organization == null;

      if (isAdminWithNoOrg && state.url !== '/create-organization') {
        return router.parseUrl('/create-organization');
      }

      return true;
    })
  );
};
