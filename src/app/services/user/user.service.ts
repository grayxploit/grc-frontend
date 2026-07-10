import { inject, Service , signal, computed} from '@angular/core';
import { ApiService } from '../api/api.service';
import { catchError, map, Observable, throwError , tap} from 'rxjs'
import { ApiResponse, PaginatedResponse } from '../api/api-response.model';
import {  LoginLog, LoginLogQueryParam, UpdateProfileRequest, User } from './user.model';
import { sign } from 'crypto';


const passthroughError = (error: unknown) => throwError(() => error);
@Service()
export class UserService {

  public readonly apiService = inject(ApiService)


  #userData = signal<User | null>(null);
  userData = computed(() => this.#userData());
  getUserProfile(): Observable<ApiResponse<User>> {
    return this.apiService.protectedGet<ApiResponse<User>>('profile/').pipe(
      map(response => response.data),
      catchError(passthroughError)
    )
  }


  getFullUserProfile(): Observable<ApiResponse<User>> {
    return this.apiService.protectedGet<ApiResponse<User>>('profile/full').pipe(
      map(response => response.data),
      tap(response => this.#userData.set(response.data)),
      catchError(passthroughError)
    )
  }

  updateUserProfile(profileUpdate: UpdateProfileRequest): Observable<ApiResponse<User>> {
    return this.apiService.protectedPut<ApiResponse<User>>('profile/', profileUpdate).pipe(
      map(response => response.data),
      tap(response => this.#userData.set(response.data)),
      catchError(passthroughError)
    )
  }

  uploadAvatar(file: File): Observable<ApiResponse<User>> {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.apiService.protectedUpload<ApiResponse<User>>('profile/avatar/', formData).pipe(
      map(response => response.data),
      tap(response => this.#userData.set(response.data)),
      catchError(passthroughError)
    );
  }


  getLoginLog(queryParam : LoginLogQueryParam) : Observable<PaginatedResponse<LoginLog>> {
    let queryParams = `page=${queryParam.page}&size=${queryParam.size || 5}`;
                
                if (queryParam.filter) {
                    queryParams += this.apiService.buildFilter(queryParam.filter);
                }
    return this.apiService.protectedGet<PaginatedResponse<LoginLog>>(`profile/login-logs?${queryParams}`).pipe(
      map(response => response.data),
      catchError(passthroughError)
    )
  }


  getInitials(name?: string): string {
    if (!name) return '?';

    return name
      .trim()
      .split(' ')
      .slice(0, 2)
      .map(part => part[0].toUpperCase())
      .join('');
  }

  getRole(role: string): string {
    switch (role) {
      case 'superadmin':
        return 'Super Admin';

      case 'admin':
        return 'Admin';

      case 'user':
        return 'User';

      default:
        return 'Guest';
    }
  }

}
