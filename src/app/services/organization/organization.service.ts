import { inject, Service } from '@angular/core';
import { ApiService } from '../api/api.service';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiResponse } from '../api/api-response.model';
import { CreateOrganizationRequest, GetOrganizationResponse, Organization, UpdateOrganizationRequest } from './organization.model';


const passthroughError = (error: unknown) => throwError(() => error);
@Service()
export class OrganizationService {
    public readonly apiService = inject(ApiService);


    createOrganization(organizationData: CreateOrganizationRequest): Observable<ApiResponse<Organization>> {
        return this.apiService.protectedPost<ApiResponse<Organization>>('vendors/organizations/', organizationData).pipe(
            map(response => response.data),
            catchError(passthroughError)
        )
    }

    getOrganization(): Observable<ApiResponse<GetOrganizationResponse>> {
        return this.apiService.protectedGet<ApiResponse<GetOrganizationResponse>>(`vendors/organizations/get`).pipe(
            map(response => response.data),
            catchError(passthroughError)
        )
    }

    updateOrganization(data: UpdateOrganizationRequest): Observable<ApiResponse<Organization>> {
        return this.apiService.protectedPut<ApiResponse<Organization>>(`vendors/organizations/`, data).pipe(
            map(response => response.data),
            catchError(passthroughError)
        )
    }
}
