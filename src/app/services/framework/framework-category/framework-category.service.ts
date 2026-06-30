import { inject, NgZone, Service } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { FrameworkCategory, FrameworkCategoryCreateRequest, FrameworkCategoryQueryParam, ImportJobResponse, ImportProgressEvent } from './framework-category.model';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse } from '../../api/api-response.model';
import { map } from 'rxjs/operators';
@Service()
export class FrameworkCategoryService {
    private readonly apiService = inject(ApiService);
    private readonly ngZone = inject(NgZone);

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

    importCategories(file: File): Observable<ApiResponse<ImportJobResponse>> {
        const formData = new FormData();
        formData.append('file', file, file.name);

        return this.apiService
            .protectedUpload<ApiResponse<ImportJobResponse>>('framework/categories/import', formData)
            .pipe(map(response => response.data));
    }

    streamImportProgress(jobId: string): Observable<ImportProgressEvent> {
        return new Observable<ImportProgressEvent>((observer) => {
            const url = `${this.apiService.apiUrlWithVersion}/framework/categories/import/${jobId}/stream`;
            const eventSource = new EventSource(url, { withCredentials: true });

            const handleEvent = (event: MessageEvent) => {
                this.ngZone.run(() => {
                    try {
                        const progress = JSON.parse(event.data) as ImportProgressEvent;
                        observer.next(progress);

                        const status = String(progress.status || '').toLowerCase();
                        if (status === 'completed' || status === 'failed') {
                            eventSource.close();
                            observer.complete();
                        }
                    } catch (error) {
                        observer.error(error);
                        eventSource.close();
                    }
                });
            };

            eventSource.addEventListener('progress', handleEvent);
            eventSource.onmessage = handleEvent;
            eventSource.addEventListener('error', (event) => {
                this.ngZone.run(() => {
                    observer.error(event);
                    eventSource.close();
                });
            });
            eventSource.onerror = (event) => {
                this.ngZone.run(() => {
                    observer.error(event);
                    eventSource.close();
                });
            };

            return () => {
                eventSource.close();
            };
        });
    }

}
