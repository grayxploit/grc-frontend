import { inject, Service, signal, computed } from '@angular/core';
import { ApiService } from '../api/api.service';
import { LoginRequest, RegisterRequest , LoginResponseData, RefreshTokenResponseData, RegisterResponseData, LogoutResponseData, VerifyEmailResponse, ResetPasswordResponse, ResetPasswordRequest} from './auth.model';
import { ApiResponse } from '../api/api-response.model';
import { catchError, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { User } from '../user/user.service';
export const ACCESS_TOKEN = 'access_token'
export const REFRESH_ENDPOINT = 'auth/refresh-token'

const passthroughError = (error: unknown) => throwError(() => error);


@Service()
export class AuthService {
  public readonly apiService = inject(ApiService);

  #authUser = signal<User | null>(null);
  authUser = computed(() => this.#authUser());
  public login(data: LoginRequest): Observable<ApiResponse<LoginResponseData>> {
    return this.apiService.post<ApiResponse<LoginResponseData>>('auth/login', data).pipe(
      map(response => response.data),
      tap(response => this.#authUser.set(response.data.user)),
      catchError(passthroughError)
    );
  }


  public fetchMe() {
    return this.apiService.protectedGet<ApiResponse<User>>('profile/').subscribe({
      next: (response) => {
        this.#authUser.set(response.data.data);
      },
      error: (error) => {
        console.error('Error fetching profile:', error);
      }
    });
  }

  public setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN, token);
    }
  }

  public getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(ACCESS_TOKEN);
    }
    return null;
  }

  public removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN);
    }
  }


  public isAuthenticated(): boolean {
    return !!this.getToken();
  }

  public refreshToken(): Observable<ApiResponse<RefreshTokenResponseData>> {
    // Backend reads refresh_token from httpOnly cookie, so send empty body
    return this.apiService.post<ApiResponse<RefreshTokenResponseData>>(REFRESH_ENDPOINT, {}).pipe(
      map(response => response.data),
      tap(response => this.setToken(response.data.token.access_token)),
      catchError(passthroughError)
    );
  }


  /**
 * Initialize authentication on app startup
 * This method should be called when the app starts to check and refresh tokens if needed
 */
  public initializeAuth(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      console.log('No auth token found, user needs to login');
      return of(false);
    }

    // Token exists — fetch current user profile to validate it
    console.log('Token found, validating by fetching user profile...');
    this.fetchMe();
    return of(true);
  }


  public logout(): Observable<ApiResponse<LogoutResponseData>> {

    return this.apiService.protectedPost<ApiResponse<LogoutResponseData>>('auth/logout', {}).pipe(
      map(response => response.data),
      tap(() => {
        this.removeToken();
        this.#authUser.set(null);
      }),
      catchError(passthroughError)
    );
    
  }

  public register(data: RegisterRequest): Observable<ApiResponse<RegisterResponseData>> {
    return this.apiService.post<ApiResponse<RegisterResponseData>>('auth/register', data).pipe(
      map(response => response.data),
      catchError(passthroughError)
    );
  }


  public verifyEmail(token: string): Observable<ApiResponse<VerifyEmailResponse>> {
    return this.apiService.get<ApiResponse<VerifyEmailResponse>>(`auth/verify-email/${token}`).pipe(
      map(response => response.data),
      catchError(passthroughError)
    );
  }

  public forgotPassword(email: string): Observable<ApiResponse<{ message: string }>> {
    return this.apiService.post<ApiResponse<{ message: string }>>('auth/forgot-password', { email }).pipe(
      map(response => response.data),
      catchError(passthroughError)
    );
  }


  public resetPassword(data: ResetPasswordRequest): Observable<ApiResponse<ResetPasswordResponse>> {
    return this.apiService.post<ApiResponse<ResetPasswordResponse>>('auth/reset-password', data).pipe(
      map(response => response.data),
      catchError(passthroughError)
    );
  }

}
