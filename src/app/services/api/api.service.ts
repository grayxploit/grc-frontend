import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { filter, map, Observable, throwError, catchError } from 'rxjs';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { HttpEventType } from '@angular/common/http';
import { ApiResponse } from './api-response.model';
@Injectable({ providedIn: 'root' })
export class ApiService {
  readonly apiUrl = environment.apiUrl;
  readonly apiVersion = 'v1';
  readonly apiUrlWithVersion = `${this.apiUrl}/${this.apiVersion}`;

  constructor(private http: HttpClient) {}

  private makeRequest<T>(method: string, endpoint: string, body?: any, isProtected: boolean = false, options?: any): Observable<ApiResponse<T>> {
    const url = `${this.apiUrl}/${this.apiVersion}/${endpoint}`;
    console.log('ApiService: Making request to:', url);
    const headers = this.createHeaders(isProtected);
    const requestOptions = {
      headers,
      observe: 'response' as 'response',
      withCredentials: true,
      ...options
    };
    let request$: Observable<HttpEvent<T>>;
    switch (method.toLowerCase()) {
      case 'get':
        request$ = this.http.get<T>(url, requestOptions);
        break;
      case 'post':
        request$ = this.http.post<T>(url, body, requestOptions);
        break;
      case 'put':
        request$ = this.http.put<T>(url, body, requestOptions);
        break;
      case 'patch':
        request$ = this.http.patch<T>(url, body, requestOptions);
        break;
      case 'delete':
        if (body) {
          // For DELETE requests with body, we need to add the body to requestOptions
          request$ = this.http.delete<T>(url, { ...requestOptions, body });
        } else {
          request$ = this.http.delete<T>(url, requestOptions);
        }
        break;
      default:
        return throwError(() => new Error(`Unsupported request method: ${method}`));
    }
    return request$.pipe(
      filter((event): event is HttpResponse<T> => event.type === HttpEventType.Response),
      map(response => this.handleResponse<T>(response)),
      catchError(this.handleError)
    );
  }


  private createHeaders(isProtected: boolean = false): HttpHeaders {
    // Let the interceptor handle all headers including Content-Type, Accept, etc.
    let headers = new HttpHeaders();
    
    if (isProtected) {
      headers = headers.set('X-Is-Protected', 'true');
    }
    
    return headers;
  }

  private handleError(error: any) {
    // If the error is already standardized by the auth interceptor, pass it through
    if (error && error.error && typeof error.error === 'object' && 'success' in error.error) {
      console.log('ApiService: Passing through standardized error from interceptor:', error);
      return throwError(() => error);
    }
    
    // Handle raw HttpErrorResponse (fallback for non-intercepted errors)
    if (error instanceof HttpErrorResponse) {
     
      if(error.error.message == 'Validation failed'){
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
      
      const standardizedError = {
        status: error.status || 0,
        error: {
          success: false,
          message: error.error?.message || error.message || 'An unknown error occurred!',
          data: null,
          error: error.error || error.message || 'HTTP Error'
        }
      };
      console.log('ApiService: Standardizing raw HttpErrorResponse:', standardizedError);
      return throwError(() => standardizedError);
    }
    
    // Handle other error types
    const standardizedError = {
      status: 0,
      error: {
        success: false,
        message: error?.message || 'An unknown error occurred!',
        data: null,
        error: error || 'Unknown Error'
      }
    };
    console.log('ApiService: Standardizing unknown error type:', standardizedError);
    return throwError(() => standardizedError);
  }
  
  // Utility: handle API response
  private handleResponse<T>(response: HttpResponse<T>): ApiResponse<T> {
    return {
      data: response.body as T,
      status: response.status,
      headers: response.headers
    };
  }


  // Unified API methods
  public get<T>(endpoint: string, options?: any): Observable<ApiResponse<T>> {
    return this.makeRequest<T>('GET', endpoint, undefined, false, options);
  }

  public post<T>(endpoint: string, data: any, options?: any): Observable<ApiResponse<T>> {
    return this.makeRequest<T>('POST', endpoint, data, false, options);
  }

  public put<T>(endpoint: string, data: any, options?: any): Observable<ApiResponse<T>> {
    return this.makeRequest<T>('PUT', endpoint, data, false, options);
  }

  public patch<T>(endpoint: string, data: any, options?: any): Observable<ApiResponse<T>> {
    return this.makeRequest<T>('PATCH', endpoint, data, false, options);
  }

  public delete<T>(endpoint: string, options?: any): Observable<ApiResponse<T>> {
    return this.makeRequest<T>('DELETE', endpoint, undefined, false, options);
  }

  public protectedGet<T>(endpoint: string, options?: any): Observable<ApiResponse<T>> {
    return this.makeRequest<T>('GET', endpoint, undefined, true, options);
  }

  public protectedPost<T>(endpoint: string, data: any, options?: any): Observable<ApiResponse<T>> {
    return this.makeRequest<T>('POST', endpoint, data, true, options);
  }

  public protectedPut<T>(endpoint: string, data: any, options?: any): Observable<ApiResponse<T>> {
    return this.makeRequest<T>('PUT', endpoint, data, true, options);
  }

  public protectedPatch<T>(endpoint: string, data: any, options?: any): Observable<ApiResponse<T>> {
    return this.makeRequest<T>('PATCH', endpoint, data, true, options);
  }

  public protectedDelete<T>(endpoint: string, data?: any, options?: any): Observable<ApiResponse<T>> {
    return this.makeRequest<T>('DELETE', endpoint, data, true, options);
  }
}
