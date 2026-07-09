import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, Optional, Self, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

@Component({
  selector: 'app-input-field',
  imports: [CommonModule],
  template: `
    <div class="relative">
      <input
        [type]="type"
        [id]="id"
        [name]="name"
        [placeholder]="placeholder"
        [value]="value"
        [min]="min"
        [max]="max"
        [step]="step"
        [disabled]="disabled"
        [ngClass]="inputClasses"
        (input)="onInput($event)"
        (blur)="onBlur()"
      />

      @if (errorMessage) {
      <p class="mt-1.5 text-sm"
        [ngClass]="{
          'text-red-600 dark:text-red-400': isError,
          'text-success-500': success,
          'text-gray-500': !isError && !success
        }">
        {{ errorMessage }}
      </p>
      }
    </div>
  `,
})
export class InputFieldComponent implements ControlValueAccessor {

  @Input() type: string = 'text';
  @Input() id?: string = '';
  @Input() name?: string = '';
  @Input() placeholder?: string = '';
  @Input() value: string | number = '';
  @Input() min?: string;
  @Input() max?: string;
  @Input() step?: number;
  @Input() disabled: boolean = false;
  @Input() success: boolean = false;
  @Input() error: boolean = false;
  @Input() hint?: string;
  @Input() className: string = '';

  @Output() valueChange = new EventEmitter<string | number>();

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(
    @Optional() @Self() public ngControl: NgControl,
    private cdr: ChangeDetectorRef
  ) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  get isError(): boolean {
    return !!(this.error || (this.ngControl && this.ngControl.control && this.ngControl.control.invalid && this.ngControl.control.touched));
  }

  get errorMessage(): string | undefined {
    if (this.isError && this.ngControl && this.ngControl.control && this.ngControl.control.errors) {
      const errors = this.ngControl.control.errors;
      if (errors['required']) {
        return 'This field is required';
      }
      if (errors['email']) {
        return 'Please enter a valid email address';
      }
    }
    return this.hint;
  }

  get inputClasses(): string {
    let inputClasses = `h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${this.className}`;

    if (this.disabled) {
      inputClasses += ` text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 opacity-40`;
    } else if (this.isError) {
      inputClasses += ` border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:text-red-400 dark:border-red-500 dark:focus:border-red-800`;
    } else if (this.success) {
      inputClasses += ` border-success-500 focus:border-success-300 focus:ring-success-500/20 dark:text-success-400 dark:border-success-500 dark:focus:border-brand-800`;
    } else {
      inputClasses += ` bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90  dark:focus:border-brand-800`;
    }
    return inputClasses;
  }

  writeValue(value: any): void {
    this.value = value !== undefined && value !== null ? value : '';
    this.cdr.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const val = this.type === 'number' ? +input.value : input.value;
    this.value = val;
    this.valueChange.emit(val);
    this.onChange(val);
    this.cdr.markForCheck();
  }

  onBlur() {
    this.onTouched();
    this.cdr.markForCheck();
  }
}
