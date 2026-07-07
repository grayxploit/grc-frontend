import { Component, inject, signal } from '@angular/core';
import { Card } from '../../../shared/components/common/card/card';
import { PageBreadcrumb } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IndustryService } from '../../../services/industry/industry.service';
import { IndustryDropdownResponse } from '../../../services/industry/industry.model';

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
    public industries = signal<IndustryDropdownResponse[]>([]);
    public industriesLoading = signal<boolean>(false);
    public industriesError = signal<string>('');
    createOrganizationShow = signal<boolean>(true);
    modalErrormessage = signal<string>('');

    public organizationForm = this.formBuilder.group({
        name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9\s]+$/)]],
        email: ['',[Validators.required, Validators.email]],
        phone: ['',[Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
        address: ['',[Validators.required, Validators.minLength(10), Validators.maxLength(100)]],
        city: ['',[Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
        state: ['',[Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
        country: ['',[Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
        zipcode: ['',[Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
        industry: ['', [Validators.required, this.validIndustry.bind(this)]],
        website: ['',[Validators.required, Validators.pattern(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)]],

        product_name: ['',[Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9\s]+$/)]],
        
        product_description: ['',[Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
        product_type: ['',[Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9\s]+$/)]],
        
        
    });

    createOrganization() {
        if (!this.organizationForm.valid) {
            this.modalErrormessage.set('Please fill all required fields correctly.');
        } 

        
    }

    ngOnInit() {
        // Load industries for dropdown
        this.getAllIndustries();
    }

    validIndustry(control: any) {
        const selectedIndustry = control.value;
        const validIndustries = this.industries().map(ind => ind.name);
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
}
