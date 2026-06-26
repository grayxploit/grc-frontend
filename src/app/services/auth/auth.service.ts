import { inject, Service } from '@angular/core';
import { ApiService } from '../api/api.service';
import { LoginRequest } from './auth.model';
import { ApiResponse } from '../api/api-response.model';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
export const ACCESS_TOKEN = 'access_token'
interface LoginResponseData {
    token: {
      access_token: string;
      token_type: string;
    },
    
    user: any;
  }

  interface RefreshTokenResponseData {
    token: {
      access_token: string;
      token_type: string;
    },
  }

@Service()
export class AuthService {
    private readonly apiService = inject(ApiService);

    public login(data: LoginRequest): Observable<ApiResponse<LoginResponseData>> {
        return this.apiService.post<ApiResponse<LoginResponseData>>('auth/login', data).pipe(
            map(response => response.data),
            catchError(error => throwError(() => new Error(error.message)))
        );
    }

    public setToken(token: string) {
        localStorage.setItem(ACCESS_TOKEN, token);
    }

    public getToken(): string | null {
        return localStorage.getItem(ACCESS_TOKEN);
    }

    public removeToken() {
        localStorage.removeItem(ACCESS_TOKEN);
    }


    public isAuthenticated(): boolean {
        return !!this.getToken();
    }

    public refreshToken(): Observable<ApiResponse<  RefreshTokenResponseData>> {
        return this.apiService.post<ApiResponse<RefreshTokenResponseData>>('auth/refresh', {}).pipe(
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

    // If token still valid, respond true synchronously
    if (this.isAuthenticated()) {
      console.log('Token is still valid, user is authenticated');
      return of(true);
    }

    // Token is expired — attempt to refresh using cookie-based refresh token.
    // We call the refresh endpoint without requiring a token in localStorage.
    console.log('Token expired, attempting to refresh using cookie-based refresh token...');
    return this.refreshToken().pipe(
      map((response) => {
        console.log('Token refresh successful', response);
        // Support multiple possible response shapes. Example provided by user:
        // {
        //   data: { token: { access_token: '...', token_type: 'bearer' } }
        // }
        const respBody = (response as any)?.data || response || {};

        const access =
          // legacy: data.data.accessToken
          respBody?.data?.data?.accessToken ||
          // legacy: data.accessToken
          respBody?.data?.accessToken ||
          // direct: accessToken
          respBody?.accessToken ||
          // provided example: data.token.access_token
          respBody?.data?.token?.access_token ||
          // alternative: token.access_token
          respBody?.token?.access_token ||
          null;

        const refresh =
          // legacy nested refresh
          respBody?.data?.data?.refreshToken?.token ||
          // common: data.refreshToken
          respBody?.data?.refreshToken ||
          // direct: refreshToken
          respBody?.refreshToken ||
          // some APIs may return refresh_token alongside token
          respBody?.data?.token?.refresh_token ||
          respBody?.token?.refresh_token ||
          null;
        if (access) this.setToken(access);
        // if (refresh) this.setRefreshToken(refresh);
        return true;
      }),
      catchError((err) => {
        console.error('Token refresh failed:', err);
        this.removeToken();
        return of(false);
      })
    );
  }

}
