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
import { FrameworkCreateRequest } from '../../../services/framework/framework.model';

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

  isCreateModalOpen = false;
  isSubmitting = false;
  modalErrorMessage = '';
  categoryLoadError = '';
  frameworkCategories: FrameworkCategory[] = [];

  public createForm = this.formBuilder.group({
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
        next: () => {
          this.isSubmitting = false;
          this.closeCreateModal();
          this.isSubmitting = false;
          this.closeCreateModal();
                    
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
}
