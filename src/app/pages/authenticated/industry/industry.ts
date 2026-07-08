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
import { Modal } from '../../../shared/components/ui/modal/modal';
@Component({
  selector: 'app-industry',
  imports: [
    CommonModule,
    PageBreadcrumb,
    Card,
    ReactiveFormsModule,
    Pagination,
    Modal
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
    searchQuery = '';
    limit = 5;
    limitOptions = [ 5, 10, 20, 50, 100];
    industries = signal<IndustryModel[]>([]);
    meta!: PaginationMeta;
    errorMessage = signal<string | null>(null);
    isSubmitting = signal(false);
    showCreateModal = signal(false);
    showEditModal = signal(false);
    modalErrorMessage = signal<string | null>(null);
    public createIndustryForm = this.formBuilder.group({
        name: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9\\s]+$')]],
        
    });

    public editIndustryForm = this.formBuilder.group({
        id: [''],
        name: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9\\s]+$')]],
        
    });

    public searchForm = this.formBuilder.group({
        search: ['']
    });
  
    ngOnInit() {
      console.log('Industry component initialized');
      this.loadIndustries();
    }

    loadIndustries() {
      const page = this.filter['page'] || 1;
      const params: any = { page, size: this.limit || 5 };
      if (this.searchQuery) {
        params.name = this.searchQuery;
      }
      console.log('Loading industries with params:', params);
      this.industryService.getAllIndustries(params)
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
      this.editIndustryForm.markAsUntouched();
      this.isSubmitting.set(false);
    }

    closeEditModal() {
      this.showEditModal.set(false);
      this.editIndustryForm.reset();
      this.modalErrorMessage.set(null);
      this.editIndustryForm.markAllAsTouched();
      this.isSubmitting.set(false);
    }
    
    openCreateModal() {
      this.isSubmitting.set(false);
      this.showCreateModal.set(false);
      console.log('Create modal');
      this.modalErrorMessage.set(null);
      this.showCreateModal.set(true);
      this.createIndustryForm.reset();
      this.createIndustryForm.markAsUntouched();
    }

    closeCreateModal() {
      this.showCreateModal.set(false);
      this.createIndustryForm.reset();
      this.modalErrorMessage.set(null);
      this.createIndustryForm.markAsUntouched();
      this.isSubmitting.set(false);
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

    onSearch() {
        this.searchQuery = this.searchForm.value.search || '';
        this.filter['page'] = 1;
        this.loadIndustries();
    }

    onLimitChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        this.limit = Number(select.value);
        this.filter['page'] = 1;
        this.loadIndustries();
    }

    clearSearch() {
        this.searchForm.patchValue({ search: '' });
        this.searchQuery = '';
        this.filter['page'] = 1;
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
