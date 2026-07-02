import { inject, Service } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Framework, FrameworkCreateRequest } from './framework.model';
import { Observable } from 'rxjs';
import { ApiResponse } from '../api/api-response.model';
import { map } from 'rxjs/operators';
@Service()
export class FrameworkService {
    private apiService = inject(ApiService);



    createFramework(data: FrameworkCreateRequest): Observable<ApiResponse<Framework>> {
        return this.apiService.protectedPost<ApiResponse<Framework>>('framework/', data)
        .pipe(map(response => response.data));
    }

}
