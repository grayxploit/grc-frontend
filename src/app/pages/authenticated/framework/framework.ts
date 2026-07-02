import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { PageBreadcrumb } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb';
import { Card } from '../../../shared/components/common/card/card';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FrameworkCategoryService } from '../../../services/framework/framework-category/framework-category.service';
import { FrameworkCategory } from '../../../services/framework/framework-category/framework-category.model';
import { ApiService } from '../../../services/api/api.service';
import { Subject, takeUntil } from 'rxjs';
import { FrameworkService } from '../../../services/framework/framework.service';
import { FrameworkCreateRequest, Framework as FrameworkModel } from '../../../services/framework/framework.model';
import { PaginationMeta, QueryFilter } from '../../../services/api/api-response.model';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-framework',
  imports: [
    CommonModule,
    PageBreadcrumb,
    Card,
    ReactiveFormsModule
  ],
  templateUrl: './framework.html',
  styleUrl: './framework.css',
})
export class Framework implements OnInit, OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private readonly frameworkService = inject(FrameworkService);
  private readonly frameworkCategoryService = inject(FrameworkCategoryService);
  private destroy$ = new Subject<void>();
  private readonly cdr = inject(ChangeDetectorRef);
  isCreateModalOpen = false;
  isSubmitting = false;
  modalErrorMessage = '';
  categoryLoadError = '';
  frameworkCategories: FrameworkCategory[] = [];
  isEditModalOpen = false;
  filter: QueryFilter = {};
  frameworks: FrameworkModel[] = [];
  meta!: PaginationMeta;
  errorMessage = ''
  public createForm = this.formBuilder.group({
    name: ['', Validators.required],
    description: '',
    status: 'active',
    category: ['', Validators.required],
    official_url: '',
    published_date: '',
    version: '',
  });

  public editForm = this.formBuilder.group({
    id: [0, Validators.required],
    name: ['', Validators.required],
    description: '',
    status: 'active',
    category: ['', Validators.required],
    official_url: '',
    published_date: '',
    version: '',
  });

  ngOnInit() {
    this.loadFrameworkCategories();
    this.getAllFramework();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadFrameworkCategories() {
    this.frameworkCategoryService.getAllFrameworkCategory({ page: 1, limit: 100 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.frameworkCategories = [...response.data];
          this.categoryLoadError = '';
        },
        error: (error) => {
          console.error(error);
          this.frameworkCategories = [];
          this.categoryLoadError = 'Unable to load framework categories.';
        }
      });
  }

  openCreateModal() {
    this.isCreateModalOpen = true;
    this.modalErrorMessage = '';
    this.createForm.reset({
      name: '',
      description: '',
      status: 'active',
      category: '',
      official_url: '',
      published_date: '',
      version: '',
    });
  }

  closeCreateModal() {
    this.isCreateModalOpen = false;
    this.modalErrorMessage = '';
  }

  submitCreateForm() {
    if (this.createForm.invalid) {
      this.modalErrorMessage = 'Please fill in all required fields.';
      this.createForm.markAllAsTouched();
      return;
    }

    const formValue = this.createForm.value;
    const payload: FrameworkCreateRequest = {
      name: formValue.name ?? '',
      description: formValue.description ?? '',
      status: formValue.status ?? 'active',
      category: Number(formValue.category),
      official_url: formValue.official_url ?? '',
      published_date: formValue.published_date ?? '',
      version: formValue.version ?? '',
    };

    this.isSubmitting = true;
    this.modalErrorMessage = '';

    this.frameworkService.createFramework(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Framework created successfully:', response);
          this.isSubmitting = false;
          this.closeCreateModal();
          this.isSubmitting = false;
          this.closeCreateModal();
          this.getAllFramework();
        },
        error: (error) => {
          this.isSubmitting = false;
          this.modalErrorMessage = this.extractApiErrorMessage(error) || 'Unable to create framework.';
          console.error(error);
        }
      });
  }

  private extractApiErrorMessage(error: any): string | null {
    const detail = error?.error?.detail || error?.error;
    if (detail?.message) {
      return detail.message;
    }

    if (Array.isArray(detail?.errors) && detail.errors.length > 0) {
      return detail.errors.map((item: any) => item.message || '').filter(Boolean).join(' ');
    }

    if (Array.isArray(error?.error?.errors)) {
      return error.error.errors.map((item: any) => item.message || '').filter(Boolean).join(' ');
    }

    return error?.error?.message || error?.message || null;
  }

  get nameControl() {
    return this.createForm.get('name');
  }

  get categoryControl() {
    return this.createForm.get('category');
  }


  getAllFramework() {
    const page = this.filter['page'] || 1;
    this.frameworkService.getAllFramework({ page, limit: 3 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.errorMessage = '';
          this.frameworks = [...response.data];
          this.meta = { ...response.meta };
          this.cdr.markForCheck(); // force view update after async data
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Unable to load framework categories.';
          this.frameworks = [];
          this.cdr.markForCheck();
          console.error(error);
        },
      });
  }

  openEditModal(framework: FrameworkModel) {
    console.log('Opening edit modal for framework:', framework);
  this.modalErrorMessage = '';

  const selectedCategoryValue =
    typeof framework.category === 'object' && framework.category !== undefined
      ? String(framework.category.id)
      : framework.category !== undefined
        ? String(framework.category)
        : '';

  this.editForm.patchValue({
    id: framework.id,
    name: framework.name,
    description: framework.description ?? '',
    status: framework.status,
    category: selectedCategoryValue,
    official_url: framework.official_url ?? '',
    published_date: framework.published_date
      ? framework.published_date.substring(0, 10)
      : '',
    version: framework.version ?? '',
  });

  this.isEditModalOpen = true;
}

closeEditModal() {
  this.isEditModalOpen = false;
  this.modalErrorMessage = '';
}

submitEditForm() {
  if (this.editForm.invalid) {
    this.modalErrorMessage = 'Please fill in all required fields.';
    this.editForm.markAllAsTouched();
    return;
  }

  const value = this.editForm.value;

  const payload: FrameworkCreateRequest = {
    name: value.name ?? '',
    description: value.description ?? '',
    status: value.status ?? 'active',
    category: Number(value.category),
    official_url: value.official_url ?? '',
    published_date: value.published_date ?? '',
    version: value.version ?? '',
  };

  this.isSubmitting = true;
  this.modalErrorMessage = '';

  this.frameworkService
    .updateFramework(value.id!, payload)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeEditModal();
        this.getAllFramework();
      },
      error: (error) => {
        this.isSubmitting = false;
        this.modalErrorMessage =
          this.extractApiErrorMessage(error) ||
          'Unable to update framework.';
      },
    });
}
}
