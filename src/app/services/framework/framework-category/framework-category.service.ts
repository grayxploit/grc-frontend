import { inject, Service } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { FrameworkCategory, FrameworkCategoryQueryParam } from './framework-category.model';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '../../api/api-response.model';
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

    
}

