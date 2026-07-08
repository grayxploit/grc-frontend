import { isPlatformServer } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';

export const loginGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  if (isPlatformServer(platformId)) {
    console.log('AuthGuard: Server-side rendering detected, bypassing auth check');
    return true;
  }

  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.initializeAuth().pipe(
    map((isAuth) => {
      console.log('AuthGuard: isAuthenticated after initialization', isAuth);
      if (!isAuth) {
        return true;
      }

      const user = authService.authUser();
      const isAdminWithNoOrg = user?.role?.toLowerCase() === 'admin' && user.organization == null;

      if (isAdminWithNoOrg) {
        return router.parseUrl('/organizations');
      }

      return router.parseUrl('/dashboard');
    })

  );
};
