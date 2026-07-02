import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { PageBreadcrumb } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb';
import { Card } from '../../../shared/components/common/card/card';
import { ControlService } from '../../../services/control/control.service';
import { Control, ControlSeverity, CreateControl, CreateControlFramework, FrameworkControl } from '../../../services/control/control.model';
import { QueryFilter, PaginationMeta } from '../../../services/api/api-response.model';
import { ControlTypeService } from '../../../services/control/control-type/control-type.service';
import { ControlType } from '../../../services/control/control-type/control-type.model';
import { FrameworkService } from '../../../services/framework/framework.service';
import { Framework } from '../../../services/framework/framework.model';

interface SeverityOption {
  value: ControlSeverity;
  label: string;
}

@Component({
  selector: 'app-controls',
  imports: [
    CommonModule,
    PageBreadcrumb,
    Card,
    ReactiveFormsModule,
  ],
  templateUrl: './controls.html',
  styleUrl: './controls.css',
})
export class Controls implements OnInit, OnDestroy {
  private readonly controlService = inject(ControlService);
  private readonly frameworkService = inject(FrameworkService);
  private readonly controlTypeService = inject(ControlTypeService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly formBuilder = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  public readonly allSeverityOptions: SeverityOption[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  isLoading = false;
  filter: QueryFilter = {};
  controls: Control[] = [];
  meta!: PaginationMeta;
  errorMessage = '';

  controlTypes: ControlType[] = [];
  frameworks: Framework[] = [];
  frameworkSeverities: Record<number, ControlSeverity | ''> = {};

  isCreateModalOpen = false;
  isEditModalOpen = false;
  modalErrorMessage = '';
  isSubmitting = false;

  public createForm = this.formBuilder.group({
    title: ['', Validators.required],
    description: [''],
    frameworks: this.formBuilder.control<number[]>([], {
      validators: [Validators.required, Validators.minLength(1)],
      nonNullable: true,
    }),
    primary_control_area: [''],
    type: ['', Validators.required],
  });

  ngOnInit() {
    this.destroy$ = new Subject<void>();
    this.loadControlTypes();
    this.loadFrameworks();
    this.getAllControl();

    this.createForm.controls.frameworks.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((frameworkIds) => this.syncFrameworkSeverities(frameworkIds ?? []));
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
          this.errorMessage = '';
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error(error);
          this.errorMessage = this.extractApiErrorMessage(error) || 'Unable to load controls.';
          this.cdr.markForCheck();
        },
      });
  }

  private loadControlTypes() {
    this.controlTypeService.getAllControlType({ page: 1, limit: 100 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.controlTypes = [...response.data];
        },
        error: (error) => console.error(error),
      });
  }

  private loadFrameworks() {
    this.frameworkService.getAllFramework({ page: 1, limit: 100 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.frameworks = [...response.data];
          this.syncFrameworkSeverities(this.getSelectedFrameworkIds());
        },
        error: (error) => console.error(error),
      });
  }

  openCreateModal() {
    this.isCreateModalOpen = true;
    this.modalErrorMessage = '';
    this.createForm.reset({
      title: '',
      description: '',
      frameworks: [],
      primary_control_area: '',
      type: '',
    });
    this.frameworkSeverities = {};
  }

  closeCreateModal() {
    this.isCreateModalOpen = false;
    this.modalErrorMessage = '';
    this.createForm.reset({
      title: '',
      description: '',
      frameworks: [],
      primary_control_area: '',
      type: '',
    });
    this.frameworkSeverities = {};
    this.cdr.detectChanges();
  }

  submitCreateForm() {
    if (this.createForm.invalid) {
      this.modalErrorMessage = 'Please fill in all required fields.';
      this.createForm.markAllAsTouched();
      return;
    }

    const formValue = this.createForm.getRawValue();
    const selectedFrameworkIds = this.getSelectedFrameworkIds();
    const frameworks: CreateControlFramework[] = selectedFrameworkIds.map((frameworkId) => ({
      frameworlId: frameworkId,
      severity: this.frameworkSeverities[frameworkId] as ControlSeverity,
    }));

    if (frameworks.some((framework) => !framework.severity)) {
      this.modalErrorMessage = 'Please select a severity for each framework.';
      return;
    }

    const payload: CreateControl = {
      title: formValue.title ?? '',
      description: formValue.description ?? '',
      frameworks,
      primary_control_area: formValue.primary_control_area ?? '',
      type: Number(formValue.type),
    };

    this.isSubmitting = true;
    this.modalErrorMessage = '';

    this.controlService.createControl(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (createdControl) => {
          this.isSubmitting = false;
          this.controls = [createdControl, ...this.controls];
          this.closeCreateModal();
          this.getAllControl();
        },
        error: (error) => {
          this.isSubmitting = false;
          this.modalErrorMessage = this.extractApiErrorMessage(error) || 'Unable to create control.';
          console.error(error);
        },
      });
  }

  toggleFrameworkSelection(frameworkId: number, selected: boolean) {
    const currentValues = this.getSelectedFrameworkIds();
    const nextValues = selected
      ? Array.from(new Set([...currentValues, frameworkId]))
      : currentValues.filter((value) => value !== frameworkId);

    this.createForm.controls.frameworks.setValue(nextValues);
    this.createForm.controls.frameworks.markAsDirty();
    this.createForm.controls.frameworks.markAsTouched();
    this.syncFrameworkSeverities(nextValues);
  }

  isFrameworkSelected(frameworkId: number): boolean {
    return this.getSelectedFrameworkIds().includes(frameworkId);
  }

  getSelectedFrameworks(): Framework[] {
    const selectedFrameworkIds = this.getSelectedFrameworkIds();
    return this.frameworks.filter((framework) => selectedFrameworkIds.includes(framework.id));
  }

  getFrameworkSeverityOptions(framework: Framework): SeverityOption[] {
    const allowedSeverities = this.getFrameworkSeverityLevels(framework);
    return this.allSeverityOptions.filter((option) => allowedSeverities.includes(option.value));
  }

  getFrameworkSeverity(frameworkId: number): ControlSeverity | '' {
    return this.frameworkSeverities[frameworkId] ?? '';
  }

  setFrameworkSeverity(frameworkId: number, severity: string) {
    this.frameworkSeverities = {
      ...this.frameworkSeverities,
      [frameworkId]: severity as ControlSeverity | '',
    };
  }

  getSeverityLabel(severity: ControlSeverity | string | undefined): string {
    return this.allSeverityOptions.find((option) => option.value === severity)?.label ?? '';
  }

  getFrameworkLabel(framework: Framework | FrameworkControl | number | undefined): string {
    if (framework == null) {
      return '';
    }

    if (typeof framework === 'object') {
      const frameworkName = 'name' in framework ? framework.name : '';
      if (frameworkName) {
        return frameworkName;
      }

      const frameworkId = 'frameworlId' in framework
        ? framework.frameworlId
        : 'frameworkId' in framework
          ? framework.frameworkId
          : 'id' in framework
            ? framework.id
            : undefined;

      if (frameworkId != null) {
        return this.frameworks.find((item) => item.id === frameworkId)?.name ?? `Framework #${frameworkId}`;
      }

      return '';
    }

    return this.frameworks.find((item) => item.id === framework)?.name ?? `Framework #${framework}`;
  }

  getFrameworkCategoryLabel(category: Framework['category']): string {
    if (!category) {
      return '';
    }

    if (typeof category === 'object') {
      return category.name;
    }

    return String(category);
  }

  getControlTypeLabel(type: ControlType | number | undefined): string {
    if (type == null) {
      return '';
    }

    if (typeof type === 'object') {
      return type.name;
    }

    return this.controlTypes.find((item) => item.id === type)?.name ?? `Type #${type}`;
  }

  private getSelectedFrameworkIds(): number[] {
    return (this.createForm.controls.frameworks.value ?? [])
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));
  }

  private syncFrameworkSeverities(selectedFrameworkIds: number[]) {
    const nextFrameworkSeverities: Record<number, ControlSeverity | ''> = {};

    for (const frameworkId of selectedFrameworkIds) {
      const existingSeverity = this.frameworkSeverities[frameworkId];
      const framework = this.frameworks.find((item) => item.id === frameworkId);
      const allowedSeverities = framework ? this.getFrameworkSeverityLevels(framework) : this.allSeverityOptions.map((option) => option.value);
      const normalizedSeverity = allowedSeverities.includes(existingSeverity as ControlSeverity)
        ? existingSeverity
        : allowedSeverities[0] ?? '';

      nextFrameworkSeverities[frameworkId] = normalizedSeverity;
    }

    this.frameworkSeverities = nextFrameworkSeverities;
  }

  private getFrameworkSeverityLevels(framework: Framework): ControlSeverity[] {
    if (!framework.name) {
      return [];
    }

    const normalizedName = framework.name.trim().toLowerCase();

    if (normalizedName === 'pci dss' || framework.acronym?.toLowerCase() === 'pcidss') {
      return ['high'];
    }

    if (normalizedName === 'nist sp 800-53' || framework.acronym?.toLowerCase() === 'nist80053') {
      return ['low'];
    }

    return ['low', 'medium', 'high', 'critical'];
  }

  private extractApiErrorMessage(error: any): string | null {
    const detail = error?.error?.detail || error?.error;
    if (detail?.message) {
      return detail.message;
    }

    if (Array.isArray(detail?.errors) && detail.errors.length > 0) {
      return detail.errors.map((item: any) => item.message || '').filter(Boolean).join(' ');
    }

    if (Array.isArray(error?.error?.errors)) {
      return error.error.errors.map((item: any) => item.message || '').filter(Boolean).join(' ');
    }

    return error?.error?.message || error?.message || null;
  }
}
