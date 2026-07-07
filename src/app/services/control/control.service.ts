import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Control, ControlQueryParam, CreateControl, UpdateControl } from './control.model';
import { ApiResponse, PaginatedResponse } from '../api/api-response.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ControlService {
    public readonly apiService = inject(ApiService);

    getAllControl(query: ControlQueryParam): Observable<PaginatedResponse<Control>> {
        let queryParams = `page=${query.page}&size=${query.size || 5}`;
        if (query.name) {
            queryParams += `&name=${query.name}`;
        }
        if (query.filter) {
            queryParams += this.apiService.buildFilter(query);
        }
        return this.apiService
            .protectedGet<PaginatedResponse<Control>>(`control/?${queryParams}`)
            .pipe(map(response => response.data));
    }


    createControl(data: CreateControl): Observable<Control> {
        return this.apiService
            .protectedPost<Control>('control/', data)
            .pipe(map(response => response.data));
    }

    importControl(file: File): Observable<ApiResponse<Control[]>> {
        return this.apiService
            .protectedPost<ApiResponse<Control[]>>('control/import/', file)
            .pipe(map(response => response.data));
    }

    updateControl(controlId: string, data: Partial<UpdateControl>): Observable<Control> {
        return this.apiService
            .protectedPut<Control>(`control/${controlId}`, data)
            .pipe(map(response => response.data));
    }

    deleteControl(controlId: number): Observable<void> {
        return this.apiService
            .protectedDelete<void>(`control/${controlId}/`)
            .pipe(map(response => response.data));
    }
}
