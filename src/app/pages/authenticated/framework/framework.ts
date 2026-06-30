import { Component } from '@angular/core';
import { PageBreadcrumb } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb';
import { Card } from '../../../shared/components/common/card/card';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-framework',
  imports: [
    CommonModule,
    PageBreadcrumb,
    Card
  ],
  templateUrl: './framework.html',
  styleUrl: './framework.css',
})
export class Framework {}
