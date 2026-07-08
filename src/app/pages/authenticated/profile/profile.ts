import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PageBreadcrumb } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb';
import { Card } from '../../../shared/components/common/card/card';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    PageBreadcrumb,
    Card
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {}
