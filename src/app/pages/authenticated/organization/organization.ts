import { Component, inject, signal } from '@angular/core';
import { Card } from '../../../shared/components/common/card/card';
import { PageBreadcrumb } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-organization',
  imports: [
    CommonModule,
    PageBreadcrumb,
    Card,
  ],
  templateUrl: './organization.html',
  styleUrl: './organization.css',
})
export class Organization {
    private readonly formBuilder = inject(FormBuilder);
    private readonly router = inject(Router);


    createOrganizationShow = signal<boolean>(true);
}
