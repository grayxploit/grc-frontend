import { inject, Service } from '@angular/core';
import { ApiService } from '../api/api.service';
import { catchError, map, Observable, throwError } from "rxjs";
import { IndustryQueryParam, Industry, IndustryCreateRequest, IndustryDropdownResponse } from './industry.model';
import { ApiResponse, PaginatedResponse } from '../api/api-response.model';

const passthroughError = (error: unknown) => throwError(() => error);
@Service()
export class IndustryService {
    public readonly apiService = inject(ApiService);


    public getAllIndustries(queryParam: IndustryQueryParam) : Observable<PaginatedResponse<Industry>> {
        console.log('IndustryService received queryParam:', queryParam);
         let queryParams = `page=${queryParam.page}&size=${queryParam.size || 5}`;
                if (queryParam.name) {
                    queryParams += `&name=${queryParam.name}`;
                }
                if (queryParam.filter) {
                    queryParams += this.apiService.buildFilter(queryParam.filter);
                }
        console.log('IndustryService built queryParams:', queryParams);
        return this.apiService.protectedGet<PaginatedResponse<Industry>>(`industries/?${queryParams}`).pipe(
            map(response => response.data),
            catchError(passthroughError)
        )
    }

    public createIndustry(payload: IndustryCreateRequest) : Observable<Industry> {
        return this.apiService.protectedPost<Industry>('industries/', payload).pipe(
            map(response => response.data),
            catchError(passthroughError)
        )
    }

    public updateIndustry(id: string, payload: IndustryCreateRequest) : Observable<Industry> {
        return this.apiService.protectedPut<Industry>(`industries/${id}`, payload).pipe(
            map(response => response.data),
            catchError(passthroughError)
        )
    }

    public getAllIndustriesForDropdown() : Observable<PaginatedResponse<IndustryDropdownResponse>> {
        return this.apiService.protectedGet<PaginatedResponse<IndustryDropdownResponse>>('vendors/industries/').pipe(
            map(response => response.data),
            catchError(passthroughError)
        )
    }
}
