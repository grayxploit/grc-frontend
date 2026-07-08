import { Component, inject, signal } from '@angular/core';
import { Card } from '../../../shared/components/common/card/card';
import { PageBreadcrumb } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IndustryService } from '../../../services/industry/industry.service';
import { IndustryDropdownResponse } from '../../../services/industry/industry.model';
import { OrganizationService } from '../../../services/organization/organization.service';
import { CreateOrganizationRequest, GetOrganizationResponse, UpdateOrganizationRequest } from '../../../services/organization/organization.model';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-organization',
  imports: [
    CommonModule,
    PageBreadcrumb,
    Card,
    ReactiveFormsModule
  ],
  templateUrl: './organization.html',
  styleUrl: './organization.css',
})
export class Organization {
    private readonly formBuilder = inject(FormBuilder);
    private readonly router = inject(Router);
    private readonly industryService = inject(IndustryService);
    private readonly organizationService = inject(OrganizationService);
    private readonly authService = inject(AuthService);
    public industries = signal<IndustryDropdownResponse[]>([]);
    public industriesLoading = signal<boolean>(false);
    public industriesError = signal<string>('');
    public organization = signal<GetOrganizationResponse | null>(null);
    public errorMessage = signal<string>('');
    createOrganizationShow = signal<boolean>(true);
    modalErrormessage = signal<string>('');
    isSubmitting = signal<boolean>(false);
    productTypes = signal([
        { key: 'web', value: 'Web Application' },
        { key: 'network', value: 'Network' },
        { key: 'software', value: 'Software' },
        { key: 'mobile', value: 'Mobile Application' },
    ]);
  
    public organizationForm = this.formBuilder.group({
        name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9\s\-\.]+$/)]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
        address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
        city: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
        state: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
        country: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
        zipcode: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9\- ]{3,10}$/)]],
        industry: ['', [Validators.required, this.validIndustry.bind(this)]],
        website: ['', [Validators.required, Validators.pattern(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)]],

        product_name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern(/^[a-zA-Z0-9\s\-\.]+$/)]],
        product_description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
        product_type: ['', [Validators.required]],
    });


    public editOrganizationForm = this.formBuilder.group({
        name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9\s\-\.]+$/)]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
        address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
        city: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
        state: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
        country: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
        zipcode: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9\- ]{3,10}$/)]],
        industry: ['', [Validators.required, this.validIndustry.bind(this)]],
        website: ['', [Validators.required, Validators.pattern(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)]],

        
    });

    createOrganization() {
        if (!this.organizationForm.valid) {
            this.modalErrormessage.set('Please fill all required fields correctly.');
            return;
        }

        this.isSubmitting.set(true);
        this.modalErrormessage.set('');

        const organizationData = this.organizationForm.value as CreateOrganizationRequest;

        this.organizationService.createOrganization(organizationData).subscribe({
            next: (response) => {
                this.isSubmitting.set(false);
                this.createOrganizationShow.set(false);
                this.getOrganization();
            },
            error: (error) => {
                this.isSubmitting.set(false);
                const err = this.organizationService.apiService.extractApiErrorMessage(error);
                this.modalErrormessage.set(err || 'Failed to create organization. Please try again.');
            }
        });
    }

    ngOnInit() {

        // Load industries for dropdown
        this.getAllIndustries();
        this.getOrganization();
    }

    validIndustry(control: any) {
        const selectedIndustry = control.value;
        const validIndustries = this.industries().map(ind => ind.id);
        if (!selectedIndustry || !validIndustries.includes(selectedIndustry)) {
            return { invalidIndustry: true };
        }
        return null;
    }

    getAllIndustries() {
        this.industriesLoading.set(true);
       this.industryService.getAllIndustriesForDropdown().subscribe({
        next: (response) => {
            this.industries.set(response.data);
            this.industriesError.set('');
            this.industriesLoading.set(false);
        },
        error: (error) => {
            this.industriesError.set('Failed to load industries');
            this.industriesLoading.set(false);
        },
        complete: () => {
            this.industriesLoading.set(false);
        }
       });
    }

    getOrganization() {
        this.isSubmitting.set(true);

        this.modalErrormessage.set('');
        this.organizationService.getOrganization().subscribe({
            next: (response) => {
                this.organization.set(response.data);
                this.isSubmitting.set(false);
                this.createOrganizationShow.set(false);
                this.editOrganizationForm.patchValue({
                    name: response.data.name,
                    email: response.data.email,
                    phone: response.data.phone,
                    city: response.data.city || '',
                    state: response.data.state || '',
                    country: response.data.country || '',
                    zipcode: response.data.zip_code || '',
                    address: response.data.address,
                    industry: response.data.industry.id,
                    website: response.data.website,
                    
                });
            },
            error: (error) => {
                const err = this.organizationService.apiService.extractApiErrorMessage(error);
                this.errorMessage.set(err || 'Failed to load organization');
                this.isSubmitting.set(false);
            },
            complete: () => {
                this.isSubmitting.set(false);
            }
        });
    }


    onLogout() {
        this.authService.logout().subscribe({
            next: () => {
                this.router.navigate(['/login']);
                this.createOrganizationShow.set(false);
            },
            error: (error) => {
                console.error('Logout failed:', error);
                this.router.navigate(['/login']);
            }
        });
    }


    editOrganization() {
        if (!this.editOrganizationForm.valid) {
            this.modalErrormessage.set('Please fill all required fields correctly.');
            return;
        }

        this.isSubmitting.set(true);
        this.modalErrormessage.set('');

        const organizationData = this.editOrganizationForm.value as UpdateOrganizationRequest;

        this.organizationService.updateOrganization(organizationData).subscribe({
            next: (response) => {
                this.isSubmitting.set(false);
                this.getOrganization();
                this.createOrganizationShow.set(false);
            },
            error: (error) => {
                const err = this.organizationService.apiService.extractApiErrorMessage(error);
                this.modalErrormessage.set(err || 'Failed to update organization. Please try again.');
                this.isSubmitting.set(false);
            },
            complete: () => {
                this.isSubmitting.set(false);
            }
        });
    }

         
}
