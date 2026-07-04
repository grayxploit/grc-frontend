import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';

import { ApiService } from '../api/api.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let apiService: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    apiService = jasmine.createSpyObj<ApiService>('ApiService', ['post']);

    TestBed.configureTestingModule({
      providers: [{ provide: ApiService, useValue: apiService }],
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should preserve the original API error payload on login failure', () => {
    const apiError = {
      status: 401,
      error: {
        success: false,
        message: 'Invalid credentials',
        data: null,
        error: 'Authentication failed',
      },
    };

    apiService.post.and.returnValue(throwError(() => apiError));

    service.login({ email: 'user@example.com', password: 'password123' }).subscribe({
      next: () => fail('Expected login to fail'),
      error: (error) => {
        expect(error).toBe(apiError);
      },
    });
  });
});
