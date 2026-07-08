import { Component, inject, ChangeDetectorRef, signal } from '@angular/core';
import { FrameworkCategoryService } from '../../../../services/framework/framework-category/framework-category.service';
import { FrameworkCategory as FrameworkCategoryModel, FrameworkCategoryUpdateRequest, ImportProgressEvent } from '../../../../services/framework/framework-category/framework-category.model';
import { PaginationMeta, QueryFilter } from '../../../../services/api/api-response.model';
import { Subject, takeUntil } from 'rxjs';
import { Card } from '../../../../shared/components/common/card/card';
import { PageBreadcrumb } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb';
import { Pagination } from '../../../../shared/components/common/pagination/pagination';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Modal } from '../../../../shared/components/ui/modal/modal';

@Component({
    selector: 'app-framework-category',
    imports: [
        CommonModule,
        FormsModule,
        PageBreadcrumb,
        Card,
        Pagination,
        ReactiveFormsModule,
        Modal
    ],
    templateUrl: './framework-category.html',
    styleUrl: './framework-category.css',
})
export class FrameworkCategory {
    private frameworkCategoryService = inject(FrameworkCategoryService);
    private formBuilder = inject(FormBuilder);
    private readonly cdr = inject(ChangeDetectorRef);
    private destroy$ = new Subject<void>();

    filter: QueryFilter = {};
    frameworkCategories = signal<FrameworkCategoryModel[]>([])
    meta!: PaginationMeta;
    errorMessage = '';

    // Modal properties
    isCreateModalOpen = signal<boolean>(false);
    isEditModalOpen = signal<boolean>(false);
    isImportModalOpen = signal<boolean>(false);
    modalErrorMessage = signal<string>('');
    importSuccessMessage = '';
    isSubmitting = signal<boolean>(false);
    selectedFile: File | null = null;
    searchQuery = '';
    limit = 5;
    limitOptions = [5, 10, 20, 50, 100];
    // Import progress properties
    importJobId: string | null = null;
    importProgress: ImportProgressEvent | null = null;
    isImporting = false;
    createForm = {
        name: '',
        description: '',
        status: 'active'
    };
    editForm = {
        id: 0,
        name: '',
        description: '',
        status: 'active'
    };

    public searchForm = this.formBuilder.group({
        search: ['']
    });

    ngOnInit() {
        this.destroy$ = new Subject<void>();
        this.getAllFrameworkCategory();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
    onSearch() {
        this.searchQuery = this.searchForm.value.search || '';
        this.filter['page'] = 1;
        this.getAllFrameworkCategory();
    }

    clearSearch() {
        this.searchForm.patchValue({ search: '' });
        this.searchQuery = '';
        this.filter['page'] = 1;
        this.getAllFrameworkCategory();
    }

    onLimitChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        this.limit = Number(select.value);
        this.filter['page'] = 1;
        this.getAllFrameworkCategory();
    }

