import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Logo } from '../../../shared/components/common/logo/logo';
import { PageBreadcrumb } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb';
import { Card } from '../../../shared/components/common/card/card';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-organization',
  imports: [
    CommonModule,
    PageBreadcrumb,
    Card,
],
  templateUrl: './create-organization.html',
  styleUrl: './create-organization.css',
})
export class CreateOrganization {
    private readonly formBuilder = inject(FormBuilder);
    private readonly router = inject(Router);
    

createOrganizationShow = signal<boolean>(true);

    public readonly createOrganizationForm = this.formBuilder.group({
        name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
        address: ['', [Validators.required]],
        city: ['', [Validators.required]],
        state: ['', [Validators.required]],
        zip_code: ['', [Validators.required]],
        country: ['', [Validators.required]],
        website: ['', [Validators.required, Validators.pattern(/^(https?:\/\/)?([\w-]+(\.[\w-]+)+)([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/)]],
        description: ['', [Validators.required]],
        industry: ['', [Validators.required]],
        

        project: ['', [Validators.required]],
        type: ['', [Validators.required]],
        
    });
  public onSubmit(): void {
    
  }
}
