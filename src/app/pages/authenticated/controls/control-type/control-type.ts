import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ControlTypeService } from '../../../../services/control/control-type/control-type.service';
import { Subject, takeUntil } from 'rxjs';
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


  isLoading = false; // Flag to indicate if data is being loaded

  // List properties
  filter: QueryFilter = {};
  controlTypes: ControlTypeModel[] = [];
  meta!: PaginationMeta;
  errorMessage = '';

  // Modal properties
  isCreateModalOpen = false;
  isEditModalOpen = false;
  modalErrorMessage = '';
  //  Form submission properties
  isSubmitting = false;
  private readonly formBuilder = inject(FormBuilder);

  public createForm = this.formBuilder.group({
    name: ['', Validators.required],
  });

  public editForm = this.formBuilder.group({
    id: [0, Validators.required],
    name: ['', Validators.required],
  });
  ngOnInit() {
    this.destroy$ = new Subject<void>();
    this.getAllControlType();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openCreateModal() {
    this.isCreateModalOpen = true;
    this.modalErrorMessage = '';
    this.createForm.reset({
      name: ''
    });
  }

  closeCreateModal() {
    this.isCreateModalOpen = false;
    this.modalErrorMessage = '';
    this.createForm.reset({
      name: ''
    });
    this.cdr.detectChanges();
  }

  submitCreateForm() {
    if (this.createForm.invalid) {
      this.modalErrorMessage = 'Please fill in all required fields.';
      this.createForm.markAllAsTouched();
      return;
    }
    const formValue = this.createForm.value;
    const payload: ControlTypeCreateRequest = {
      name: formValue.name ?? ''
    };
    this.isSubmitting = true;
    this.controlTypeService.createControlType(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isSubmitting = false;
          const createdControlType = response.data;
          if (createdControlType) {
            this.controlTypes = [
              { ...createdControlType, name: payload.name },
              ...this.controlTypes
            ];
          }
          this.closeCreateModal();
          this.getAllControlType(false); // Refresh the list after successful creation
        },
        error: (error: ApiErrorPayload) => {
          this.isSubmitting = false;
          this.modalErrorMessage = this.apiService.extractApiErrorMessage(error) || 'An error occurred while creating the control type.';
          console.error('Error creating control type:', error);
        }
      });
  }

  openEditModal(controlType: ControlTypeModel) {
    console.log('Opening edit modal for control type:', controlType);
    this.isEditModalOpen = true;
    this.modalErrorMessage = '';

    this.editForm.patchValue({
      id: controlType.id,
      name: controlType.name
    });
  }
  submitEditForm() {
    if (this.editForm.invalid) {
      this.modalErrorMessage = 'Please fill in all required fields.';
      this.editForm.markAllAsTouched();
      return;
    }
    const formValue = this.editForm.getRawValue();
    const payload: ControlTypeUpdateRequest = {
      name: formValue.name ?? ''
    };
    console.log('Submitting edit form with payload:', payload, 'for control type ID:', formValue.id);
    this.isSubmitting = true;
    this.controlTypeService.updateControlType(formValue.id ?? 0, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isSubmitting = false;
          const updatedControlType = response.data;
          this.controlTypes = this.controlTypes.map((controlType) =>
            controlType.id === formValue.id
              ? { ...controlType, ...updatedControlType, name: payload.name }
              : controlType
          );
          this.closeEditModal();
          this.getAllControlType(false); // Refresh the list after successful update
        },
        error: (error: ApiErrorPayload) => {
          this.isSubmitting = false;
          this.modalErrorMessage = this.apiService.extractApiErrorMessage(error) || 'An error occurred while updating the control type.';
          console.error('Error updating control type:', error);
        }
      });
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.modalErrorMessage = '';
    this.editForm.reset({
      id: 0,
      name: ''
    });
    this.cdr.detectChanges();
  }
  getAllControlType(showLoading = true) {
    if (showLoading) {
      this.isLoading = true;
    }
    const page = this.filter['page'] || 1;
    this.controlTypeService.getAllControlType({ page: page, limit: 3, filter: this.filter })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Control types fetched successfully:', response);
          this.errorMessage = '';
          this.controlTypes = [...response.data];
          this.meta = response.meta;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error: ApiErrorPayload) => {
          this.errorMessage = this.apiService.extractApiErrorMessage(error) || 'An error occurred while fetching control types.';
          if (showLoading) {
            this.controlTypes = [];
          }
          this.isLoading = false;
          this.cdr.detectChanges();
          console.error('Error fetching control types:', error);
        }
      });
  }

   onPageChange(page: number) {
        this.filter['page'] = page;
        this.getAllControlType(false);
    }
  
}
