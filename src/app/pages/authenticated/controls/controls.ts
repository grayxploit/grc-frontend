import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageBreadcrumb } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb';
import { Card } from '../../../shared/components/common/card/card';
import { ControlService } from '../../../services/control/control.service';
import { QueryFilter, PaginationMeta } from '../../../services/api/api-response.model';
import { Control } from '../../../services/control/control.model';
import { Subject, takeUntil } from 'rxjs';

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
export class Controls implements OnInit, OnDestroy {
  private readonly controlService = inject(ControlService);
  private readonly cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  filter: QueryFilter = {};
  controls: Control[] = [];
  meta!: PaginationMeta;

  ngOnInit() {
    this.destroy$ = new Subject<void>();
    this.getAllControl();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getAllControl() {
    this.controlService.getAllControl({ page: 1, limit: 10 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.controls = [...response.data];
          this.meta = { ...response.meta };
          this.cdr.markForCheck(); // force view update after async data
        },
        error: (error) => console.error(error),
      });
  }
}

