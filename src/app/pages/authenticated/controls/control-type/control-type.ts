import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ControlTypeService } from '../../../../services/control/control-type/control-type.service';
import { Subject, takeUntil } from 'rxjs';
import { ApiErrorPayload, PaginationMeta, QueryFilter } from '../../../../services/api/api-response.model';
import { ControlTypeCreateRequest, ControlType as ControlTypeModel } from '../../../../services/control/control-type/control-type.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PageBreadcrumb } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb';
import { Card } from '../../../../shared/components/common/card/card';
import { ApiService } from '../../../../services/api/api.service';
@Component({
  selector: 'app-control-type',
  imports: [
    CommonModule,
    PageBreadcrumb,
    Card,
    ReactiveFormsModule
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
  }

  closeCreateModal() {
    this.isCreateModalOpen = false;
    this.modalErrorMessage = '';
  }

  submitCreateForm() {
    if (this.createForm.invalid) {
      this.modalErrorMessage = 'Please fill in all required fields.';
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
          this.closeCreateModal();
          this.getAllControlType(); // Refresh the list after successful creation
        },
        error: (error: ApiErrorPayload) => {
          this.isSubmitting = false;
          this.modalErrorMessage = this.apiService.extractApiErrorMessage(error) || 'An error occurred while creating the control type.';
          console.error('Error creating control type:', error);
        }
      });
  }

  openEditModal(controlType: ControlTypeModel) {
    this.isEditModalOpen = true;
    this.modalErrorMessage = '';
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.modalErrorMessage = '';
  }
  getAllControlType() {
    this.isLoading = true;
    this.controlTypeService.getAllControlType({ page: 1, limit: 10, filter: this.filter })
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
          this.controlTypes = [];
          this.isLoading = false;
          this.cdr.detectChanges();
          console.error('Error fetching control types:', error);
        }
      });
  }

  
}