    getAllFrameworkCategory() {
        const page = this.filter['page'] || 1;
        const params: any = { page, size: this.limit || 5 };
        if (this.searchQuery) {
            params.name = this.searchQuery;
        }
        this.frameworkCategoryService.getAllFrameworkCategory(params)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.errorMessage = '';
                    this.frameworkCategories.set(response.data)
                    this.meta = { ...response.meta };
                    this.cdr.markForCheck(); // force view update after async data
                },
                error: (error) => {
                    this.errorMessage = error?.error?.message || 'Unable to load framework categories.';
                    this.frameworkCategories.set([]);
                    this.cdr.markForCheck();
                    console.error(error);
                },
            });
    }

    openCreateModal() {
        this.isCreateModalOpen.set(true);
        this.modalErrorMessage.set('');
        this.createForm = {
            name: '',
            description: '',
            status: 'active'
        };
    }

    closeCreateModal() {
        this.isCreateModalOpen.set(false);
        this.modalErrorMessage.set('');
    }

    openEditModal(frameworkCategory: FrameworkCategoryModel) {
        this.isEditModalOpen.set(true);
        this.modalErrorMessage.set('');
        this.editForm = {
            id: frameworkCategory.id,
            name: frameworkCategory.name,
            description: frameworkCategory.description,
            status: frameworkCategory.status
        };
    }

    closeEditModal() {
        this.isEditModalOpen.set(false);
        this.modalErrorMessage.set('');
        this.editForm = {
            id: 0,
            name: '',
            description: '',
            status: 'active'
        };
    }

    openImportModal() {
        this.isImportModalOpen.set(true);
        this.modalErrorMessage.set('');
        this.importSuccessMessage = '';
        this.selectedFile = null;
        this.importJobId = null;
        this.importProgress = null;
        this.isImporting = false;
    }

    closeImportModal() {
        this.isImportModalOpen.set(false);
        this.modalErrorMessage.set('');
        this.importSuccessMessage = '';
        this.selectedFile = null;
        this.importJobId = null;
        this.importProgress = null;
        this.isImporting = false;
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile = input.files[0];
        }
    }

    downloadSampleCSV() {
        const csvContent = 'name,description,status\n"Security Framework","Framework for security standards","active"\n"Compliance Framework","Framework for compliance management","active"\n"Risk Management Framework","Framework for risk assessment","inactive"';
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'framework-categories-sample.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    submitImport() {
        if (!this.selectedFile) {
            this.modalErrorMessage.set('Please select a CSV file.');
            return;
        }

        this.isSubmitting.set(true);
        this.isImporting = true;
        this.modalErrorMessage.set('');
        this.importSuccessMessage = '';
        this.importProgress = {
            status: 'uploading',
            progress: 0,
            message: 'Uploading CSV file...'
        };
        this.cdr.markForCheck();

        this.importCategories(this.selectedFile);
    }

    importCategories(file: File) {
        this.frameworkCategoryService.importCategories(file)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    const importJob = response.data;
                    this.importJobId = importJob.job_id;
                    this.isSubmitting.set(false);

                    const normalizedStatus = this.normalizeStatus(importJob.status || 'pending');
                    if (normalizedStatus === 'completed') {
                        this.completeImport({
                            status: 'completed',
                            progress: 100,
                            message: 'Import completed.'
                        });
                        return;
                    }

                    this.importProgress = {
                        status: normalizedStatus,
                        progress: 0,
                        message: this.importJobId ? 'Import queued. Waiting for progress...' : 'Import is processing...'
                    };

                    if (this.importJobId) {
                        this.streamImportProgress();
                    }

                    this.cdr.markForCheck();
                },
                error: (error) => {
                    this.isSubmitting.set(false);
                    this.isImporting = false;
                    this.importProgress = null;
                    this.modalErrorMessage.set(error?.error?.message || 'Unable to import categories.');
                    this.cdr.markForCheck();
                    console.error(error);
                }
            });
    }

    streamImportProgress() {
        if (!this.importJobId) return;

        this.frameworkCategoryService.streamImportProgress(this.importJobId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (progress) => {
                    const normalizedProgress = this.normalizeImportProgress({
                        ...progress,
                        status: this.normalizeStatus(progress.status),
                    });

                    this.importProgress = normalizedProgress;
                    this.cdr.markForCheck();

                    if (this.isImportComplete(this.importProgress)) {
                        this.completeImport(this.importProgress);
                    } else if (normalizedProgress.status === 'failed') {
                        this.isImporting = false;
                        this.isSubmitting.set(false);
                        this.modalErrorMessage.set(normalizedProgress.message || 'Import failed.');
                        this.cdr.markForCheck();
                    }
                },
                error: (error) => {
                    this.isImporting = false;
                    this.modalErrorMessage.set('Error tracking import progress.');
                    this.cdr.markForCheck();
                    console.error(error);
                }
            });
    }

    private completeImport(progress: ImportProgressEvent | null) {
        const normalizedProgress = progress ? this.normalizeImportProgress(progress) : {
            status: 'completed',
            progress: 100,
            message: 'Import completed.',
            total: 0,
            processed: 0,
        };

        this.importProgress = {
            ...normalizedProgress,
            status: 'completed',
            progress: normalizedProgress.progress ?? 100,
            message: normalizedProgress.message || 'Import completed.'
        };
        this.importJobId = null;
        this.isImporting = false;
        this.isSubmitting.set(false);
        this.importSuccessMessage = `Successfully imported categories.`;
        this.getAllFrameworkCategory();
        this.cdr.markForCheck();

        setTimeout(() => {
            this.closeImportModal();
            this.cdr.markForCheck();
        }, 1500);
    }

    private normalizeStatus(status?: string): string {
        const normalized = String(status ?? '').trim().toLowerCase();
        return normalized === '' ? 'pending' : normalized;
    }

    private normalizeImportProgress(progress: ImportProgressEvent): ImportProgressEvent {
        const status = this.normalizeStatus(progress.status);
        const total = progress.total ?? progress.total_rows ?? 0;
        const processed = progress.processed ?? progress.processed_rows ?? 0;
        const calculatedProgress = total > 0 ? Math.round((processed / total) * 100) : 0;

        return {
            ...progress,
            status,
            total,
            processed,
            progress: status === 'completed' ? 100 : (progress.progress ?? calculatedProgress),
            message: progress.message || progress.error_message || this.getImportProgressMessage(status, processed, total)
        };
    }

    private getImportProgressMessage(status: string, processed: number, total: number): string {
        if (status === 'uploading') {
            return 'Uploading CSV file...';
        }

        if (status === 'pending') {
            return 'Import queued. Waiting for progress...';
        }

        if (status === 'processing' && total > 0) {
            return `Processing ${processed} of ${total} rows...`;
        }

        if (status === 'completed') {
            return 'Import completed.';
        }

        if (status === 'failed') {
            return 'Import failed.';
        }

        return 'Import is processing...';
    }

    private isImportComplete(progress: ImportProgressEvent): boolean {
        return progress.status === 'completed' || (!!progress.total && progress.processed === progress.total);
    }

    submitEditForm() {
        if (!this.editForm.name || !this.editForm.status) {
            this.modalErrorMessage.set('Name and status are required.');
            return;
        }

        this.isSubmitting.set(true);
        this.modalErrorMessage.set('');
        const payload: FrameworkCategoryUpdateRequest = {
            name: this.editForm.name,
            description: this.editForm.description,
            status: this.editForm.status
        };
        this.frameworkCategoryService.updateFrameworkCategory(this.editForm.id, payload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.isSubmitting.set(false);
                    this.closeEditModal();
                    this.getAllFrameworkCategory();
                },
                error: (error) => {
                    this.isSubmitting.set(false);
                    const err = this.frameworkCategoryService.apiService.extractApiErrorMessage(error)
                    this.modalErrorMessage.set(err || 'Unable to update framework category.');
                    this.cdr.markForCheck();
                    console.error(error);
                }
            });
    }

    submitCreateForm() {
        if (!this.createForm.name || !this.createForm.status) {
            this.modalErrorMessage.set('Name and status are required.');
            return;
        }

        this.isSubmitting.set(true);
        this.modalErrorMessage.set('');

        this.frameworkCategoryService.createFrameworkCategory(this.createForm)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.isSubmitting.set(false);
                    this.closeCreateModal();
                    this.getAllFrameworkCategory();
                },
                error: (error) => {
                    this.isSubmitting.set(false);
                    const err = this.frameworkCategoryService.apiService.extractApiErrorMessage(error)
                    this.modalErrorMessage.set(err || 'Unable to create framework category.');
                    this.cdr.markForCheck();
                    console.error(error);
                }
            });
    }

    onPageChange(page: number) {
        this.filter['page'] = page;
        this.getAllFrameworkCategory();
    }


    getSerialNumber(index: number): number {
        const currentPage = this.filter['page'] || 1;
        const itemsPerPage = this.meta?.size || 2;
        return (currentPage - 1) * itemsPerPage + index + 1;
    }

}
