import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { PageBreadcrumb } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb';
import { Card } from '../../../shared/components/common/card/card';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormArray, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FrameworkCategoryService } from '../../../services/framework/framework-category/framework-category.service';
import { FrameworkCategory } from '../../../services/framework/framework-category/framework-category.model';
import { ApiService } from '../../../services/api/api.service';
import { Subject, takeUntil } from 'rxjs';
import { FrameworkService } from '../../../services/framework/framework.service';
import { FrameworkCreateRequest, Framework as FrameworkModel } from '../../../services/framework/framework.model';
import { PaginationMeta, QueryFilter } from '../../../services/api/api-response.model';
import { ChangeDetectorRef } from '@angular/core';
import { Pagination } from '../../../shared/components/common/pagination/pagination';
import { IndustryService } from '../../../services/industry/industry.service';
import { Industry } from '../../../services/industry/industry.model';

@Component({
  selector: 'app-framework',
  imports: [
    CommonModule,
    PageBreadcrumb,
    Card,
    ReactiveFormsModule,
    Pagination
  ],
  templateUrl: './framework.html',
  styleUrl: './framework.css',
})
export class Framework implements OnInit, OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private readonly frameworkService = inject(FrameworkService);
  private readonly frameworkCategoryService = inject(FrameworkCategoryService);
  private readonly industryService = inject(IndustryService);
  private destroy$ = new Subject<void>();
  private readonly cdr = inject(ChangeDetectorRef);
  isCreateModalOpen = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  modalErrorMessage = signal<string>('');
  categoryLoadError = '';
  frameworkCategories: FrameworkCategory[] = [];
  industries: Industry[] = [];
  isEditModalOpen = signal<boolean>(false);
  filter: QueryFilter = {};
  frameworks: FrameworkModel[] = [];
  meta!: PaginationMeta;
  errorMessage = ''

  searchQuery = '';
  limit = 5;
  limitOptions = [5, 10, 20, 50, 100];
  public createForm = this.formBuilder.group({
    name: ['', Validators.required],
    description: '',
    status: 'active',
    category: ['', Validators.required],
    official_url: '',
    published_date: '',
    version: '',
    industries: this.formBuilder.array([]),
  });

  public editForm = this.formBuilder.group({
    id: ['', Validators.required],
    name: ['', Validators.required],
    description: '',
    status: 'active',
    category: ['', Validators.required],
    official_url: '',
    published_date: '',
    version: '',
    industries: this.formBuilder.array([]),
  });

  public searchForm = this.formBuilder.group({
    search: ['']
  });

  ngOnInit() {
    this.loadFrameworkCategories();
    this.loadIndustries();
    this.getAllFramework();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch() {
    this.searchQuery = this.searchForm.value.search || '';
    this.filter['page'] = 1;
    this.getAllFramework();
  }

  clearSearch() {
    this.searchForm.patchValue({ search: '' });
    this.searchQuery = '';
    this.filter['page'] = 1;
    this.getAllFramework();
  }
  onLimitChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.limit = Number(select.value);
    this.filter['page'] = 1;
    this.getAllFramework();
  }

  private loadFrameworkCategories() {
    this.frameworkCategoryService.getAllFrameworkCategory({ page: 1, size: 100 })
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

  private loadIndustries() {
    this.industryService.getAllIndustries({ page: 1, size: 100 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.industries = [...response.data];
        },
        error: (error) => {
          console.error(error);
          this.industries = [];
          this.categoryLoadError = 'Unable to load industries.';
        }
      });
  }

  openCreateModal() {
    this.isCreateModalOpen.set(true);
    this.modalErrorMessage.set('');
    this.createForm.reset({
      name: '',
      description: '',
      status: 'active',
      category: '',
      official_url: '',
      published_date: '',
      version: '',
    });
    (this.createForm.controls['industries'] as FormArray).clear();
  }

  closeCreateModal() {
    this.isCreateModalOpen.set(false);
    this.modalErrorMessage.set('');
  }

  submitCreateForm() {
    if (this.createForm.invalid) {
      this.modalErrorMessage.set('Please fill in all required fields.');
      this.createForm.markAllAsTouched();
      return;
    }

    const formValue = this.createForm.value;
    const industriesArray = this.createForm.controls['industries'] as FormArray;
    const payload: FrameworkCreateRequest = {
      name: formValue.name ?? '',
      description: formValue.description ?? '',
      status: formValue.status ?? 'active',
      category: formValue.category ?? '',
      official_url: formValue.official_url ?? '',
      published_date: formValue.published_date ?? '',
      version: formValue.version ?? '',
      industries: industriesArray.value.map((id: string) => ({ industry_id: id })),
    };

    console.log("Create Payload", payload)
    this.isSubmitting.set(true);
    this.modalErrorMessage.set('');

    this.frameworkService.createFramework(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Framework created successfully:', response);
          this.isSubmitting.set(false);
          this.closeCreateModal();
          this.getAllFramework();
        },
        error: (error) => {
          this.isSubmitting.set(false);
          const err = this.frameworkService.apiService.extractApiErrorMessage(error);

          this.modalErrorMessage.set(err || 'Unable to create framework.');
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
    const params: any = { page, size: this.limit || 5 };
    if (this.searchQuery) {
      params.name = this.searchQuery;
    }
    this.frameworkService.getAllFramework(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.errorMessage = '';
          this.frameworks = [...response.data];
          this.meta = { ...response.meta };
          this.cdr.markForCheck(); // force view update after async data
        },
        error: (error) => {
          const err = this.frameworkService.apiService.extractApiErrorMessage(error);
          this.errorMessage = err || 'Unable to load framework categories.';
          this.frameworks = [];
          this.cdr.markForCheck();
          console.error(error);
        },
      });
  }

  openEditModal(framework: FrameworkModel) {
    console.log('Opening edit modal for framework:', framework);
    this.modalErrorMessage.set('');

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

    const industriesArray = this.editForm.controls['industries'] as FormArray;
    industriesArray.clear();
    if (framework.industries && Array.isArray(framework.industries)) {
      framework.industries.forEach((i: any) => {
        industriesArray.push(new FormControl(i.id));
      });
    }

    this.isEditModalOpen.set(true);
  }

  closeEditModal() {
    this.isEditModalOpen.set(false);
    this.modalErrorMessage.set('')
  }

  submitEditForm() {
    if (this.editForm.invalid) {
      this.modalErrorMessage.set('Please fill in all required fields.');
      this.editForm.markAllAsTouched();
      return;
    }

    const value = this.editForm.value;
    const industriesArray = this.editForm.controls['industries'] as FormArray;

    const payload: FrameworkCreateRequest = {
      name: value.name ?? '',
      description: value.description ?? '',
      status: value.status ?? 'active',
      category: value.category ?? '',
      official_url: value.official_url ?? '',
      published_date: value.published_date ?? '',
      version: value.version ?? '',
      industries: industriesArray.value.map((id: string) => ({ industry_id: id })),
    };

    this.isSubmitting.set(true);
    this.modalErrorMessage.set('')

    this.frameworkService
      .updateFramework(value.id!, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.isEditModalOpen.set(false);
          this.getAllFramework();

        },
        error: (error) => {
          const err = this.frameworkService.apiService.extractApiErrorMessage(error);
          this.isSubmitting.set(false);
          this.modalErrorMessage.set(
            err || 'Unable to update framework.');
        },
      });
  }

  onPageChange(page: number) {
    this.filter['page'] = page;
    this.getAllFramework();
  }

  toggleIndustry(industryId: string, formType: 'create' | 'edit') {
    const form = formType === 'create' ? this.createForm : this.editForm;
    const industriesArray = form.controls['industries'] as FormArray;
    const currentIndustries = industriesArray.value as string[];

    const index = currentIndustries.indexOf(industryId);
    if (index > -1) {
      industriesArray.removeAt(index);
    } else {
      industriesArray.push(new FormControl(industryId));
    }
  }

  isIndustrySelected(industryId: string, formType: 'create' | 'edit'): boolean {
    const form = formType === 'create' ? this.createForm : this.editForm;
    const industriesArray = form.controls['industries'] as FormArray;
    const industries = industriesArray.value as string[];
    return industries.includes(industryId);
  }


  getSerialNumber(index: number): number {
    const currentPage = this.filter['page'] || 1;
    const itemsPerPage = this.meta?.size || 2;
    return (currentPage - 1) * itemsPerPage + index + 1;
  }
}
