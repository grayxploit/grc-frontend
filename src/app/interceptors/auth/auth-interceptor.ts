import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpClient
} from '@angular/common/http';
import { throwError, of } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ACCESS_TOKEN } from '../../services/auth/auth.service';

const jwtHelper = new JwtHelperService();

// Helper function to get appropriate error message
const getErrorMessage = (error: any): string => {
  if (error.status === 0) {
    return 'Network error. Please check your connection.';
  } else if (error.status >= 500) {
    return 'Server error. Please try again later.';
  } else if (error.status === 404) {
    return 'Resource not found.';
  } else if (error.status === 403) {
    return 'Access denied.';
  } else if (error.status === 400 || error.status === 406) {
    // For client errors, preserve the server message
    return error.error?.message || 'Bad request.';
  } else if (error.status === 409) {
    return error.error?.message || 'Conflict error. Resource already exists.';
  } else if (error.status === 429) {
    return 'Too many requests. Please try again later.';
  } else if (error.status === 422) {
    // Handled separately below for field errors; keep a generic fallback
    return error.error?.message || 'Validation error. Please check your input.';
  } else {
    return error.error?.message || 'An error occurred. Please try again.';
  }
};

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const apiUrl = environment.apiUrl;
  const prefix = 'api';
  const apiVersion = 'v1';
  const apiUrlWithVersion = `${apiUrl}/${apiVersion}`;
  // Inject HttpClient directly to avoid circular dependency with ApiService
  const http = inject(HttpClient);

  // Don't modify headers for authentication endpoints
  if (req.url.includes('auth/login') || req.url.includes('auth/refresh')) {
    console.log('AuthInterceptor: Skipping auth endpoints');
    let headers = req.headers
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')




    const modifiedReq = req.clone({ headers });
    return next(modifiedReq);
  }



  // Determine if this is a protected request (check BEFORE modifying headers)
  const isProtected = req.headers.has('X-Is-Protected') ||
    req.url.includes('/protected') ||
    req.url.includes('api/') ||
    req.method !== 'GET'; // Protect all non-GET requests by default

  // Set basic headers for all requests, preserving existing ones
  let headers = req.headers
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .delete('X-Is-Protected'); // Remove marker header before forwarding

  if (isProtected) {
    const token = typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN) : null;

    console.log("access token", token);
    if (token) {
      try {
        const isTokenExpired = jwtHelper.isTokenExpired(token);
        if (isTokenExpired) {
          console.log('AuthInterceptor: Token expired; attempting refresh before request');
          return http.post<any>(`${apiUrlWithVersion}/auth/refresh-token`, {}, { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, withCredentials: true }).pipe(
            switchMap((response) => {
              const newAccessToken = response?.data?.token?.access_token;
              if (!newAccessToken) {
                if (typeof window !== 'undefined') {
                  localStorage.removeItem(ACCESS_TOKEN);
                }
                return throwError(() => ({ status: 401, error: { success: false, message: 'Session expired. Please log in again.', data: null, error: 'Authentication required' } }));
              }

              if (typeof window !== 'undefined') {
                localStorage.setItem(ACCESS_TOKEN, newAccessToken);
              }

              const decodedToken = jwtHelper.decodeToken(newAccessToken);
              if (decodedToken && decodedToken.sub) {
                headers = headers.set('X-User-ID', decodedToken.sub);
              }
              headers = headers.set('Authorization', `Bearer ${newAccessToken}`);
              const refreshedReq = req.clone({ headers });
              return next(refreshedReq);
            }),
            catchError(() => {
              if (typeof window !== 'undefined') {
                localStorage.removeItem(ACCESS_TOKEN);
              }
              return throwError(() => ({ status: 401, error: { success: false, message: 'Session expired. Please log in again.', data: null, error: 'Authentication required' } }));
            })
          );
        }

        const decodedToken = jwtHelper.decodeToken(token);
        console.log('decoded token', decodedToken);
        if (decodedToken && decodedToken.sub) {
          headers = headers.set('X-User-ID', decodedToken.sub);
        }
        headers = headers.set('Authorization', `Bearer ${token}`);
      } catch (error) {
        console.error('AuthInterceptor: Error decoding token for headers:', error);
      }
    } else {
      console.log("AuthInterceptor: No token found for protected request");
    }
  }

  const clonedReq = req.clone({ headers });

  return next(clonedReq).pipe(
    catchError(error => {
      console.log("AuthInterceptor: Request failed with status:", error.status);

      // Only clear auth state for true authentication failures.
      if (error.status === 401 && isProtected) {
        console.log("AuthInterceptor: 401 on protected request; clearing session");
        if (typeof window !== 'undefined') {
          localStorage.removeItem(ACCESS_TOKEN);
        }
        const standardizedError = {
          status: 401,
          error: {
            success: false,
            message: 'Session expired. Please log in again.',
            data: null,
            error: 'Authentication required'
          }
        };
        return throwError(() => standardizedError);
      }


      if ((error.error.message === 'Validation failed' && error.status === 422) || (error.error.message === 'Validation failed' && error.status === 409)) {
        // Parse validation errors and create field-specific error messages
        const validationErrors: { [key: string]: string } = {};

        if (error.error.error && Array.isArray(error.error.error)) {
          error.error.error.forEach((errorMessage: string) => {
            // Split by colon to get field name and error message
            const colonIndex = errorMessage.indexOf(':');
            if (colonIndex !== -1) {
              const fieldName = errorMessage.substring(0, colonIndex).trim();
              const fieldError = errorMessage.substring(colonIndex + 1).trim();
              validationErrors[fieldName] = fieldError;
            }
          });
        }

        const standardizedError = {
          status: error.status || 0,
          error: {
            success: false,
            message: 'Validation failed',
            data: null,
            error: 'Validation Error',
            validationErrors: validationErrors
          }
        };
        console.log('ApiService: Handling validation errors:', standardizedError);
        return throwError(() => standardizedError);
      }

      // For non-401 errors, preserve the original error structure and message
      const standardizedError = {
        status: error.status || 0,
        error: {
          success: false,
          message: getErrorMessage(error),
          data: null,
          error: error.error || error.message || 'An unexpected error occurred'
        }
      };

      console.error("AuthInterceptor: Standardized error response:", standardizedError);
      return throwError(() => standardizedError);
    })
  );
};