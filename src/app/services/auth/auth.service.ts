import { inject, Service, signal, computed } from '@angular/core';
import { ApiService } from '../api/api.service';
import { LoginRequest, RegisterRequest , LoginResponseData, RefreshTokenResponseData, RegisterResponseData} from './auth.model';
import { ApiResponse } from '../api/api-response.model';
import { catchError, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { User } from '../user/user.service';
export const ACCESS_TOKEN = 'access_token'
export const REFRESH_ENDPOINT = 'auth/refresh-token'


@Service()
export class AuthService {
  private readonly apiService = inject(ApiService);

  #authUser = signal<User | null>(null);
  authUser = computed(() => this.#authUser());
  public login(data: LoginRequest): Observable<ApiResponse<LoginResponseData>> {
    return this.apiService.post<ApiResponse<LoginResponseData>>('auth/login', data).pipe(
      map(response => response.data),
      tap(response => this.#authUser.set(response.data.user)),
      catchError(error => throwError(() => new Error(error.message)))
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
      catchError(error => throwError(() => new Error(error.message)))
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


  public logout() {
    this.removeToken();
    this.#authUser.set(null);
  }

  public register(data: RegisterRequest): Observable<ApiResponse<RegisterResponseData>> {
    return this.apiService.post<ApiResponse<RegisterResponseData>>('auth/register', data).pipe(
      map(response => response.data),
      catchError(error => throwError(() => new Error(error.message)))
    );
  }

}
