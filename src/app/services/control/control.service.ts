import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Control, ControlQueryParam, CreateControl } from './control.model';
import { ApiResponse, PaginatedResponse } from '../api/api-response.model';
import { Observable, pipe } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ControlService {
    private readonly apiService = inject(ApiService);

    getAllControl(query: ControlQueryParam): Observable<PaginatedResponse<Control>> {
        let queryParams = `page=${query.page}&size=${query.limit}`;
        if (query.filter) {
            queryParams += this.apiService.buildFilter(query.filter);
        }
        return this.apiService
            .protectedGet<PaginatedResponse<Control>>(`control/?${queryParams}`)
            .pipe(map(response => response.data));
    }


    createControl(data: CreateControl): Observable<ApiResponse<Control>> {
        return this.apiService
            .protectedPost<ApiResponse<Control>>('control/', data)
            .pipe(map(response => response.data));
    }

    importControl(file: File): Observable<ApiResponse<Control[]>> {
        return this.apiService
            .protectedPost<ApiResponse<Control[]>>('control/import/', file)
            .pipe(map(response => response.data));
    }
}
