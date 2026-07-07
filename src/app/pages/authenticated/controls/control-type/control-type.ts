import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { ControlTypeService } from '../../../../services/control/control-type/control-type.service';
import { single, Subject, takeUntil } from 'rxjs';
import { ApiErrorPayload, PaginationMeta, QueryFilter } from '../../../../services/api/api-response.model';
import { ControlTypeCreateRequest, ControlType as ControlTypeModel, ControlTypeUpdateRequest } from '../../../../services/control/control-type/control-type.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PageBreadcrumb } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb';
import { Card } from '../../../../shared/components/common/card/card';
import { ApiService } from '../../../../services/api/api.service';
import { Pagination } from '../../../../shared/components/common/pagination/pagination';
@Component({
  selector: 'app-control-type',
  imports: [
    CommonModule,
    PageBreadcrumb,
    Card,
    ReactiveFormsModule,
    Pagination
  ],
  templateUrl: './control-type.html',
  styleUrl: './control-type.css',
})
export class ControlType {
  private readonly controlTypeService = inject(ControlTypeService); // Injecting the ControlTypeService to interact with control type data
  private readonly apiService = inject(ApiService); // Injecting the ApiService to handle API error messages
  private readonly cdr = inject(ChangeDetectorRef); // Injecting ChangeDetectorRef to manually trigger change detection when needed
  private destroy$ = new Subject<void>(); // Subject to manage unsubscription and prevent memory leaks


  isLoading = signal<boolean>(false); // Flag to indicate if data is being loaded

  // List properties
  filter: QueryFilter = {};
  controlTypes = signal<ControlTypeModel[]>([]);
  meta!: PaginationMeta
  errorMessage = signal<string>('');

  searchQuery = '';
  limit = 5;
  limitOptions = [5, 10, 20, 50, 100];
  // Modal properties
  isCreateModalOpen = signal<boolean>(false);
  isEditModalOpen = signal<boolean>(false);
  modalErrorMessage = signal<string>('');
  //  Form submission properties
  isSubmitting = signal<boolean>(false);
  private readonly formBuilder = inject(FormBuilder);

  public createForm = this.formBuilder.group({
    name: ['', Validators.required],
  });

  public editForm = this.formBuilder.group({
    id: [0, Validators.required],
    name: ['', Validators.required],
  });

  public searchForm = this.formBuilder.group({
    search: ['']
  });
  ngOnInit() {
    this.destroy$ = new Subject<void>();
    this.getAllControlType();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  onSearch() {
    this.searchQuery = this.searchForm.value.search || '';
    this.filter['page'] = 1;
    this.getAllControlType();
  }

  onLimitChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.limit = Number(select.value);
    this.filter['page'] = 1;
    this.getAllControlType();
  }

  clearSearch() {
    this.searchForm.patchValue({ search: '' });
    this.searchQuery = '';
    this.filter['page'] = 1;
    this.getAllControlType();
  }
  openCreateModal() {
    this.isCreateModalOpen.set(true);
    this.modalErrorMessage.set('');
    this.createForm.reset({
      name: ''
    });
  }

  closeCreateModal() {
    this.isCreateModalOpen.set(false);
    this.modalErrorMessage.set('');
    this.createForm.reset({
      name: ''
    });
    this.cdr.detectChanges();
  }

  submitCreateForm() {
    if (this.createForm.invalid) {
      this.modalErrorMessage.set('Please fill in all required fields.');
      this.createForm.markAllAsTouched();
      return;
    }
    const formValue = this.createForm.value;
    const payload: ControlTypeCreateRequest = {
      name: formValue.name ?? ''
    };
    this.isSubmitting.set(true);
    this.controlTypeService.createControlType(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          const createdControlType = response.data;
          if (createdControlType) {
            this.controlTypes.set([{ ...createdControlType, name: payload.name }, ...this.controlTypes()]);
          }
          this.closeCreateModal();
          this.getAllControlType(false); // Refresh the list after successful creation
        },
        error: (error: ApiErrorPayload) => {
          this.isSubmitting.set(false);
          this.modalErrorMessage.set(this.apiService.extractApiErrorMessage(error) || 'An error occurred while creating the control type.');
          console.error('Error creating control type:', error);
        }
      });
  }

  openEditModal(controlType: ControlTypeModel) {
    console.log('Opening edit modal for control type:', controlType);
    this.isEditModalOpen.set(true);
    this.modalErrorMessage.set('');

    this.editForm.patchValue({
      id: controlType.id,
      name: controlType.name
    });
  }
  submitEditForm() {
    if (this.editForm.invalid) {
      this.modalErrorMessage.set('Please fill in all required fields.');
      this.editForm.markAllAsTouched();
      return;
    }
    const formValue = this.editForm.getRawValue();
    const payload: ControlTypeUpdateRequest = {
      name: formValue.name ?? ''
    };
    console.log('Submitting edit form with payload:', payload, 'for control type ID:', formValue.id);
    this.isSubmitting.set(true);
    this.controlTypeService.updateControlType(formValue.id ?? 0, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          const updatedControlType = response.data;
          this.controlTypes.set(this.controlTypes().map((controlType) =>
            controlType.id === formValue.id
              ? { ...controlType, ...updatedControlType, name: payload.name }
              : controlType
          ));
          this.closeEditModal();
          this.getAllControlType(false); // Refresh the list after successful update
        },
        error: (error: ApiErrorPayload) => {
          this.isSubmitting.set(false);
          this.modalErrorMessage.set(this.apiService.extractApiErrorMessage(error) || 'An error occurred while updating the control type.');
          console.error('Error updating control type:', error);
        }
      });
  }

  closeEditModal() {
    this.isEditModalOpen.set(false);
    this.modalErrorMessage.set('');
    this.editForm.reset({
      id: 0,
      name: ''
    });
    this.cdr.detectChanges();
  }
  getAllControlType(showLoading = true) {
    if (showLoading) {
      this.isLoading.set(true);
    }
    const page = this.filter['page'] || 1;
    const params: any = { page, size: this.limit || 5 };
    if (this.searchQuery) {
      params.name = this.searchQuery;
    }
    this.controlTypeService.getAllControlType(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Control types fetched successfully:', response);
          this.errorMessage.set('');
          this.controlTypes.set(response.data);
          this.meta = response.meta;
          this.isLoading.set(false);
          this.cdr.detectChanges();
        },
        error: (error: ApiErrorPayload) => {
          this.errorMessage.set(this.apiService.extractApiErrorMessage(error) || 'An error occurred while fetching control types.');
          if (showLoading) {
            this.controlTypes.set([]);
          }
          this.isLoading.set(false);
          this.cdr.detectChanges();
          console.error('Error fetching control types:', error);
        }
      });
  }

  onPageChange(page: number) {
    this.filter['page'] = page;
    this.getAllControlType(false);
  }

  getSerialNumber(index: number): number {
    const currentPage = this.filter['page'] || 1;
    const itemsPerPage = this.meta?.size || 2;
    return (currentPage - 1) * itemsPerPage + index + 1;
  }

}
