import { Component, inject, signal } from '@angular/core';
import { Logo } from '../../../shared/components/common/logo/logo';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth/auth.service';
@Component({
  selector: 'app-forgot-password',
  imports: [
    CommonModule,
    Logo,
    ReactiveFormsModule
  ],
  
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  public readonly applicationName = environment.applicationName;
  private readonly formBuilder = inject(FormBuilder)
  public readonly forgotPasswordForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
  });
  public errorMessage = signal<string>('');
  public successMessage = signal<string>('');
  public isSubmitting = signal<boolean>(false);

  public onSubmit() {
    this.errorMessage.set('');
    this.successMessage.set('');
    if (this.forgotPasswordForm.invalid) {
      this.errorMessage.set('Please fill in all fields');
      this.isSubmitting.set(false);
      return;
    }

    this.errorMessage.set('');
    this.isSubmitting.set(true);
    this.successMessage.set('');
    this.authService.forgotPassword(this.forgotPasswordForm.value.email as string)
      .subscribe({
        next: (response) => {
          this.successMessage.set(response.message);
          this.isSubmitting.set(false);
          this.forgotPasswordForm.reset();
        },
        error: (error) => {
          const err = this.authService.apiService.extractApiErrorMessage(error);
          this.errorMessage.set(err || 'An error occurred. Please try again.');
          this.isSubmitting.set(false);
        }
      });
  }


  onLogin() {
    // Navigate to login page
    this.router.navigate(['/login']);
  }
}
