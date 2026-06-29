import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FrameworkCategoryService } from '../../../../services/framework/framework-category/framework-category.service';
import { FrameworkCategory as FrameworkCategoryModel } from '../../../../services/framework/framework-category/framework-category.model';
import { PaginationMeta, QueryFilter } from '../../../../services/api/api-response.model';
import { Subject, takeUntil } from 'rxjs';
import { Card } from '../../../../shared/components/common/card/card';
import { PageBreadcrumb } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-framework-category',
  imports: [
    CommonModule,
    PageBreadcrumb,
    Card
  ],
  templateUrl: './framework-category.html',
  styleUrl: './framework-category.css',
})
export class FrameworkCategory {
    private frameworkCategoryService = inject(FrameworkCategoryService);

    private readonly cdr = inject(ChangeDetectorRef);
    private destroy$ = new Subject<void>();

    filter: QueryFilter = {};
    frameworkCategories: FrameworkCategoryModel[] = [];
    meta!: PaginationMeta;
    errorMessage = '';

    ngOnInit() {
      this.destroy$ = new Subject<void>();
      this.getAllFrameworkCategory();
    }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  getAllFrameworkCategory() {
      this.frameworkCategoryService.getAllFrameworkCategory({ page: 1, limit: 10 })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.errorMessage = '';
            this.frameworkCategories = [...response.data];
            this.meta = { ...response.meta };
            this.cdr.markForCheck(); // force view update after async data
          },
          error: (error) => {
            this.errorMessage = error?.error?.message || 'Unable to load framework categories.';
            this.frameworkCategories = [];
            this.cdr.markForCheck();
            console.error(error);
          },
        });
    }

}
