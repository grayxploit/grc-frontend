import { inject, Service } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { ControlType, ControlTypeCreateRequest, ControlTypeQueryParam } from './control-type.model';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse } from '../../api/api-response.model';
import { map } from 'rxjs/operators';
@Service()
export class ControlTypeService {
    private apiService = inject(ApiService);


    createControlType(data: ControlTypeCreateRequest): Observable<ApiResponse<ControlType>> {
        return this.apiService.protectedPost<ApiResponse<ControlType>>('control/types', data)
            .pipe(map(response => response.data));
    }

    getAllControlType(queryParam: ControlTypeQueryParam): Observable<PaginatedResponse<ControlType>> {
        let queryParams = `page=${queryParam.page}&size=${queryParam.limit}`;
        if (queryParam.filter) {
            queryParams += this.apiService.buildFilter(queryParam.filter);
        }
        return this.apiService
            .protectedGet<PaginatedResponse<ControlType>>(`control/types?${queryParams}`)
            .pipe(map(response => response.data));
    }

   
}
