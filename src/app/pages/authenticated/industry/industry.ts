import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from "@angular/router";
import { PageBreadcrumb } from "../../../shared/components/common/page-breadcrumb/page-breadcrumb";
import { Card } from "../../../shared/components/common/card/card";
import { PaginationMeta, QueryFilter } from '../../../services/api/api-response.model';
import { IndustryCreateRequest, Industry  as IndustryModel} from '../../../services/industry/industry.model';
import { IndustryService } from '../../../services/industry/industry.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Pagination } from '../../../shared/components/common/pagination/pagination';
@Component({
  selector: 'app-industry',
  imports: [
    CommonModule,
    PageBreadcrumb,
    Card,
    ReactiveFormsModule,
    Pagination
  ],
  templateUrl: './industry.html',
  styleUrl: './industry.css',
})
export class Industry {
    private readonly formBuilder = inject(FormBuilder);
    private readonly industryService = inject(IndustryService);
    private readonly cdr = inject(ChangeDetectorRef);
    isLoading = false;
    filter: QueryFilter = {};
    industries = signal<IndustryModel[]>([]);
    meta!: PaginationMeta;
    errorMessage = signal<string | null>(null);
    isSubmitting = signal(false);
    showCreateModal = signal(false);
    showEditModal = signal(false);
    modalErrorMessage = signal<string | null>(null);
    public createIndustryForm = this.formBuilder.group({
        name: ['', [Validators.required]],
        
    });

    public editIndustryForm = this.formBuilder.group({
        id: [0 as number],
        name: ['', [Validators.required]],
        
    });
  
    ngOnInit() {
      console.log('Industry component initialized');
      this.loadIndustries();
    }

    loadIndustries() {
      const page = this.filter['page'] || 1;
      this.industryService.getAllIndustries({ page, limit: 10 })
        .subscribe({
          next: (response) => {
            this.industries.set(response.data);
            this.meta = response.meta;
            this.cdr.markForCheck();
          },
          error: (error) => {
            this.errorMessage.set(error?.error?.message || 'Unable to load industries.');
            this.cdr.markForCheck();
          }
        });
    }

    openEditModal(industry: IndustryModel) {
      console.log('Edit modal', industry);
      this.showEditModal.set(true);
      this.modalErrorMessage.set(null);
      this.editIndustryForm.patchValue({
        id: industry.id,
        name: industry.name
      });
    }

    closeEditModal() {
      this.showEditModal.set(false);
      this.editIndustryForm.reset();
      this.modalErrorMessage.set(null);
      this.editIndustryForm.markAllAsTouched();
    }
    
    openCreateModal() {
      this.isSubmitting.set(false);
      this.showCreateModal.set(false);
      console.log('Create modal');
      this.modalErrorMessage.set(null);
      this.showCreateModal.set(true);
    }

    closeCreateModal() {
      this.showCreateModal.set(false);
      this.createIndustryForm.reset();
      this.modalErrorMessage.set(null);
      this.createIndustryForm.markAllAsTouched();
    }

    submitCreateForm() {
       if (this.createIndustryForm.invalid) {
        this.modalErrorMessage.set('Please fill in all required fields.');
        this.createIndustryForm.markAllAsTouched();
        return;
       }

       this.isSubmitting.set(true);
       const value = this.createIndustryForm.value;
       const payload: IndustryCreateRequest = {
        name: value.name ?? '',
       };
       this.industryService.createIndustry(payload).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          this.showCreateModal.set(false);
          this.loadIndustries();
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.modalErrorMessage.set(error?.error?.message || 'Unable to create industry.');
          this.cdr.markForCheck();
        }
       });
    }

    onPageChange(page: number) {
        this.filter['page'] = page;
        this.loadIndustries();
    }

    getSerialNumber(index: number): number {
        const currentPage = this.filter['page'] || 1;
        const itemsPerPage = this.meta?.size || 2;
        return (currentPage - 1) * itemsPerPage + index + 1;
    }

    submitEditForm() {
        if (this.editIndustryForm.invalid) {
            this.modalErrorMessage.set('Please fill in all required fields.');
            this.editIndustryForm.markAllAsTouched();
            return;
        }

        this.isSubmitting.set(true);
        const value = this.editIndustryForm.value;
        const payload: IndustryCreateRequest = {
            name: value.name ?? '',
        };
        this.industryService.updateIndustry(value.id!, payload).subscribe({
            next: (response) => {
                this.isSubmitting.set(false);
                this.showEditModal.set(false);
                this.loadIndustries();
            },
            error: (error) => {
                this.isSubmitting.set(false);
                this.modalErrorMessage.set(error?.error?.message || 'Unable to update industry.');
                this.cdr.markForCheck();
            }
        });
    }
}
