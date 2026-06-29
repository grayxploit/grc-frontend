import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { PageBreadcrumb } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb';
import { Card } from '../../../../shared/components/common/card/card';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ControlService } from '../../../../services/control/control.service';
@Component({
  selector: 'app-import-control',
  imports: [
    RouterModule,
    CommonModule,
    PageBreadcrumb,
    Card,
    ReactiveFormsModule,
  ],
  templateUrl: './import-control.html',
  styleUrl: './import-control.css',
})
export class ImportControl {
  private readonly controlService = inject(ControlService);
  private readonly router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder)

  public importControlForm = this.formBuilder.group({
    file: ['', Validators.required]
  })

  onSubmit() {

  }


}
