import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageBreadcrumb } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb';
import { Card } from '../../../shared/components/common/card/card';
@Component({
  selector: 'app-controls',
  imports: [
    CommonModule,
    PageBreadcrumb,
    Card
  ],
  templateUrl: './controls.html',
  styleUrl: './controls.css',
})
export class Controls { }
