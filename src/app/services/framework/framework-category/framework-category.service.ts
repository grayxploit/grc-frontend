import { inject, Service } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { FrameworkCategory, FrameworkCategoryCreateRequest, FrameworkCategoryQueryParam } from './framework-category.model';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse } from '../../api/api-response.model';
import { map } from 'rxjs/operators';
@Service()
export class FrameworkCategoryService {
    private readonly apiService = inject(ApiService);

    getAllFrameworkCategory(queryParam: FrameworkCategoryQueryParam): Observable<PaginatedResponse<FrameworkCategory>> {
        let queryParams = `page=${queryParam.page}&size=${queryParam.limit}`;
        if (queryParam.filter) {
            queryParams += this.apiService.buildFilter(queryParam.filter);
        }
        return this.apiService
            .protectedGet<PaginatedResponse<FrameworkCategory>>(`framework/categories?${queryParams}`)
            .pipe(map(response => response.data));
    }

    createFrameworkCategory(data: Partial<FrameworkCategoryCreateRequest>): Observable<ApiResponse<FrameworkCategory>> {
        return this.apiService
            .protectedPost<ApiResponse<FrameworkCategory>>('framework/categories', data)
            .pipe(map(response => response.data));
    }

    updateFrameworkCategory(id: number, data: Partial<FrameworkCategoryCreateRequest>): Observable<ApiResponse<FrameworkCategory>> {
        return this.apiService
            .protectedPut<ApiResponse<FrameworkCategory>>(`framework/categories/${id}`, data)
            .pipe(map(response => response.data));
    }

}

