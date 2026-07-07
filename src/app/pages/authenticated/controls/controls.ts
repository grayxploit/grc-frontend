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
import { LoaderService } from '../../../services/loader/loader.service';

interface SeverityOption {
  value: ControlSeverity;
  label: string;
}

type ControlFormKind = 'create' | 'edit';

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
  private readonly loaderService = inject(LoaderService);
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
  frameworkSeverities: Record<string, ControlSeverity | ''> = {};

  isCreateModalOpen = false;
  isEditModalOpen = false;
  modalErrorMessage = '';
  isSubmitting = false;

  public createForm = this.formBuilder.group({
    title: ['', Validators.required],
    description: [''],
    frameworks: this.formBuilder.control<string[]>([], {
      validators: [Validators.required, Validators.minLength(1)],
      nonNullable: true,
    }),
    primary_control_area: [''],
    type: ['', Validators.required],
  });

  public editForm = this.formBuilder.group({
    id: ['', Validators.required],
    title: ['', Validators.required],
    description: [''],
    frameworks: this.formBuilder.control<string[]>([], {
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
    this.loaderService.show();
    this.controlService.getAllControl({ page: 1, limit: 10 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loaderService.hide();
          this.controls = [...response.data];
          this.meta = { ...response.meta };
          this.errorMessage = '';
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error(error);
          this.errorMessage = this.controlService.apiService.extractApiErrorMessage(error) || 'Unable to load controls.';
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
    this.frameworkService.getAllFramework({ page: 1, size: 100 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.frameworks = [...response.data];
          const selectedFrameworkIds = this.isEditModalOpen
            ? this.getSelectedFrameworkIds('edit')
            : this.getSelectedFrameworkIds('create');
          this.syncFrameworkSeverities(selectedFrameworkIds);
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
      frameworkId: frameworkId,
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
          this.modalErrorMessage = this.controlService.apiService.extractApiErrorMessage(error) || 'Unable to create control.';
          console.error(error);
        },
      });
  }

  toggleFrameworkSelection(frameworkId: string, selected: boolean, formKind: ControlFormKind = 'create') {
    const currentValues = this.getSelectedFrameworkIds(formKind);
    const nextValues = selected
      ? Array.from(new Set([...currentValues, frameworkId]))
      : currentValues.filter((value) => value !== frameworkId);

    this.getFrameworkControl(formKind).setValue(nextValues);
    this.getFrameworkControl(formKind).markAsDirty();
    this.getFrameworkControl(formKind).markAsTouched();
    this.syncFrameworkSeverities(nextValues);
  }

  isFrameworkSelected(frameworkId: string, formKind: ControlFormKind = 'create'): boolean {
    return this.getSelectedFrameworkIds(formKind).includes(frameworkId);
  }

  getSelectedFrameworks(): Framework[] {
    const selectedFrameworkIds = this.getSelectedFrameworkIds();
    return this.frameworks.filter((framework) => selectedFrameworkIds.includes(framework.id));
  }

  getFrameworkSeverityOptions(framework: Framework): SeverityOption[] {
    const allowedSeverities = this.getFrameworkSeverityLevels(framework);
    return this.allSeverityOptions.filter((option) => allowedSeverities.includes(option.value));
  }

  getFrameworkSeverity(frameworkId: string): ControlSeverity | '' {
    return this.frameworkSeverities[frameworkId] ?? '';
  }

  setFrameworkSeverity(frameworkId: string, severity: string) {
    this.frameworkSeverities = {
      ...this.frameworkSeverities,
      [frameworkId]: severity as ControlSeverity | '',
    };
  }

  getSeverityLabel(severity: ControlSeverity | string | undefined): string {
    return this.allSeverityOptions.find((option) => option.value === severity)?.label ?? '';
  }

  getFrameworkLabel(framework: Framework | FrameworkControl | string | undefined): string {
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

  private getFrameworkControl(formKind: ControlFormKind) {
    return formKind === 'create' ? this.createForm.controls.frameworks : this.editForm.controls.frameworks;
  }

  private getSelectedFrameworkIds(formKind: ControlFormKind = 'create'): string[] {
    return (this.getFrameworkControl(formKind).value ?? [])
      .map((value) => String(value))
      .filter((value) => value.length > 0);
  }

  private syncFrameworkSeverities(selectedFrameworkIds: string[]) {
    const nextFrameworkSeverities: Record<string, ControlSeverity | ''> = {};

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

  openEditModal(control: Control) {
    this.isEditModalOpen = true;
    this.modalErrorMessage = '';
    const selectedFrameworks = control.frameworks ?? [];
    const selectedFrameworkIds = selectedFrameworks
      .map((framework) => framework.framework_id)
      .filter((frameworkId): frameworkId is string => typeof frameworkId === 'string') ?? [];
    this.frameworkSeverities = selectedFrameworks.reduce<Record<string, ControlSeverity | ''>>((accumulator, framework) => {
      if (typeof framework.framework_id === 'string') {
        accumulator[framework.framework_id] = framework.severity;
      }

      return accumulator;
    }, {});
    this.editForm.patchValue({
      id: Number(control.id).toString(),
      title: control.title,
      description: control.description,
      frameworks: selectedFrameworkIds,
      primary_control_area: control.primary_control_area,
      type: Number(control.control_type.id).toString(),
    });
    this.syncFrameworkSeverities(selectedFrameworkIds);
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.modalErrorMessage = '';
    this.editForm.reset({
      title: '',
      description: '',
      frameworks: [],
      primary_control_area: '',
      type: '',
    });
  }

  submitEditForm() {
    if (this.editForm.invalid) {
      this.modalErrorMessage = 'Please fill in all required fields.';
      this.editForm.markAllAsTouched();
      return;
    }

    const formValue = this.editForm.getRawValue();
    const selectedFrameworkIds = this.getSelectedFrameworkIds('edit');
    const frameworks: CreateControlFramework[] = selectedFrameworkIds.map((frameworkId) => ({
      frameworkId: frameworkId,
      severity: this.frameworkSeverities[frameworkId] as ControlSeverity,
    }));

    if (frameworks.some((framework) => !framework.severity)) {
      this.modalErrorMessage = 'Please select a severity for each framework.';
      return;
    }

    const payload: Partial<CreateControl> = {
      title: formValue.title ?? '',
      description: formValue.description ?? '',
      frameworks,
      primary_control_area: formValue.primary_control_area ?? '',
      type: Number(formValue.type),
    };

    this.isSubmitting = true;
    this.modalErrorMessage = '';

    const controlId = Number(formValue.id);
    this.controlService.updateControl(controlId, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedControl) => {
          this.isSubmitting = false;
          const index = this.controls.findIndex((control) => control.id === updatedControl.id);
          if (index !== -1) {
            this.controls[index] = updatedControl;
          }
          this.closeEditModal();
          this.getAllControl();
        },
        error: (error) => {
          this.isSubmitting = false;
          this.modalErrorMessage = this.controlService.apiService.extractApiErrorMessage(error) || 'Unable to update control.';
          console.error(error);
        },
      });
  }

}
