import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from '../../services/auth/auth.service';
import { roleGuard } from './role-guard';

describe('roleGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => roleGuard(['admin'])(...guardParameters));

  let routerMock: jasmine.SpyObj<Router>;
  let authServiceMock: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    routerMock = jasmine.createSpyObj<Router>('Router', ['parseUrl']);
    authServiceMock = jasmine.createSpyObj<AuthService>('AuthService', ['initializeAuth']);
    authServiceMock.initializeAuth.and.returnValue(of(true));
    (authServiceMock as any).authUser = jasmine.createSpy().and.returnValue({ role: 'admin' });

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
  });

  it('allows access when the user role matches', (done) => {
    executeGuard({}, {} as any).subscribe((result) => {
      expect(authServiceMock.initializeAuth).toHaveBeenCalled();
      expect(result).toBe(true);
      done();
    });
  });

  it('redirects when the user role does not match', (done) => {
    (authServiceMock as any).authUser = jasmine.createSpy().and.returnValue({ role: 'user' });
    const redirectUrlTree = { url: '/dashboard' } as any;
    routerMock.parseUrl.and.returnValue(redirectUrlTree);

    executeGuard({}, {} as any).subscribe((result) => {
      expect(routerMock.parseUrl).toHaveBeenCalledWith('/dashboard');
      expect(result).toBe(redirectUrlTree);
      done();
    });
  });
});
