import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FrameworkCategoryService } from '../../../../services/framework/framework-category/framework-category.service';
import { FrameworkCategory as FrameworkCategoryModel } from '../../../../services/framework/framework-category/framework-category.model';
import { PaginationMeta, QueryFilter } from '../../../../services/api/api-response.model';
import { Subject, takeUntil } from 'rxjs';
import { Card } from '../../../../shared/components/common/card/card';
import { PageBreadcrumb } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-framework-category',
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumb,
    Card
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
    modalErrorMessage = '';
    isSubmitting = false;
    createForm = {
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
      this.frameworkCategoryService.getAllFrameworkCategory({ page: 1, limit: 10 })
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

}
