import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageBreadcrumb } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb';
import { Card } from '../../../../shared/components/common/card/card';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ControlService } from '../../../../services/control/control.service';
import { InputFieldComponent } from '../../../../shared/components/form/input/input-field.component';
import { LabelComponent } from '../../../../shared/components/form/label/label.component';
import { TextAreaComponent } from '../../../../shared/components/form/input/text-area.component'
import { Router, RouterModule } from '@angular/router';
import { CreateControl as CreateControlType } from '../../../../services/control/control.model'
import { takeUntil } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-create-control',
  imports: [
    RouterModule,
    CommonModule,
    PageBreadcrumb,
    Card,
    ReactiveFormsModule,

  ],
  templateUrl: './create-control.html',
  styleUrl: './create-control.css',
})
export class CreateControl {
  private readonly formBuilder = inject(FormBuilder);
  private readonly controlService = inject(ControlService);
  private readonly router = inject(Router);
  public errorMessage = '';
  public isSubmitting = false;
  public controlForm = this.formBuilder.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
  })
  private destroyRef = inject(DestroyRef);
  public onSubmit() {
    if (this.controlForm.invalid) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }


    this.isSubmitting = true;
    this.controlService.createControl(this.controlForm.value as CreateControlType)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.router.navigate(['/controls']);
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.isSubmitting = false;
        }
      });
  }

}
