import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FrameworkCategoryService } from '../../../../services/framework/framework-category/framework-category.service';
import { FrameworkCategory as FrameworkCategoryModel } from '../../../../services/framework/framework-category/framework-category.model';
import { PaginationMeta, QueryFilter } from '../../../../services/api/api-response.model';
import { Subject, takeUntil } from 'rxjs';
import { Card } from '../../../../shared/components/common/card/card';
import { PageBreadcrumb } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb';
import { Pagination } from '../../../../shared/components/common/pagination/pagination';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-framework-category',
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumb,
    Card,
    Pagination
  ],
  templateUrl: './framework-category.html',
  styleUrl: './framework-category.css',
})
export class FrameworkCategory {
    private frameworkCategoryService = inject(FrameworkCategoryService);

    private readonly cdr = inject(ChangeDetectorRef);
    private destroy$ = new Subject<void>();

    filter: QueryFilter = {};
    frameworkCategories: FrameworkCategoryModel[] = [];
    meta!: PaginationMeta;
    errorMessage = '';

    // Modal properties
    isCreateModalOpen = false;
    isEditModalOpen = false;
    modalErrorMessage = '';
    isSubmitting = false;
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

    ngOnInit() {
      this.destroy$ = new Subject<void>();
      this.getAllFrameworkCategory();
    }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  getAllFrameworkCategory() {
      const page = this.filter['page'] || 1;
      this.frameworkCategoryService.getAllFrameworkCategory({ page, limit: 3 })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.errorMessage = '';
            this.frameworkCategories = [...response.data];
            this.meta = { ...response.meta };
            this.cdr.markForCheck(); // force view update after async data
          },
          error: (error) => {
            this.errorMessage = error?.error?.message || 'Unable to load framework categories.';
            this.frameworkCategories = [];
            this.cdr.markForCheck();
            console.error(error);
          },
        });
    }

    openCreateModal() {
        this.isCreateModalOpen = true;
        this.modalErrorMessage = '';
        this.createForm = {
            name: '',
            description: '',
            status: 'active'
        };
    }

    closeCreateModal() {
        this.isCreateModalOpen = false;
        this.modalErrorMessage = '';
    }

    openEditModal(frameworkCategory: FrameworkCategoryModel) {
        this.isEditModalOpen = true;
        this.modalErrorMessage = '';
        this.editForm = {
            id: frameworkCategory.id,
            name: frameworkCategory.name,
            description: frameworkCategory.description,
            status: frameworkCategory.status
        };
    }

    closeEditModal() {
        this.isEditModalOpen = false;
        this.modalErrorMessage = '';
    }

    submitEditForm() {
        if (!this.editForm.name || !this.editForm.status) {
            this.modalErrorMessage = 'Name and status are required.';
            return;
        }

        this.isSubmitting = true;
        this.modalErrorMessage = '';

        this.frameworkCategoryService.updateFrameworkCategory(this.editForm.id, this.editForm)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.isSubmitting = false;
                    this.closeEditModal();
                    this.getAllFrameworkCategory();
                },
                error: (error) => {
                    this.isSubmitting = false;
                    this.modalErrorMessage = error?.error?.message || 'Unable to update framework category.';
                    this.cdr.markForCheck();
                    console.error(error);
                }
            });
    }

    submitCreateForm() {
        if (!this.createForm.name || !this.createForm.status) {
            this.modalErrorMessage = 'Name and status are required.';
            return;
        }

        this.isSubmitting = true;
        this.modalErrorMessage = '';

        this.frameworkCategoryService.createFrameworkCategory(this.createForm)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.isSubmitting = false;
                    this.closeCreateModal();
                    this.getAllFrameworkCategory();
                },
                error: (error) => {
                    this.isSubmitting = false;
                    this.modalErrorMessage = error?.error?.message || 'Unable to create framework category.';
                    this.cdr.markForCheck();
                    console.error(error);
                }
            });
    }

    onPageChange(page: number) {
        this.filter['page'] = page;
        this.getAllFrameworkCategory();
    }

}
