import { inject, Service } from '@angular/core';
import { ApiService } from '../api/api.service';
import { catchError, map, Observable, throwError } from "rxjs";
import { IndustryQueryParam, Industry, IndustryCreateRequest } from './industry.model';
import { PaginatedResponse } from '../api/api-response.model';

const passthroughError = (error: unknown) => throwError(() => error);
@Service()
export class IndustryService {
    public readonly apiService = inject(ApiService);


    public getAllIndustries(queryParam: IndustryQueryParam) : Observable<PaginatedResponse<Industry>> {
         let queryParams = `page=${queryParam.page}&size=${queryParam.limit}`;
                if (queryParam.filter) {
                    queryParams += this.apiService.buildFilter(queryParam.filter);
                }
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

    public updateIndustry(id: number, payload: IndustryCreateRequest) : Observable<Industry> {
        return this.apiService.protectedPut<Industry>(`industries/${id}`, payload).pipe(
            map(response => response.data),
            catchError(passthroughError)
        )
    }
}
