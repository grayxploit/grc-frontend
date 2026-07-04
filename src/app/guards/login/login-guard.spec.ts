import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from '../../services/auth/auth.service';
import { loginGuard } from './login-guard';

describe('loginGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => loginGuard(...guardParameters));

  let routerMock: jasmine.SpyObj<Router>;
  let authServiceMock: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    routerMock = jasmine.createSpyObj<Router>('Router', ['parseUrl']);
    authServiceMock = jasmine.createSpyObj<AuthService>('AuthService', ['initializeAuth']);
    authServiceMock.initializeAuth.and.returnValue(of(true));

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
  });

  it('redirects authenticated users to the dashboard', (done) => {
    const redirectUrlTree = { url: '/dashboard' } as any;
    routerMock.parseUrl.and.returnValue(redirectUrlTree);

    executeGuard({}, {} as any).subscribe((result) => {
      expect(authServiceMock.initializeAuth).toHaveBeenCalled();
      expect(routerMock.parseUrl).toHaveBeenCalledWith('/dashboard');
      expect(result).toBe(redirectUrlTree);
      done();
    });
  });
});
