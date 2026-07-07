import { inject, Service } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Framework, FrameworkCreateRequest, FrameworkQueryParam, FrameworkUpdateRequest } from './framework.model';
import { Observable, catchError, map, throwError } from 'rxjs';
import { ApiResponse, PaginatedResponse } from '../api/api-response.model';
const passthroughError = (error: unknown) => throwError(() => error);
@Service()
export class FrameworkService {
    public apiService = inject(ApiService);



    createFramework(data: FrameworkCreateRequest): Observable<ApiResponse<Framework>> {
        return this.apiService.protectedPost<ApiResponse<Framework>>('framework/', data)
            .pipe(map(response => response.data), catchError(passthroughError));
    }

    getAllFramework(queryParam: FrameworkQueryParam): Observable<PaginatedResponse<Framework>> {
        let queryParams = `page=${queryParam.page}&size=${queryParam.size || 5}`;
        if (queryParam.name) {
            queryParams += `&name=${queryParam.name}`;
        }
        if (queryParam.filter) {
            queryParams += this.apiService.buildFilter(queryParam.filter);
        }
        if (queryParam.filter) {
            queryParams += this.apiService.buildFilter(queryParam.filter);
        }
        return this.apiService
            .protectedGet<PaginatedResponse<Framework>>(`framework/?${queryParams}`)
            .pipe(map(response => response.data), catchError(passthroughError));
    }

    updateFramework(id: string, data: FrameworkUpdateRequest): Observable<ApiResponse<Framework>> {
        return this.apiService.protectedPut<ApiResponse<Framework>>(`framework/${id}`, data)
            .pipe(
                map(response => response.data),
                catchError(passthroughError)
            );
    }

    // deleteFramework(id: number): Observable<void> {
    //     return this.apiService.protectedDelete<void>(`framework/${id}/`);
    // }
}
