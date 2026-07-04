import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should normalize leading slashes in endpoint paths', () => {
    service.get('/profile/').subscribe();

    const req = httpMock.expectOne('/api/v1/profile/');
    expect(req.request.method).toBe('GET');
    req.flush({ data: { id: 1 } });
  });

  it('should extract nested error messages for 403-style responses', () => {
    const message = service.extractApiErrorMessage({
      status: 403,
      error: {
        detail: {
          message: 'Forbidden access'
        }
      }
    });

    expect(message).toBe('Forbidden access');
  });

  it('should extract the inactive-account message from nested backend errors', () => {
    const message = service.extractApiErrorMessage({
      status: 403,
      error: {
        success: false,
        message: 'User account is not active and please verify your email to activate your account',
        data: null,
        error: {
          detail: {
            status: 'error',
            message: 'User account is not active and please verify your email to activate your account',
            error_code: 'INACTIVE_ACCOUNT',
            errors: [
              {
                field: 'email',
                message: 'User account is not active and please verify your email to activate your account',
              },
            ],
          },
        },
      },
    });

    expect(message).toBe('User account is not active and please verify your email to activate your account');
  });
});
